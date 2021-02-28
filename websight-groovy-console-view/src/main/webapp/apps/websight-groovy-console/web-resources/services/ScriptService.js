import RestClient from 'websight-rest-atlaskit-client/RestClient';

const VIRTUAL_ROOT_ID = 'root';

const scriptRequestData = (script) => ({
    script: script.groovy || script.script,
    path: script.path
});

const executeRequestData = (script) => ({
    data: script.json,
    path: !script.changed && script.name ? script.path : undefined,
    script: script.groovy
})

const mapScriptData = (script) => ({
    id: script.id,
    children: script.children,
    name: script.data.name,
    path: script.data.path,
    isFolder: script.data.isFolder
});

const listScriptsResponseData = (data) => {
    const mappedItemsEntities = Object.entries(data.items)
        .map(([key, value]) => [key, mapScriptData(value)]);

    const items = Object.fromEntries(mappedItemsEntities);

    const rootId = data.rootId;
    const rootItem = items[rootId];
    if (rootItem) {
        rootItem.name = '/etc/groovy-console';
        rootItem.isExpanded = true;
        items[VIRTUAL_ROOT_ID] = {
            children: [rootId],
            id: VIRTUAL_ROOT_ID,
            path: '/etc/groovy-console',
            isFolder: true,
            isExpanded: true
        }
    }
    return {
        rootId: VIRTUAL_ROOT_ID,
        items: items
    }
}

class ScriptService {
    constructor() {
        this.client = new RestClient('websight-groovy-console-service');
    }

    get emptyScript() {
        return {
            changed: false,
            groovy: '',
            json: '',
            path: '',
            name: ''
        };
    }

    get emptyExecutionResults() {
        return {
            outputText: '',
            result: '',
            stacktraceText: ''
        }
    }

    getScriptCode(scriptData, onSuccess, onComplete) {
        this.client.get({
            action: 'get-script',
            parameters: { path: scriptData.path },
            onSuccess: ({ entity }) => onSuccess(entity),
            onFailure: onComplete,
            onError: onComplete,
            onNonFrameworkError: onComplete
        });
    }

    saveScript(scriptData, onSuccess, onFailure, onValidationFailure) {
        this.client.post({
            action: 'save-script',
            data: scriptRequestData(scriptData),
            onSuccess: onSuccess,
            onFailure: onFailure,
            onValidationFailure: onValidationFailure
        });
    }

    executeScript(scriptData, onSuccess, onComplete) {
        this.client.post({
            action: 'execute-script',
            data: executeRequestData(scriptData),
            onSuccess: ({ entity }) => onSuccess(entity),
            onValidationFailure: onComplete,
            onFailure: onComplete,
            onError: onComplete,
            onNonFrameworkError: onComplete
        });
    }

    deletePath(path, onComplete) {
        this.client.post({
            action: 'delete-script',
            data: { path },
            onSuccess: onComplete,
            onValidationFailure: onComplete,
            onFailure: onComplete,
            onError: onComplete,
            onNonFrameworkError: onComplete
        });
    }

    listScripts(onSuccess, onComplete) {
        this.client.get({
            action: 'list-scripts',
            onSuccess: ({ entity }) => onSuccess(listScriptsResponseData(entity)),
            onFailure: onComplete,
            onError: onComplete,
            onNonFrameworkError: onComplete
        });
    }

    getRecentScripts(onSuccess, onComplete) {
        this.client.get({
            action: 'get-recent-scripts',
            onSuccess: ({ entity }) => onSuccess(entity),
            onFailure: onComplete,
            onError: onComplete,
            onNonFrameworkError: onComplete
        });
    }
}

export default new ScriptService();
