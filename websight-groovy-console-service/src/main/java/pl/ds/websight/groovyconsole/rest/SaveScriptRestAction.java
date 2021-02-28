package pl.ds.websight.groovyconsole.rest;

import org.apache.jackrabbit.JcrConstants;
import org.apache.jackrabbit.commons.JcrUtils;
import org.osgi.service.component.annotations.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pl.ds.websight.rest.framework.RestAction;
import pl.ds.websight.rest.framework.RestActionResult;
import pl.ds.websight.rest.framework.annotations.SlingAction;

import javax.jcr.Binary;
import javax.jcr.Node;
import javax.jcr.RepositoryException;
import javax.jcr.Session;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

@Component
@SlingAction
public class SaveScriptRestAction extends AbstractRestAction<SaveScriptRestModel, Void> implements RestAction<SaveScriptRestModel, Void> {

    private static final Logger LOG = LoggerFactory.getLogger(SaveScriptRestAction.class);

    @Override
    protected RestActionResult<Void> performAction(SaveScriptRestModel model) {
        try {
            saveScript(model);
            return RestActionResult.success(Messages.SAVE_SCRIPT_SUCCESS,
                    Messages.formatMessage(Messages.SAVE_SCRIPT_SUCCESS_DETAILS, model.getPath()));
        } catch (RepositoryException | UnsupportedEncodingException e) {
            LOG.error("Error while saving script {}", model.getPath(), e);
            return RestActionResult.failure(
                    Messages.SAVE_SCRIPT_ERROR,
                    Messages.formatMessage(Messages.SAVE_SCRIPT_ERROR_DETAILS, model.getPath()));
        }
    }

    private static void saveScript(SaveScriptRestModel model) throws RepositoryException, UnsupportedEncodingException {
        Session session = model.getSession();
        Node contentNode = createContentNode(session, model.getPath());
        putFile(session, contentNode, model.getScript());
        session.save();
    }

    private static Node createContentNode(Session session, String absolutePath) throws RepositoryException {
        Node scriptNode = JcrUtils.getOrCreateByPath(absolutePath, "sling:Folder", JcrConstants.NT_FILE, session, false);
        return JcrUtils.getOrAddNode(scriptNode, JcrConstants.JCR_CONTENT, JcrConstants.NT_RESOURCE);
    }

    private static void putFile(Session session, Node contentNode, String script) throws RepositoryException, UnsupportedEncodingException {
        InputStream inputStream = new ByteArrayInputStream(script.getBytes(StandardCharsets.UTF_8.name()));
        Binary scriptBinary = session.getValueFactory().createBinary(inputStream);
        try {
            contentNode.setProperty(JcrConstants.JCR_DATA, scriptBinary);
            contentNode.setProperty(JcrConstants.JCR_ENCODING, StandardCharsets.UTF_8.name());
            contentNode.setProperty(JcrConstants.JCR_MIMETYPE, "application/octet-stream");
            contentNode.setProperty(JcrConstants.JCR_LASTMODIFIED, LocalDateTime.now().toString());
            contentNode.setProperty("jcr:lastModifiedBy", session.getUserID());
            contentNode.addMixin("ws:Executable");
        } finally {
            scriptBinary.dispose();
        }
    }

    @Override
    protected String getUnexpectedErrorMessage() {
        return Messages.SAVE_SCRIPT_ERROR;
    }

}
