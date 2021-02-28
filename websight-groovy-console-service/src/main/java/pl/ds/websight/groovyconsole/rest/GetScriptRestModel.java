package pl.ds.websight.groovyconsole.rest;

import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.SlingObject;
import pl.ds.websight.groovyconsole.rest.validation.ValidatablePath;
import pl.ds.websight.request.parameters.support.annotations.RequestParameter;

import javax.validation.constraints.NotBlank;

@Model(adaptables = SlingHttpServletRequest.class)
public class GetScriptRestModel extends ValidatablePath {

    @SlingObject
    private ResourceResolver resourceResolver;

    @RequestParameter
    @NotBlank(message = "Script path cannot be blank")
    private String path;

    public String getPath() {
        return path;
    }

    public ResourceResolver getResourceResolver() {
        return resourceResolver;
    }

}
