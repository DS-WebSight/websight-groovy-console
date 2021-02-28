import React from 'react';
import Button, { ButtonGroup } from '@atlaskit/button';
import {
    ContainerHeader,
    HeaderSection,
    LayoutManager,
    NavigationProvider
} from '@atlaskit/navigation-next';
import Page from '@atlaskit/page';
import PageHeader from '@atlaskit/page-header';
import { FlexContainer } from '@atlaskit/right-side-panel';
import Tooltip from '@atlaskit/tooltip';
import styled from 'styled-components';

import Breadcrumbs from 'websight-admin/Breadcrumbs';
import { PageContentContainer } from 'websight-admin/Containers';
import GlobalNavigation from 'websight-admin/GlobalNavigation';
import { AvatarIcon } from 'websight-admin/Icons';
import ListenForKeyboardShortcut from 'websight-admin/ListenForKeyboardShortcut';
import {
    getUrlHashValue,
    setUrlHashValue
} from 'websight-admin/services/SearchParamsService';
import Footer from 'websight-admin/Footer';
import { AUTH_CONTEXT_UPDATED } from 'websight-rest-atlaskit-client/RestClient';

import CodeEditor from './components/CodeEditor.js';
import Helper from './components/Helper.js';
import SaveAsModal from './components/SaveAsModal.js'
import ScriptsMenu from './components/ScriptsMenu.js';
import ScriptService from './services/ScriptService.js';
import { GROOVY_CONSOLE_ROOT_PATH } from './utils/GroovyConsoleConstants.js';

const PageContainer = styled.div`
    overflow-x: auto;
    width: 100%;
`;

const NavigationHeader = () => (
    <HeaderSection>
        {({ css }) => (
            <div style={{ ...css, paddingBottom: 20 }}>
                <ContainerHeader
                    before={() => (
                        <AvatarIcon className='material-icons'>
                            code
                        </AvatarIcon>
                    )}
                    href={GROOVY_CONSOLE_ROOT_PATH}
                    text='Groovy Console'
                />
            </div>
        )}
    </HeaderSection>
)

