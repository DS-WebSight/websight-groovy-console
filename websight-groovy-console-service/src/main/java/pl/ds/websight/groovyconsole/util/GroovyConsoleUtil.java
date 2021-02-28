package pl.ds.websight.groovyconsole.util;

import org.apache.commons.lang3.StringUtils;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.api.resource.ResourceUtil;
import org.slf4j.Logger;

import static org.slf4j.LoggerFactory.getLogger;

public final class GroovyConsoleUtil {

    private static final Logger LOG = getLogger(GroovyConsoleUtil.class);

    public static final String GROOVY_CONSOLE_ROOT_PATH = "/etc/groovy-console/"; //NOSONAR
    private static final String NT_SLING_FOLDER = "sling:Folder";

    private GroovyConsoleUtil() {
        // No instance
    }

    public static Resource getRoot(ResourceResolver resourceResolver)  {
        try {
            return ResourceUtil.getOrCreateResource(resourceResolver, GROOVY_CONSOLE_ROOT_PATH, NT_SLING_FOLDER, NT_SLING_FOLDER, true);
        } catch (Exception e) {
            LOG.error("Could not get or create Groovy Console root resource", e);
        }
        return null;
    }

    public static String toRelativePath(String absolute) {
        return StringUtils.removeStart(absolute, GROOVY_CONSOLE_ROOT_PATH);
    }

    public static String extractName(String path) {
        String fileName = StringUtils.substringAfterLast(path, "/");
        return StringUtils.removeEnd(fileName, ".groovy");
    }

}
