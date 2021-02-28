import React from 'react';
import { PanelStateless } from '@atlaskit/panel';
import Tabs from '@atlaskit/tabs';
import styled from 'styled-components';

import { ConsoleContainer } from 'websight-admin/Containers';
import { GlobalStyle } from 'websight-admin/GlobalStyle';
import { ResizableWrapper } from 'websight-admin/Wrappers';
import CodeMirror, { importAndSetCodeMirrorMode } from 'websight-admin/CodeMirror';

const OUTPUT_PANEL_ID_PREFIX = 'output_panel_';

const ExecutionResultContainer = styled(ConsoleContainer)`
    height: 100%;
    width: auto;
`;

const codeMirrorStyle = `
    .react-codemirror2 {
        width: 100%;
        height: 100%;
    }

    .CodeMirror {
        resize: none;
        border: 1px solid #DFE1E6;
        font-size: 12px;
        font-family: 'SFMono-Medium', 'SF Mono', 'Segoe UI Mono', 'Roboto Mono', 'Ubuntu Mono', 'Menlo', 'Consolas', 'Courier', 'monospace';
        z-index: 0;
        width: 100%;
        height: 100%;
    }
`;

const utcToLocalDateTimeString = (utcDateTimeString) => {
    const padZeros = (number) => String(number).padStart(2, '0');
    const utcDateTime = new Date(utcDateTimeString);
    return utcDateTime.getFullYear() + '-' + padZeros(utcDateTime.getMonth() + 1) + '-' + padZeros(utcDateTime.getDate()) + ' ' +
        padZeros(utcDateTime.getHours()) + ':' + padZeros(utcDateTime.getMinutes()) + ':' + padZeros(utcDateTime.getSeconds());
};

