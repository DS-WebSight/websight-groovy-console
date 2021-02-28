package pl.ds.websight.groovyconsole.dto;

import org.apache.jackrabbit.JcrConstants;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ValueMap;
import pl.ds.websight.groovyconsole.util.GroovyConsoleUtil;

import java.util.Date;

public class GetRecentScriptsResponseDto {

    private final String name;
    private final String relativePath;
    private final String path;
    private final Date created;
    private final Date lastModified;
    private final String lastModifiedBy;
    private final Date lastExecuted;
    private final String lastExecutedBy;

    public GetRecentScriptsResponseDto(Resource scriptResource) {
        Resource scriptParent = scriptResource.getParent();
        if (scriptParent == null) {
            throw new IllegalStateException("Script does not have parent resource");
        }
        path = scriptParent.getPath();
        relativePath = GroovyConsoleUtil.toRelativePath(path);
        name = GroovyConsoleUtil.extractName(path);
        ValueMap properties = scriptResource.getValueMap();
        lastModified = properties.get(JcrConstants.JCR_LASTMODIFIED, Date.class);
        lastModifiedBy = properties.get("jcr:lastModifiedBy", String.class);
        lastExecuted = properties.get("ws:lastExecuted", Date.class);
        lastExecutedBy = properties.get("ws:lastExecutedBy", String.class);
        created = scriptParent.getValueMap().get(JcrConstants.JCR_CREATED, Date.class);
    }

    public String getName() {
        return name;
    }

    public String getRelativePath() {
        return relativePath;
    }

    public String getPath() {
        return path;
    }

    public Date getCreated() {
        return created;
    }

    public Date getLastModified() {
        return lastModified;
    }

    public String getLastModifiedBy() {
        return lastModifiedBy;
    }

    public Date getLastExecuted() {
        return lastExecuted;
    }

    public String getLastExecutedBy() {
        return lastExecutedBy;
    }

}
