package pl.ds.websight.groovyconsole.rest;

import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.Self;
import org.apache.sling.models.annotations.injectorspecific.SlingObject;
import pl.ds.websight.request.parameters.support.annotations.RequestParameter;

import javax.jcr.Session;
import javax.validation.constraints.NotEmpty;

@Model(adaptables = SlingHttpServletRequest.class)
public class ScriptBaseRestModel {

    @Self
    private SlingHttpServletRequest request;

    @SlingObject
    private ResourceResolver resourceResolver;

    @RequestParameter
    @NotEmpty(message = "Script cannot be empty")
    protected String script;

    public String getScript() {
        return script;
    }

    public SlingHttpServletRequest getRequest() {
        return request;
    }

    public ResourceResolver getResourceResolver() {
        return resourceResolver;
    }

    public Session getSession() {
        return resourceResolver.adaptTo(Session.class);
    }

}