export default class CodeEditor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isJsonEditorExpanded: false,
            isGroovyEditorExpanded: true
        };

        this.showProperExecutionResultsTab = this.showProperExecutionResultsTab.bind(this);
        this.toggleJsonCodeExpanded = this.toggleJsonCodeExpanded.bind(this);
        this.toggleGroovyCodeExpanded = this.toggleGroovyCodeExpanded.bind(this);
        this.onGroovyCodeChange = this.onGroovyCodeChange.bind(this);
        this.onJsonCodeChange = this.onJsonCodeChange.bind(this);
        this.onTabChange = this.onTabChange.bind(this);
    }

    componentDidMount() {
        importAndSetCodeMirrorMode('application/json', this.jsonEditor);
        importAndSetCodeMirrorMode('text/x-groovy', this.groovyEditor);
    }

    componentDidUpdate(prevProps) {
        const { script, isExecuting } = this.props;

        const scriptChanged = (prevScript) =>
            (prevScript.changed && !script.changed) &&
            (prevScript.groovy !== script.groovy) ||
            prevScript.name !== script.name

        if (scriptChanged(prevProps.script)) {
            this.setState({ isJsonEditorExpanded: false, isGroovyEditorExpanded: true });
        }

        if (prevProps.isExecuting !== isExecuting && isExecuting === false) {
            this.showProperExecutionResultsTab();
        }
    }

    scrollTabToBottom(tabIndex) {
        const outputPanel = document.getElementById(OUTPUT_PANEL_ID_PREFIX + tabIndex);
        if (outputPanel) {
            outputPanel.scrollTop = outputPanel.scrollHeight;
        }
    }

    scrollTabToTop(tabIndex) {
        const outputPanel = document.getElementById(OUTPUT_PANEL_ID_PREFIX + tabIndex);
        if (outputPanel) {
            outputPanel.scrollTop = 0
        }
    }

    showProperExecutionResultsTab() {
        const { outputText, result, stacktraceText } = this.props.executionResults;

        const showExceptionTab = () =>
            this.setState({ selectedTab: 2 });

        const showResultTab = () =>
            this.setState({ selectedTab: 1 });

        const showOutputTab = () => {
            this.setState({ selectedTab: 0 },
                () => this.scrollTabToBottom(0))
        }

        if (stacktraceText) {
            showExceptionTab();
        } else if (outputText) {
            showOutputTab();
        } else if (result) {
            showResultTab();
        } else {
            showOutputTab();
        }
    }

    onJsonCodeChange(editor, data, value) {
        this.props.onScriptChange({ json: value });
    }

    onGroovyCodeChange(editor, data, value) {
        if (data.origin === 'paste' && editor.getSelection().replace(/(\r\n|\n|\r)/gm, ',') === data.text.toString()) {
            editor.setCursor(data.to)
        }
        if (!this.groovyCodeValueChangedProgramatically) {
            this.props.onScriptChange({ groovy: value, changed: true });
        } else {
            this.groovyCodeValueChangedProgramatically = false;
        }
    }

    toggleJsonCodeExpanded(isJsonEditorExpanded) {
        this.setState({ isJsonEditorExpanded }, () => {
            if (isJsonEditorExpanded) {
                this.jsonEditor.refresh();
            }
        });
    }

    toggleGroovyCodeExpanded(isGroovyEditorExpanded) {
        this.setState({ isGroovyEditorExpanded }, () => {
            if (isGroovyEditorExpanded) {
                this.groovyEditor.refresh();
            }
        });
    }

    refreshEditors() {
        if (this.state.isJsonEditorExpanded) {
            this.jsonEditor.refresh();
        }
        if (this.state.isGroovyEditorExpanded) {
            this.groovyEditor.refresh();
        }
    }

    outputWrapper(text, tabIndex) {
        if (typeof text !== 'string') {
            text = JSON.stringify(text);
        }

        return (
            <ResizableWrapper size='250px'>
                <ExecutionResultContainer id={OUTPUT_PANEL_ID_PREFIX + tabIndex}>
                    {this.props.isExecuting ? 'Running...' : text}
                </ExecutionResultContainer>
            </ResizableWrapper>
        )
    }

    get outputTabs() {
        const { executionResults } = this.props;
        let { outputText } = executionResults;
        if ('runningTime' in executionResults) {
            if (outputText && outputText.length > 0) {
                outputText += '\n';
            }
            outputText += '------------------------------------\n';
            outputText += `Total time: ${executionResults.runningTime} ms`;
            if ('finishedAt' in executionResults) {
                outputText += `\nFinished at: ${utcToLocalDateTimeString(executionResults.finishedAt)}`;
            }
            outputText += '\n------------------------------------';
        }

        return [
            { label: 'Output', content: this.outputWrapper(outputText, 0), scrollToBottom: true },
            { label: 'Result', content: this.outputWrapper(executionResults.result, 1) },
            { label: 'Stacktrace', content: this.outputWrapper(executionResults.stacktraceText, 2) }
        ]
    }

    onTabChange(selectedTabData) {
        const selectedTab = this.outputTabs
            .findIndex((tab) => tab.label === selectedTabData.label);
        this.setState({ selectedTab }, () => {
            if (selectedTabData.scrollToBottom === true) {
                this.scrollTabToBottom(selectedTab)
            } else {
                this.scrollTabToTop(selectedTab)
            }
        });
    }

    render() {
        return (
            <>
                <GlobalStyle styles={codeMirrorStyle} />
                <PanelStateless
                    header='Data'
                    isExpanded={this.state.isJsonEditorExpanded}
                    onChange={this.toggleJsonCodeExpanded}>
                    <p>
                        <small>
                            Value will be converted to the <code>data</code> script binding.
                            If input is a valid JSON, it will be converted to a <code>Map</code>, otherwise the <code>data</code> binding
                            will be of type <code>String</code>.
                        </small>
                    </p>
                    <ResizableWrapper size='300px'>
                        <CodeMirror
                            value={this.props.script.json}
                            options={{
                                lineNumbers: true,
                                matchBrackets: true,
                                autoCloseBrackets: true
                            }}
                            onBeforeChange={this.onJsonCodeChange}
                            editorDidMount={editorInstance => this.jsonEditor = editorInstance}
                        />
                    </ResizableWrapper>
                </PanelStateless>

                <PanelStateless
                    header='Code'
                    isExpanded={this.state.isGroovyEditorExpanded}
                    onChange={this.toggleGroovyCodeExpanded}>
                    <ResizableWrapper size='400px'>
                        <CodeMirror
                            value={this.props.script.groovy}
                            options={{
                                lineNumbers: true,
                                matchBrackets: true,
                                autoCloseBrackets: true
                            }}
                            onBeforeChange={this.onGroovyCodeChange}
                            editorDidMount={editorInstance => this.groovyEditor = editorInstance}
                        />
                    </ResizableWrapper>
                </PanelStateless>

                <Tabs tabs={this.outputTabs} onSelect={this.onTabChange} selected={this.state.selectedTab} />
            </>
        )
    }

}
