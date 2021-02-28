package pl.ds.websight.groovyconsole.rest;

import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.models.annotations.Default;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.SlingObject;
import pl.ds.websight.request.parameters.support.annotations.RequestParameter;

@Model(adaptables = SlingHttpServletRequest.class)
public class GetRecentScriptsRestModel {

    @SlingObject
    private ResourceResolver resourceResolver;

    @RequestParameter
    @Default(intValues = 10)
    private int limit;

    public ResourceResolver getResourceResolver() {
        return resourceResolver;
    }

    public int getLimit() {
        return limit;
    }

}
