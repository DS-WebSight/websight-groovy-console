package pl.ds.websight.groovyconsole.extension;

import groovy.lang.Closure;
import groovy.lang.Script;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.models.factory.ModelFactory;
import org.osgi.framework.BundleContext;
import org.osgi.framework.InvalidSyntaxException;
import org.osgi.framework.ServiceReference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.Node;
import javax.jcr.NodeIterator;
import javax.jcr.RepositoryException;
import javax.jcr.Session;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static java.util.stream.Collectors.toList;

public abstract class ScriptBase extends Script {

    private static final Logger LOG = LoggerFactory.getLogger(ScriptBase.class);

    private List<ServiceReference<?>> retrievedServiceReferences = new ArrayList<>();

    public Node getNode(String path) throws RepositoryException {
        return getSession().getNode(path);
    }

    public Resource getResource(String path) {
        return getResourceResolver().getResource(path);
    }

    public void recursive(Node node, Closure<?> closure) throws RepositoryException {
        closure.call(node);
        NodeIterator childNodesIterator = node.getNodes();
        while (childNodesIterator.hasNext()) {
            recursive(childNodesIterator.nextNode(), closure);
        }
    }

    public void recursive(Resource resource, Closure<?> closure) {
        closure.call(resource);
        Iterable<Resource> childResourcesIterable = resource.getChildren();
        childResourcesIterable.forEach(child -> recursive(child, closure));
    }

    public void move(String source, String destination) throws RepositoryException {
        Session session = getSession();
        session.move(source, destination);
        session.save();
    }

    public void rename(Node node, String newName) throws RepositoryException {
        Node parent = node.getParent();
        move(node.getPath(), parent.getPath() + '/' + newName);
        getSession().save();
    }

    public void copy(String source, String destination) throws RepositoryException {
        getSession().getWorkspace().copy(source, destination);
    }

    public void save() throws RepositoryException {
        getSession().save();
    }

    public <T> T getModel(String path, Class<T> type) {
        BundleContext bundleContext = getBundleContext();
        ServiceReference<ModelFactory> modelFactoryReference = bundleContext.getServiceReference(ModelFactory.class);
        ModelFactory modelFactory = bundleContext.getService(modelFactoryReference);

        Resource resource = getResourceResolver().resolve(path);

        return modelFactory.createModel(resource, type);
    }

    public <T> T getService(Class<T> type) {
        return getService(type.getName());
    }

    public <T> T getService(String className) {
        BundleContext bundleContext = getBundleContext();
        @SuppressWarnings("unchecked")
        ServiceReference<T> serviceReference = (ServiceReference<T>) bundleContext.getServiceReference(className);
        retrievedServiceReferences.add(serviceReference);
        return bundleContext.getService(serviceReference);
    }

    public <T> List<T> getServices(Class<T> type, String filter) throws InvalidSyntaxException {
        return getServices(type.getName(), filter);
    }

    public <T> List<T> getServices(String className, String filter) throws InvalidSyntaxException {
        BundleContext bundleContext = getBundleContext();
        @SuppressWarnings("unchecked")
        ServiceReference<T>[] serviceReferences = (ServiceReference<T>[]) bundleContext.getServiceReferences(className, filter);
        retrievedServiceReferences.addAll(Arrays.asList(serviceReferences));
        return Arrays.stream(serviceReferences)
                .map(bundleContext::getService)
                .collect(toList());
    }

    public void ungetRetrievedServiceReferences() {
        BundleContext bundleContext = getBundleContext();
        retrievedServiceReferences.forEach(serviceReference -> {
            try {
                bundleContext.ungetService(serviceReference);
            } catch (IllegalStateException | IllegalArgumentException e) {
                LOG.warn("Could not unget service", e);
            }
        });
        retrievedServiceReferences.clear();
    }

    private Session getSession() {
        return (Session) getProperty(BindingProperty.SESSION.getName());
    }

    private BundleContext getBundleContext() {
        return (BundleContext) getProperty(BindingProperty.BUNDLE_CONTEXT.getName());
    }

    private ResourceResolver getResourceResolver() {
        return (ResourceResolver) getProperty(BindingProperty.RESOURCE_RESOLVER.getName());
    }

}
