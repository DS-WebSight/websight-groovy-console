package pl.ds.websight.groovyconsole.service;

import groovy.lang.Binding;
import org.codehaus.groovy.control.CompilerConfiguration;
import pl.ds.websight.groovyconsole.rest.ExecuteScriptRestModel;

import java.io.StringWriter;

public interface CompilerConfigurationService {

    CompilerConfiguration getCompilerConfiguration();

    Binding getBinding(ExecuteScriptRestModel executeScriptRestModel, StringWriter stringWriter);

}
