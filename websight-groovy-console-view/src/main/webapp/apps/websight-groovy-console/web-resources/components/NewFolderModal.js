import React from 'react';
import { ErrorMessage } from '@atlaskit/form';
import ModalDialog, { ModalTransition } from '@atlaskit/modal-dialog';
import Textfield from '@atlaskit/textfield';

import { ENTER_KEY_CODE } from '../utils/GroovyConsoleConstants.js';

export default class NewFolderModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isOpen: false,
            folderName: '',
            error: ''
        };

        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
        this.onCreate = this.onCreate.bind(this);
    }

    open() {
        this.setState({
            isOpen: true,
            folderName: '',
            error: ''
        })
    }

    close() {
        this.setState({
            isOpen: false
        })
    }

    onCreate() {
        const { folderName } = this.state;
        if (!folderName || !folderName.trim()) {
            this.setState({
                error: 'Folder name cannot be blank'
            })
            return;
        }
        this.close();
        this.props.onSuccess(this.state.folderName);
    }

    actions() {
        return [
            {
                appearance: 'primary',
                text: 'Create',
                onClick: this.onCreate
            },
            { appearance: 'subtle', text: 'Cancel', onClick: this.close }
        ]
    }

    render() {
        const { isOpen, folderName, error } = this.state;

        return (
            <ModalTransition>
                {isOpen && (
                    <ModalDialog
                        actions={this.actions()}
                        heading={'Create new folder'}
                        onClose={this.close}
                        components
                    >
                        <label htmlFor="fileName">Folder name</label>
                        <Textfield
                            required
                            label={'fileName'}
                            name={'fileName'}
                            isCompact={true}
                            onKeyDown={(event) => {
                                if (event.keyCode === ENTER_KEY_CODE) {
                                    this.onCreate();
                                }
                            }}
                            onChange={(event) => {
                                this.setState({ folderName: event.target.value });
                            }}
                            value={folderName}
                        />
                        {error && (
                            <ErrorMessage>
                                {error}
                            </ErrorMessage>
                        )}
                    </ModalDialog>
                )}
            </ModalTransition>
        );
    }
}
