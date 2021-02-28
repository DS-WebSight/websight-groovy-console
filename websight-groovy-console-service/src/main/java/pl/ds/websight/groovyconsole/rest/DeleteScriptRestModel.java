package pl.ds.websight.groovyconsole.rest;

import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.SlingObject;
import pl.ds.websight.groovyconsole.rest.validation.ValidatablePath;
import pl.ds.websight.request.parameters.support.annotations.RequestParameter;

import javax.validation.constraints.NotBlank;

@Model(adaptables = SlingHttpServletRequest.class)
public class DeleteScriptRestModel extends ValidatablePath {

    @SlingObject
    private ResourceResolver resourceResolver;

    @RequestParameter
    @NotBlank(message = "Path cannot be blank")
    private String path;

    public ResourceResolver getResourceResolver() {
        return resourceResolver;
    }

    public String getPath() {
        return path;
    }

}
