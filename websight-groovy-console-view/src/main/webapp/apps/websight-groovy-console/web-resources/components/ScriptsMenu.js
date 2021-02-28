import React from 'react';
import { GroupHeading, Item, MenuSection } from '@atlaskit/navigation-next';
import Tooltip from '@atlaskit/tooltip';
import styled from 'styled-components';

import ConfirmationModal from 'websight-admin/ConfirmationModal';
import { setUrlHashValue } from 'websight-admin/services/SearchParamsService';

import BrowseScriptModal from './BrowseScriptModal.js';
import ScriptService from '../services/ScriptService.js';

const ScriptsMenuContainer = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;

    & div:last-child {
        justify-content: flex-end;
        flex-grow: 1;
    }
`;

export default class ScriptsMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedScript: {}
        };

        this.openScript = this.openScript.bind(this);
        this.openNewScript = this.openNewScript.bind(this);
        this.onScriptSelect = this.onScriptSelect.bind(this);
        this.onScriptDelete = this.onScriptDelete.bind(this);
        this.onNewScriptClick = this.onNewScriptClick.bind(this);
    }

    openScript(script = this.state.selectedScript, getScriptCode = true) {
        this.props.onScriptChange(script, getScriptCode);
    }

    openNewScript() {
        setUrlHashValue('');
        this.openScript(ScriptService.emptyScript, false);
    }

    onScriptSelect(selectedScript) {
        setUrlHashValue(selectedScript.path);
        this.setState({ selectedScript }, () =>
            this.props.script.changed ? this.openScriptModal.open() : this.openScript()
        );
    }

    onNewScriptClick() {
        this.props.script.changed ? this.newScriptModal.open() : this.openNewScript();
    }

    onScriptDelete() {
        this.props.onScriptDelete();
    }

    render() {
        const { script, recentScripts, onHelperClick } = this.props;
        return (
            <>
                <MenuSection>
                    {({ className }) => (
                        <ScriptsMenuContainer className={`${className}`}>
                            <Item
                                before={() => <i className='material-icons-outlined'>add</i>}
                                text='New script'
                                onClick={this.onNewScriptClick}
                            />
                            <Item
                                before={() => <i className='material-icons-outlined'>folder</i>}
                                text='Browse scripts'
                                onClick={() => this.browseScriptModal.open()}
                            />
                            <GroupHeading>Recent scripts</GroupHeading>
                            {
                                recentScripts.map((recentScript) => {
                                    return (
                                        <Tooltip key={recentScript.path} content={recentScript.path + ' (by ' + recentScript.lastModifiedBy + ')'}>
                                            <Item
                                                before={() => <i className='material-icons'>insert_drive_file</i>}
                                                isActive={recentScript.path === script.path}
                                                key={recentScript.path}
                                                onClick={() => this.onScriptSelect(recentScript)}
                                                text={recentScript.name}
                                                subText={recentScript.relativePath + ' (by ' + recentScript.lastModifiedBy + ')'}
                                            />
                                        </Tooltip>
                                    )
                                })
                            }
                            <Item
                                before={() => <i className='material-icons-outlined'>help</i>}
                                text='Help'
                                onClick={onHelperClick}
                            />
                        </ScriptsMenuContainer>
                    )}
                </MenuSection>
                <BrowseScriptModal
                    key='browse-script-modal'
                    ref={(element) => this.browseScriptModal = element}
                    onScriptSelect={this.onScriptSelect}
                    onScriptDelete={this.onScriptDelete}
                />
                <ConfirmationModal
                    key='new-script-confirmation-modal'
                    appearance='warning'
                    buttonText='Open'
                    heading='Open new script'
                    message={(
                        <span>You will lost all your unsaved changes. Are you sure you want to create a new script?</span>
                    )}
                    onConfirm={this.openNewScript}
                    ref={(element) => this.newScriptModal = element}
                />
                <ConfirmationModal
                    key='open-script-confirmation-modal'
                    appearance='warning'
                    buttonText='Open'
                    heading='Open script'
                    message={(
                        <span>You will lost all your unsaved changes. Are you sure you want to open {this.state.selectedScript.name}?</span>
                    )}
                    onConfirm={this.openScript}
                    ref={(element) => this.openScriptModal = element}
                />
            </>
        )
    }
}
