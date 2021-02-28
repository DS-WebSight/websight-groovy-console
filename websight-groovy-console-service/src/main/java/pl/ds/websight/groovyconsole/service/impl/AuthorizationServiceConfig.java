package pl.ds.websight.groovyconsole.service.impl;

import org.osgi.service.metatype.annotations.AttributeDefinition;
import org.osgi.service.metatype.annotations.AttributeType;
import org.osgi.service.metatype.annotations.ObjectClassDefinition;

@ObjectClassDefinition(name = "Groovy Console Authorization Service")
public @interface AuthorizationServiceConfig {

    @AttributeDefinition(
            name = "Allowed users",
            description = "List of users that are allowed to execute Groovy script.",
            type = AttributeType.STRING
    )
    String[] allowed_users() default {
        "admin"
    };

    @AttributeDefinition(
            name = "Allowed groups",
            description = "List of groups whose members are allowed to execute Groovy script.",
            type = AttributeType.STRING
    )
    String[] allowed_groups() default {};

}