export default class GroovyConsole extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isExecuting: false,
            executionResults: ScriptService.emptyExecutionResults,
            recentScripts: [],
            script: ScriptService.emptyScript
        };

        this.updateScript = this.updateScript.bind(this);
        this.saveScript = this.saveScript.bind(this);
        this.executeScript = this.executeScript.bind(this);
        this.onHashChange = this.onHashChange.bind(this);
        this.onScriptChange = this.onScriptChange.bind(this);
        this.onScriptDelete = this.onScriptDelete.bind(this);
        this.preventLeavingThePage = this.preventLeavingThePage.bind(this);
    }

    componentDidMount() {
        this.getRecentScripts();
        this.openScriptFromUrlHash();
        window.addEventListener('beforeunload', this.preventLeavingThePage);
        window.addEventListener('hashchange', this.onHashChange);
        window.addEventListener(AUTH_CONTEXT_UPDATED, () => {
            this.getRecentScripts();
            this.openScriptFromUrlHash();
        });
    }

    componentWillUnmount() {
        window.removeEventListener('beforeunload', this.preventLeavingThePage);
        window.removeEventListener('hashchange', this.onHashChange);
    }

    componentWillUpdate(nextProps, nextState) {
        const { script } = this.state;
        if (nextState.script.name !== script.name &&
            nextState.script.groovy !== script.groovy) {
            this.setState({ executionResults: ScriptService.emptyExecutionResults });
        }
    }

    onHashChange() {
        this.openScriptFromUrlHash();
    }

    openScriptFromUrlHash() {
        const { script } = this.state;
        const scriptPath = getUrlHashValue();
        if (scriptPath && script.path !== scriptPath) {
            ScriptService.listScripts((data) => {
                const result = Object.entries(data.items).map(([key, value]) => {
                    if (value.path === scriptPath) {
                        return data.items[key];
                    }
                }).filter(item => item !== undefined);
                if (result.length > 0 && result[0].path) {
                    this.scriptsMenu.onScriptSelect(result[0]);
                }
            });
        }
    }

    preventLeavingThePage(e) {
        const { script, isExecuting } = this.state;

        if (script.changed || isExecuting) {
            e.returnValue = '';
            e.preventDefault();
        } else {
            delete e['returnValue'];
        }
    }

    getRecentScripts() {
        ScriptService.getRecentScripts((scripts) =>
            this.setState({ recentScripts: scripts || [] })
        );
    }

    updateScript(scriptData) {
        this.setState((prevState) => ({
            script: {
                ...prevState.script,
                ...scriptData
            }
        }));
    }

    saveScript() {
        ScriptService.saveScript(this.state.script, () => {
            this.onScriptChange({ path: this.state.script.path });
            this.getRecentScripts();
        });
    }

    executeScript() {
        const { script, isExecuting } = this.state;
        if (script.groovy && !isExecuting) {
            this.setState(
                { isExecuting: true },
                ScriptService.executeScript(script,
                    (executionResults) => this.setState({ executionResults, isExecuting: false }, this.getRecentScripts),
                    () => this.setState({ isExecuting: false })
                )
            );
        }
    }

    onScriptChange(scriptData, getScriptCode = false) {
        setUrlHashValue(scriptData.path);
        if (getScriptCode) {
            ScriptService.getScriptCode(scriptData, (data) => {
                this.updateScript({ ...scriptData, groovy: data, changed: false });
            })
        } else {
            this.updateScript({ ...scriptData, changed: false });
        }
    }

    onScriptDelete() {
        this.getRecentScripts();
    }

    shouldComponentUpdate(prevState, state) {
        return JSON.stringify(this.state) !== JSON.stringify(state);
    }

    render() {
        const { script, recentScripts, isExecuting } = this.state;

        const actions = (
            <ButtonGroup>
                <Tooltip delay={0} content='Alt+R'>
                    <Button
                        isDisabled={!script.groovy || isExecuting}
                        isLoading={isExecuting}
                        appearance='primary'
                        onClick={this.executeScript}
                        iconBefore={<i className='material-icons'>play_arrow</i>}
                    >
                        Run
                    </Button>
                </Tooltip>
                {
                    script.name &&
                    <Button
                        isDisabled={!script.groovy || !script.changed}
                        onClick={this.saveScript}
                    >
                        Save
                    </Button>
                }
                <Button
                    isDisabled={!script.groovy}
                    onClick={() => this.saveAsModal.open()}
                >
                    Save as...
                </Button>
                <SaveAsModal
                    ref={(element) => this.saveAsModal = element}
                    script={this.state.script}
                    onSuccess={(scriptData) => {
                        this.onScriptChange(scriptData);
                        this.getRecentScripts();
                    }}
                />
            </ButtonGroup>
        );

        const keyShortcuts = [
            { key: 'AltLeft+R', keyCodes: ['AltLeft', 'KeyR'], callback: this.executeScript },
            { key: 'AltRight+R', keyCodes: ['AltRight', 'KeyR'], callback: this.executeScript }
        ]

        return (
            <>
                {keyShortcuts.map((shortcut) => (<ListenForKeyboardShortcut key={shortcut.key} {...shortcut} />))}
                <NavigationProvider>
                    <LayoutManager
                        key='layout-manager'
                        globalNavigation={GlobalNavigation}
                        productNavigation={() => null}
                        containerNavigation={() => (
                            <>
                                <NavigationHeader />
                                <ScriptsMenu
                                    key='leftNavigation'
                                    ref={(element) => this.scriptsMenu = element}
                                    script={this.state.script}
                                    onScriptChange={this.onScriptChange}
                                    onScriptDelete={this.onScriptDelete}
                                    onHelperClick={() => this.helper.open()}
                                    recentScripts={recentScripts}
                                />
                            </>
                        )}
                        experimental_horizontalGlobalNav
                    >
                        <FlexContainer id='groovy-container'>
                            <PageContainer>
                                <Page>
                                    <PageContentContainer>
                                        <PageHeader
                                            actions={actions}
                                            breadcrumbs={
                                                <Breadcrumbs breadcrumbs={[
                                                    { text: 'Groovy Console', path: GROOVY_CONSOLE_ROOT_PATH, reactPath: '' }
                                                ]} />
                                            }
                                        >
                                            Script: {script.name ? script.name : 'Not saved'}
                                        </PageHeader>
                                        <CodeEditor
                                            ref={(element) => this.scriptEditor = element}
                                            executionResults={this.state.executionResults}
                                            isExecuting={this.state.isExecuting}
                                            script={this.state.script}
                                            onScriptChange={this.updateScript}
                                        />
                                    </PageContentContainer>
                                    <Footer />
                                </Page>
                            </PageContainer>
                            <Helper
                                ref={(element) => this.helper = element}
                                onAnimationFinished={() => this.scriptEditor.refreshEditors()}
                            />
                        </FlexContainer>
                    </LayoutManager>
                </NavigationProvider>
            </>
        );
    }
}
