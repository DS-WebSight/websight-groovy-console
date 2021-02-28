package pl.ds.websight.groovyconsole.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectReader;
import org.apache.commons.lang3.StringUtils;
import org.apache.jackrabbit.JcrConstants;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.Model;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pl.ds.websight.request.parameters.support.annotations.RequestParameter;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.util.LinkedHashMap;

@Model(adaptables = SlingHttpServletRequest.class)
public class ExecuteScriptRestModel extends ScriptBaseRestModel {

    private static final Logger LOG = LoggerFactory.getLogger(ExecuteScriptRestModel.class);
    private static final ObjectReader OBJECT_READER = new ObjectMapper().reader(LinkedHashMap.class);

    @RequestParameter
    private String data;

    @RequestParameter
    private String path;

    private Object customData;
    private Resource scriptResource;

    @PostConstruct
    private void init() {
        if (StringUtils.isNotBlank(data)) {
            initCustomData();
        }
        if (StringUtils.isNotBlank(path)) {
            initScriptResource();
        }
    }

    private void initCustomData() {
        try {
            customData = OBJECT_READER.readValue(data);
        } catch (IOException e) {
            LOG.debug("Request data parameter is an invalid JSON, write it as String", e);
            customData = data;
        }
    }

    private void initScriptResource() {
        scriptResource = getResourceResolver().getResource(path);
        if (scriptResource != null) {
            scriptResource = scriptResource.getChild(JcrConstants.JCR_CONTENT);
        }
    }

    public Object getCustomData() {
        return customData;
    }

    public Resource getScriptResource() {
        return scriptResource;
    }

}
