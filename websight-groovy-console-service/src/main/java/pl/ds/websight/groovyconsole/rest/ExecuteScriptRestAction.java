package pl.ds.websight.groovyconsole.rest;

import groovy.lang.Binding;
import groovy.lang.GroovyShell;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.apache.commons.lang3.time.StopWatch;
import org.apache.sling.api.resource.ModifiableValueMap;
import org.apache.sling.api.resource.PersistenceException;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ValueMap;
import org.apache.sling.commons.classloader.DynamicClassLoaderManager;
import org.codehaus.groovy.control.CompilerConfiguration;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pl.ds.websight.groovyconsole.dto.ExecuteScriptResponseDto;
import pl.ds.websight.groovyconsole.extension.ScriptBase;
import pl.ds.websight.groovyconsole.service.AuthorizationService;
import pl.ds.websight.groovyconsole.service.CompilerConfigurationService;
import pl.ds.websight.rest.framework.RestAction;
import pl.ds.websight.rest.framework.RestActionResult;
import pl.ds.websight.rest.framework.annotations.SlingAction;

import javax.jcr.Session;
import java.io.StringWriter;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

@Component
@SlingAction
public class ExecuteScriptRestAction extends AbstractRestAction<ExecuteScriptRestModel, ExecuteScriptResponseDto>
        implements RestAction<ExecuteScriptRestModel, ExecuteScriptResponseDto> {

    private static final Logger LOG = LoggerFactory.getLogger(ExecuteScriptRestAction.class);
    private static final String UNAUTHORIZED_REQUEST_MESSAGE = "Unauthorized attempt to execute Groovy script";

    @Reference
    private AuthorizationService authorizationService;

    @Reference
    private CompilerConfigurationService compilerConfigurationService;

    @Reference
    private DynamicClassLoaderManager classLoaderManager;

    @Override
    protected RestActionResult<ExecuteScriptResponseDto> performAction(ExecuteScriptRestModel model) {
        Session session = model.getSession();
        if (!authorizationService.isAllowed(session)) {
            LOG.warn(UNAUTHORIZED_REQUEST_MESSAGE);
            return RestActionResult.failure(Messages.EXECUTE_SCRIPT_ERROR, Messages.EXECUTE_SCRIPT_ERROR_UNAUTHORIZED);
        }
        return RestActionResult.success(executeScript(model));
    }

    private ExecuteScriptResponseDto executeScript(ExecuteScriptRestModel model) {
        Object result = null;
        StringWriter stringWriter = new StringWriter();
        ScriptBase script = null;
        String stacktraceText = null;
        long runningTime;
        String finishedAt;
        StopWatch stopWatch = new StopWatch();
        try {
            stopWatch.start();
            script = parseScript(model, stringWriter);
            result = script.run();
        } catch (Throwable e) { // NOSONAR
            LOG.debug("Error while running Groovy script", e);
            stacktraceText = ExceptionUtils.getStackTrace(e);
        } finally {
            stopWatch.split();
            finishedAt = ZonedDateTime.now().format(DateTimeFormatter.ISO_INSTANT);
            runningTime = stopWatch.getSplitTime();
            if (script != null) {
                script.ungetRetrievedServiceReferences();
            }
            updateExecutionTime(model);
        }
        return new ExecuteScriptResponseDto(result, stringWriter, stacktraceText, runningTime, finishedAt);
    }

    private ScriptBase parseScript(ExecuteScriptRestModel model, StringWriter stringWriter) {
        Binding binding = compilerConfigurationService.getBinding(model, stringWriter);
        CompilerConfiguration compilerConfig = compilerConfigurationService.getCompilerConfiguration();

        GroovyShell shell = new GroovyShell(classLoaderManager.getDynamicClassLoader(), binding, compilerConfig);
        return (ScriptBase) shell.parse(model.getScript());
    }

    private static void updateExecutionTime(ExecuteScriptRestModel model) {
        Resource scriptResource = model.getScriptResource();
        if (scriptResource != null) {
            try {
                ValueMap properties = scriptResource.adaptTo(ModifiableValueMap.class);
                if (properties != null) {
                    properties.put("ws:lastExecuted", LocalDateTime.now().toString());
                    properties.put("ws:lastExecutedBy", model.getSession().getUserID());
                    model.getResourceResolver().commit();
                } else {
                    LOG.warn("Could not modify properties of {}", scriptResource.getPath());
                }
            } catch (PersistenceException e) {
                LOG.warn("Could not update ws:Executable mixin properties", e);
            }
        }
    }

    @Override
    protected String getUnexpectedErrorMessage() {
        return Messages.EXECUTE_SCRIPT_ERROR;
    }

}
