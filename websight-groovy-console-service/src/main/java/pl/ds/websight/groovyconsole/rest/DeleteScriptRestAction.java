package pl.ds.websight.groovyconsole.rest;

import org.apache.sling.api.resource.PersistenceException;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;
import org.osgi.service.component.annotations.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pl.ds.websight.rest.framework.RestAction;
import pl.ds.websight.rest.framework.RestActionResult;
import pl.ds.websight.rest.framework.annotations.SlingAction;

@Component
@SlingAction
public class DeleteScriptRestAction extends AbstractRestAction<DeleteScriptRestModel, Void>
        implements RestAction<DeleteScriptRestModel, Void> {

    private static final Logger LOG = LoggerFactory.getLogger(DeleteScriptRestAction.class);

    @Override
    protected RestActionResult<Void> performAction(DeleteScriptRestModel model) {
        ResourceResolver resourceResolver = model.getResourceResolver();
        String path = model.getPath();
        try {
            Resource resourceToDelete = resourceResolver.getResource(path);
            if (resourceToDelete == null) {
                LOG.info("Could not find resource to remove under {}", path);
                return RestActionResult.failure(
                        Messages.DELETE_SCRIPT_ERROR,
                        Messages.formatMessage(Messages.DELETE_SCRIPT_ERROR_NOT_FOUND_DETAILS, path));
            }
            resourceResolver.delete(resourceToDelete);
            resourceResolver.commit();
            return RestActionResult.success(
                    Messages.DELETE_SCRIPT_SUCCESS,
                    Messages.formatMessage(Messages.DELETE_SCRIPT_SUCCESS_DETAILS, path));
        } catch (PersistenceException e) {
            LOG.error("Error while removing script {}", path, e);
            return RestActionResult.failure(
                    Messages.DELETE_SCRIPT_ERROR,
                    Messages.formatMessage(Messages.DELETE_SCRIPT_ERROR_DETAILS, path));
        }
    }

    @Override
    protected String getUnexpectedErrorMessage() {
        return Messages.DELETE_SCRIPT_ERROR;
    }

}
