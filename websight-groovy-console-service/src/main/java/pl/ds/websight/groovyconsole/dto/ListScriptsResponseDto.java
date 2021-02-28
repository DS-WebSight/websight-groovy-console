package pl.ds.websight.groovyconsole.dto;

import java.util.List;
import java.util.Map;

public class ListScriptsResponseDto {

    private final String rootId;
    private final Map<String, ListScriptsItem> items;

    public ListScriptsResponseDto(String rootId, Map<String, ListScriptsItem> items) {
        this.rootId = rootId;
        this.items = items;
    }

    public String getRootId() {
        return rootId;
    }

    public Map<String, ListScriptsItem> getItems() {
        return items;
    }

    public static class ListScriptsItem {

        private final String id;
        private final List<String> children;
        private final Map<String, Object> data;

        public ListScriptsItem(String id, List<String> children, Map<String, Object> data) {
            this.id = id;
            this.children = children;
            this.data = data;
        }

        public String getId() {
            return id;
        }

        public List<String> getChildren() {
            return children;
        }

        public Map<String, Object> getData() {
            return data;
        }
    }

}
