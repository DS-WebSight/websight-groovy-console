package pl.ds.websight.groovyconsole.rest;

import org.apache.sling.api.resource.ResourceResolver;
import org.osgi.service.component.annotations.Component;
import pl.ds.websight.groovyconsole.dto.GetRecentScriptsResponseDto;
import pl.ds.websight.rest.framework.RestAction;
import pl.ds.websight.rest.framework.RestActionResult;
import pl.ds.websight.rest.framework.annotations.SlingAction;

import javax.jcr.query.Query;
import java.util.Comparator;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;

import static pl.ds.websight.rest.framework.annotations.SlingAction.HttpMethod.GET;

@Component
@SlingAction(GET)
public class GetRecentScriptsRestAction extends AbstractRestAction<GetRecentScriptsRestModel, List<GetRecentScriptsResponseDto>>
        implements RestAction<GetRecentScriptsRestModel, List<GetRecentScriptsResponseDto>> {

    private static final String QUERY = "SELECT * FROM [nt:resource] as node WHERE ISDESCENDANTNODE(node, '/etc/groovy-console')";

    @Override
    protected RestActionResult<List<GetRecentScriptsResponseDto>> performAction(GetRecentScriptsRestModel model) {
        return RestActionResult.success(findRecentScripts(model));
    }

    private static List<GetRecentScriptsResponseDto> findRecentScripts(GetRecentScriptsRestModel getRecentScriptsRestModel) {
        int limit = getRecentScriptsRestModel.getLimit();
        List<GetRecentScriptsResponseDto> recentScripts = executeQuery(getRecentScriptsRestModel.getResourceResolver());
        if (recentScripts.size() > limit) {
            recentScripts = recentScripts.subList(0, limit);
        }
        return recentScripts;
    }

    private static List<GetRecentScriptsResponseDto> executeQuery(ResourceResolver resourceResolver) {
        List<GetRecentScriptsResponseDto> recentScripts = new LinkedList<>();
        resourceResolver.findResources(QUERY, Query.JCR_SQL2)
                .forEachRemaining(scriptResource -> recentScripts.add(new GetRecentScriptsResponseDto(scriptResource)));
        recentScripts.sort(Comparator.comparing(GetRecentScriptsRestAction::getLatestScriptDate).reversed());
        return recentScripts;
    }

    private static Date getLatestScriptDate(GetRecentScriptsResponseDto dto) {
        Date latestDate = dto.getCreated();
        if (dto.getLastModified() != null) {
            latestDate = dto.getLastModified();
            Date lastExecuted = dto.getLastExecuted();
            if (lastExecuted != null && lastExecuted.after(latestDate)) {
                latestDate = lastExecuted;
            }
        }
        return latestDate;
    }

    @Override
    protected String getUnexpectedErrorMessage() {
        return Messages.GET_RECENT_SCRIPTS_ERROR;
    }

}
