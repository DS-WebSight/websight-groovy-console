package pl.ds.websight.groovyconsole.rest;

import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.SlingObject;

@Model(adaptables = SlingHttpServletRequest.class)
public class ListScriptsRestModel {

    @SlingObject
    private ResourceResolver resourceResolver;

    public ResourceResolver getResourceResolver() {
        return resourceResolver;
    }

}
