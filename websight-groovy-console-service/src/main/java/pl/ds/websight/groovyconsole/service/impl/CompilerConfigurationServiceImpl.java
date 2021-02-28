package pl.ds.websight.groovyconsole.service.impl;

import groovy.lang.Binding;
import org.codehaus.groovy.control.CompilerConfiguration;
import org.codehaus.groovy.control.customizers.ImportCustomizer;
import org.osgi.framework.BundleContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.metatype.annotations.Designate;
import org.slf4j.LoggerFactory;
import pl.ds.websight.groovyconsole.extension.BindingProperty;
import pl.ds.websight.groovyconsole.extension.ScriptBase;
import pl.ds.websight.groovyconsole.rest.ExecuteScriptRestModel;
import pl.ds.websight.groovyconsole.service.CompilerConfigurationService;

import java.io.StringWriter;

@Component(service = CompilerConfigurationService.class)
@Designate(ocd = CompilerConfigurationServiceConfig.class)
public class CompilerConfigurationServiceImpl implements CompilerConfigurationService {

    private BundleContext bundleContext;
    private CompilerConfigurationServiceConfig config;

    @Override
    public CompilerConfiguration getCompilerConfiguration() {
        CompilerConfiguration compilerConfig = new CompilerConfiguration();
        compilerConfig.setScriptBaseClass(getScriptBaseClass());
        compilerConfig.addCompilationCustomizers(getImportCustomizer());
        return compilerConfig;
    }

    @Override
    public Binding getBinding(ExecuteScriptRestModel executeScriptRestModel, StringWriter stringWriter) {
        Binding binding = new Binding();
        binding.setProperty(BindingProperty.BUNDLE_CONTEXT.getName(), bundleContext);
        binding.setProperty(BindingProperty.DATA.getName(), executeScriptRestModel.getCustomData());
        binding.setProperty(BindingProperty.LOG.getName(), LoggerFactory.getLogger("groovyconsole"));
        binding.setProperty(BindingProperty.OUT.getName(), stringWriter);
        binding.setProperty(BindingProperty.REQUEST.getName(), executeScriptRestModel.getRequest());
        binding.setProperty(BindingProperty.RESOURCE_RESOLVER.getName(), executeScriptRestModel.getResourceResolver());
        binding.setProperty(BindingProperty.SESSION.getName(), executeScriptRestModel.getSession());
        return binding;
    }

    private ImportCustomizer getImportCustomizer() {
        ImportCustomizer importCustomizer = new ImportCustomizer();
        importCustomizer.addImports(config.import_regular());
        importCustomizer.addStarImports(config.import_star());
        importCustomizer.addStarImports(config.import_static());
        importCustomizer.addStaticStars(config.import_static_star());
        return importCustomizer;
    }

    private static String getScriptBaseClass() {
        return ScriptBase.class.getName();
    }

    @Activate
    private void activate(BundleContext bundleContext, CompilerConfigurationServiceConfig config) {
        this.bundleContext = bundleContext;
        this.config = config;
    }

}
