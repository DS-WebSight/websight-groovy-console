package pl.ds.websight.groovyconsole.rest.validation;

import org.apache.commons.lang3.StringUtils;
import pl.ds.websight.groovyconsole.util.GroovyConsoleUtil;
import pl.ds.websight.rest.framework.Errors;
import pl.ds.websight.rest.framework.Validatable;

public abstract class ValidatablePath implements Validatable {

    @Override
    public Errors validate() {
        Errors errors = Errors.createErrors();
        String path = getPath();
        if (!StringUtils.startsWith(path, GroovyConsoleUtil.GROOVY_CONSOLE_ROOT_PATH)) {
            errors.add("path", path, "Path must start with Groovy Console root");
        }
        return errors;
    }

    protected abstract String getPath();

}
