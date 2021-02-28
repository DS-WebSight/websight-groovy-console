package pl.ds.websight.groovyconsole.rest;

import org.apache.commons.lang3.StringUtils;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.models.annotations.Model;
import pl.ds.websight.groovyconsole.util.GroovyConsoleUtil;
import pl.ds.websight.request.parameters.support.annotations.RequestParameter;
import pl.ds.websight.rest.framework.Errors;
import pl.ds.websight.rest.framework.Validatable;

import javax.validation.constraints.NotBlank;

@Model(adaptables = SlingHttpServletRequest.class)
public class SaveScriptRestModel extends ScriptBaseRestModel implements Validatable {

    @RequestParameter
    @NotBlank(message = "Save path cannot be blank")
    private String path;

    public String getPath() {
        return path;
    }

    @Override
    public Errors validate() {
        Errors errors = Errors.createErrors();
        if (!StringUtils.startsWith(path, GroovyConsoleUtil.GROOVY_CONSOLE_ROOT_PATH)) {
            errors.add("path", path, "Path must start with Groovy Console root");
        }
        if (StringUtils.endsWith(path, "/")) {
            errors.add("path", path, "Save path must contain file name");
        }
        return errors;
    }
}
