package pl.ds.websight.groovyconsole.service.impl;

import org.osgi.service.metatype.annotations.AttributeDefinition;
import org.osgi.service.metatype.annotations.AttributeType;
import org.osgi.service.metatype.annotations.ObjectClassDefinition;

@ObjectClassDefinition(name = "Groovy Console Compiler Configuration Service")
public @interface CompilerConfigurationServiceConfig {

    @AttributeDefinition(
            name = "Regular imports",
            description = "Defines allowed regular imports.",
            type = AttributeType.STRING
    )
    String[] import_regular() default {};

    @AttributeDefinition(
            name = "Star import",
            description = "Defines allowed regular imports to every child class.",
            type = AttributeType.STRING
    )
    String[] import_star() default {
            "javax.jcr",
            "org.apache.sling.api",
            "org.apache.sling.api.resource"
    };

    @AttributeDefinition(
            name = "Static import",
            description = "Defines allowed static imports.",
            type = AttributeType.STRING
    )
    String[] import_static() default {};

    @AttributeDefinition(
            name = "Static star import",
            description = "Defines allowed static imports to every child class.",
            type = AttributeType.STRING
    )
    String[] import_static_star() default {};

}
