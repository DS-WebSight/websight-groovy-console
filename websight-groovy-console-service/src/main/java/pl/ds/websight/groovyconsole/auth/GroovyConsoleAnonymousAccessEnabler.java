package pl.ds.websight.groovyconsole.auth;

import org.osgi.service.component.annotations.Component;
import pl.ds.websight.admin.auth.AnonymousAccessEnabler;

@Component(service = AnonymousAccessEnabler.class)
public class GroovyConsoleAnonymousAccessEnabler implements AnonymousAccessEnabler {

    @Override
    public String[] getPaths() {
        return new String[] { "/apps/websight-groovy-console-service" };
    }
}
