package pl.ds.websight.groovyconsole.extension;

public enum BindingProperty {

    BUNDLE_CONTEXT("bundleContext"),
    DATA("data"),
    OUT("out"),
    LOG("log"),
    REQUEST("request"),
    RESOURCE_RESOLVER("resourceResolver"),
    SESSION("session");

    private final String name;

    BindingProperty(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

}
