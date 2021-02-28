package pl.ds.websight.groovyconsole.rest;

import org.apache.commons.lang3.StringUtils;
import org.apache.jackrabbit.JcrConstants;
import org.apache.sling.api.resource.Resource;
import org.osgi.service.component.annotations.Component;
import pl.ds.websight.groovyconsole.dto.ListScriptsResponseDto;
import pl.ds.websight.groovyconsole.dto.ListScriptsResponseDto.ListScriptsItem;
import pl.ds.websight.groovyconsole.util.GroovyConsoleUtil;
import pl.ds.websight.rest.framework.RestAction;
import pl.ds.websight.rest.framework.RestActionResult;
import pl.ds.websight.rest.framework.annotations.SlingAction;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import static pl.ds.websight.rest.framework.annotations.SlingAction.HttpMethod.GET;

@Component
@SlingAction(GET)
public class ListScriptsRestAction extends AbstractRestAction<ListScriptsRestModel, ListScriptsResponseDto>
        implements RestAction<ListScriptsRestModel, ListScriptsResponseDto> {

    private static final List<String> SUPPORTED_FOLDER_TYPES = Arrays.asList(JcrConstants.NT_FOLDER, "sling:Folder", "sling:OrderedFolder");

    @Override
    protected RestActionResult<ListScriptsResponseDto> performAction(ListScriptsRestModel model) {
        Map<String, ListScriptsItem> listScriptsItems = new LinkedHashMap<>();
        Resource rootResource = GroovyConsoleUtil.getRoot(model.getResourceResolver());
        if (rootResource != null) {
            fetchScripts(listScriptsItems, rootResource, "0", true);
        }
        return RestActionResult.success(new ListScriptsResponseDto("0", listScriptsItems));
    }

    private static void fetchScripts(Map<String, ListScriptsItem> scripts, Resource root, String rootId, boolean isFolder) {
        List<String> childrenIds = new LinkedList<>();
        if (isFolder) {
            Iterator<Resource> children = root.listChildren();
            while (children.hasNext()) {
                Resource child = children.next();
                boolean isSubfolder = SUPPORTED_FOLDER_TYPES.contains(child.getResourceType());
                if (isSubfolder || StringUtils.endsWith(child.getName(), ".groovy")) {
                    String childId = getChildId(rootId, childrenIds.size());
                    childrenIds.add(childId);
                    fetchScripts(scripts, child, childId, isSubfolder);
                }
            }
        }
        scripts.put(rootId, getListScriptsItem(rootId, childrenIds, root.getPath(), isFolder));
    }

    private static String getChildId(String rootId, int currentChildrenAmount) {
        return rootId + '-' + (currentChildrenAmount + 1);
    }

    private static ListScriptsItem getListScriptsItem(String id, List<String> childrenIds, String path, boolean isFolder) {
        Map<String, Object> data = new HashMap<>();
        data.put("name", GroovyConsoleUtil.extractName(path));
        data.put("path", path);
        data.put("isFolder", isFolder);
        return new ListScriptsItem(id, childrenIds, data);
    }

    @Override
    protected String getUnexpectedErrorMessage() {
        return Messages.LIST_SCRIPTS_ERROR;
    }

}
