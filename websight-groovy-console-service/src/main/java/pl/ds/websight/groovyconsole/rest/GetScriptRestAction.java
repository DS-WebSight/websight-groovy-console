package pl.ds.websight.groovyconsole.rest;

import org.apache.commons.io.IOUtils;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;
import org.osgi.service.component.annotations.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pl.ds.websight.rest.framework.RestAction;
import pl.ds.websight.rest.framework.RestActionResult;
import pl.ds.websight.rest.framework.annotations.SlingAction;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import static pl.ds.websight.rest.framework.annotations.SlingAction.HttpMethod.GET;

@Component
@SlingAction(GET)
public class GetScriptRestAction extends AbstractRestAction<GetScriptRestModel, String> implements RestAction<GetScriptRestModel, String> {

    private static final Logger LOG = LoggerFactory.getLogger(GetScriptRestAction.class);

    @Override
    protected RestActionResult<String> performAction(GetScriptRestModel model) {
        ResourceResolver resourceResolver = model.getResourceResolver();
        String path = model.getPath();
        Resource scriptResource = resourceResolver.getResource(path);
        if (scriptResource == null) {
            LOG.warn("Could not get script resource from {}", path);
            return RestActionResult.failure(
                    Messages.GET_SCRIPT_ERROR,
                    Messages.formatMessage(Messages.GET_SCRIPT_ERROR_NOT_FOUND_DETAILS, path));
        }
        try (InputStream script = scriptResource.adaptTo(InputStream.class)) {
            if (script != null) {
                return RestActionResult.success(IOUtils.toString(script, StandardCharsets.UTF_8.toString()));
            }
        } catch (IOException e) {
            LOG.warn("Could not get script content from {}", path, e);
        }
        return RestActionResult.failure(Messages.GET_SCRIPT_ERROR, Messages.formatMessage(Messages.GET_SCRIPT_ERROR_DETAILS, path));
    }

    @Override
    protected String getUnexpectedErrorMessage() {
        return Messages.GET_SCRIPT_ERROR;
    }

}
