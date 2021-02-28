import React from 'react';
import ModalDialog, { ModalTransition } from '@atlaskit/modal-dialog';

import ConfirmationModal from 'websight-admin/ConfirmationModal';

import FilesTree from './FilesTree.js';
import ScriptService from '../services/ScriptService.js';

export default class BrowseScriptModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            filesTree: { items: [] },
            isOpen: false,
            selectedItem: {}
        };

        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
        this.deleteScript = this.deleteScript.bind(this);
        this.isSelectedItemAFile = this.isSelectedItemAFile.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onSelect = this.onSelect.bind(this);
        this.onDelete = this.onDelete.bind(this);
    }

    getScriptsTree(callback) {
        ScriptService.listScripts((data) => {
            this.setState({
                filesTree: data,
                selectedItem: data.items[data.rootId] || {}
            }, () => callback && callback());
        });
    }

    deleteScript() {
        ScriptService.deletePath(this.state.selectedItem.path, () => {
            this.props.onScriptDelete();
            this.deleteScriptModal.close();
        });
    }

    isSelectedItemAFile() {
        return this.state.selectedItem.isFolder === false;
    }

    open() {
        this.setState({ isOpen: true }, this.getScriptsTree(() => document.activeElement.blur()));
    }

    close() {
        this.setState({ isOpen: false });
    }

    onSubmit() {
        this.close();
        this.props.onScriptSelect(this.state.selectedItem);
    }

    onSelect(script) {
        this.setState({ selectedItem: script })
    }

    onDelete() {
        this.deleteScriptModal.open();
    }

    actions() {
        return [
            {
                isDisabled: !this.state.selectedItem.id || (this.state.selectedItem.id === this.state.filesTree.rootId),
                appearance: 'danger',
                type: 'submit',
                text: 'Delete',
                onClick: this.onDelete
            },
            {
                isDisabled: !this.isSelectedItemAFile(),
                appearance: 'primary',
                type: 'submit',
                text: 'Open',
                onClick: this.onSubmit
            },
            { appearance: 'subtle', text: 'Cancel', onClick: this.close }
        ]
    }

    render() {
        const { filesTree, isOpen, selectedItem } = this.state;

        return (
            <ModalTransition>
                {isOpen && (
                    <ModalDialog
                        actions={this.actions()}
                        heading='Browse scripts'
                        onClose={this.close}
                    >
                        <FilesTree
                            filesTree={filesTree}
                            onSelect={this.onSelect}
                        />
                        <ConfirmationModal
                            key='delete-script-confirmation-modal'
                            appearance='danger'
                            buttonText='Delete'
                            heading='Delete'
                            message={(
                                <div>Are you sure you want to delete <b>{`${selectedItem.path}`}</b>
                                    {selectedItem.isFolder && ' and all its contents'}
                                    ?
                                </div>
                            )}
                            onConfirm={this.deleteScript}
                            ref={(element) => this.deleteScriptModal = element}
                        />
                    </ModalDialog>
                )}
            </ModalTransition>
        );
    }
}
