import React from 'react';
import Button from '@atlaskit/button';
import { ErrorMessage } from '@atlaskit/form';
import ModalDialog, { ModalTransition } from '@atlaskit/modal-dialog';
import TextField from '@atlaskit/textfield';

import ConfirmationModal from 'websight-admin/ConfirmationModal';
import { colors } from 'websight-admin/theme';
import { errorNotification } from 'websight-rest-atlaskit-client/Notification';

import FilesTree from './FilesTree.js';
import NewFolderModal from './NewFolderModal.js';
import ScriptService from '../services/ScriptService.js';
import { ENTER_KEY_CODE } from '../utils/GroovyConsoleConstants.js';

const FILE_GROOVY_EXTENSION = '.groovy';
const EMPTY_FIELD_ERROR_MESSAGE = 'Name cannot be blank';

const linkButtonStyle = {
    margin: '0',
    padding: '0'
};

export default class SaveAsModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            submitted: false,
            isSaveButtonClicked: false,
            isOpen: false,
            selectedItem: {},
            fileName: '',
            filesTree: { items: {} },
            scriptSaveData: ScriptService.emptyScript,
            errorMessage: EMPTY_FIELD_ERROR_MESSAGE,
            isValidationError: false
        };

        this.getScriptsTree = this.getScriptsTree.bind(this);
        this.close = this.close.bind(this);
        this.open = this.open.bind(this);
        this.saveScript = this.saveScript.bind(this);
        this.onSave = this.onSave.bind(this);
        this.onSelect = this.onSelect.bind(this);
        this.onNameChange = this.onNameChange.bind(this);
        this.onFolderCreate = this.onFolderCreate.bind(this);
    }

    componentDidMount() {
        this.getScriptsTree();
    }

    get currentFolderPath() {
        const { selectedItem } = this.state;

        if (Object.keys(selectedItem).length && !selectedItem.isFolder) {
            return selectedItem.path.replace(/\/[^/]+$/, '/');
        } else if (selectedItem.path) {
            return `${selectedItem.path}/`;
        } else {
            return '/etc/groovy-console/';
        }
    }

    get fileAlreadyExists() {
        const { fileName, filesTree } = this.state;

        const fileNameWithExtension = () =>
            fileName.includes(FILE_GROOVY_EXTENSION) ?
                fileName : `${fileName}${FILE_GROOVY_EXTENSION}`;

        return Object.values(filesTree.items)
            .map((item) => item.path)
            .includes(`${this.currentFolderPath}${fileNameWithExtension()}`);
    }

    getScriptsTree() {
        ScriptService.listScripts((data) => {
            this.setState({
                filesTree: data,
                selectedItem: data.items[data.rootId]
            });
        });
    }

    open() {
        this.setState((prevState) => ({
            fileName: '',
            isOpen: true,
            selectedItem: prevState.filesTree.items[prevState.filesTree.rootId],
            submitted: false,
            isSaveButtonClicked: false,
            isValidationError: false,
            errorMessage: EMPTY_FIELD_ERROR_MESSAGE
        }), this.getScriptsTree);
    }

    close() {
        this.overwriteScriptModal.close();
        this.setState({ isOpen: false });
    }

    saveScript() {
        const { scriptSaveData } = this.state;

        this.setState({ submitted: true });
        ScriptService.saveScript(scriptSaveData,
            () => {
                this.props.onSuccess(scriptSaveData);
                this.close();
            },
            (data) => {
                errorNotification(data.message, data.messageDetails);
                this.setState({ submitted: false });
            },
            (data) => {
                this.setState({
                    submitted: false,
                    errorMessage: data.entity.map(error => `${error.message}`).join('; '),
                    isValidationError: true
                });
            });
    }

    onSelect(item) {
        this.setState((prevState) => ({
            selectedItem: item,
            fileName: item.isFolder ? prevState.fileName : item.name
        }));
    }

    onSave() {
        const { selectedItem, fileName, filesTree } = this.state;

        this.setState({ isSaveButtonClicked: true });
        if (fileName && fileName.trim()) {
            const fileNameWithExtension = (name = fileName) =>
                name.includes(FILE_GROOVY_EXTENSION) ?
                    name : `${name}${FILE_GROOVY_EXTENSION}`;

            const fileNameWithoutExtension = () =>
                fileName.replace(FILE_GROOVY_EXTENSION, '');

            const scriptSaveData = {
                groovy: this.props.script.groovy,
                name: fileNameWithoutExtension(),
                path: ''
            };

            if (this.fileAlreadyExists) {
                const existingScript = Object.values(filesTree.items)
                    .find((item) => item.path === `${this.currentFolderPath}${fileNameWithExtension()}`)
                scriptSaveData.path = existingScript.path;
                this.setState({ scriptSaveData }, () => this.overwriteScriptModal.open());
            } else if (!selectedItem.isFolder && fileName !== selectedItem.name) {
                scriptSaveData.path =
                    `${selectedItem.path.replace(fileNameWithExtension(selectedItem.name), '')}${fileNameWithExtension()}`;
                this.setState({ scriptSaveData }, () => this.saveScript());
            } else {
                scriptSaveData.path = `${selectedItem.path}/${fileNameWithExtension()}`;
                this.setState({ scriptSaveData }, () => this.saveScript());
            }
        }
    }

    onNameChange(event) {
        this.setState({
            fileName: event.target.value,
            submitted: false,
            isSaveButtonClicked: false,
            isValidationError: false,
            errorMessage: EMPTY_FIELD_ERROR_MESSAGE
        });
    }

    onFolderCreate(folderName) {
        this.setState((prevState) => {
            const { filesTree, selectedItem } = prevState;

            const folderPath =
                `${this.currentFolderPath}${folderName}`;

            const newFolderEntryItem = {
                id: folderPath,
                children: [],
                isFolder: true,
                name: folderName,
                path: folderPath
            };

            const parentFolder = selectedItem.isFolder ?
                selectedItem : Object.values(filesTree.items).find((item) => item.children.includes(selectedItem.id));

            let newItemsEntries = Object.entries(filesTree.items).map(([key, item]) => {
                if (item.id === parentFolder.id) {
                    return [key, { ...item, children: [...item.children, folderPath] }];
                }
                return [key, item];
            });

            newItemsEntries = [...newItemsEntries, [folderPath, newFolderEntryItem]];

            return {
                filesTree: { ...filesTree, items: Object.fromEntries(newItemsEntries) }
            }
        });
    }

    render() {
        const { isOpen, fileName, selectedItem, submitted, isSaveButtonClicked, errorMessage, isValidationError } = this.state;
        const actions = [
            { text: 'Save', appearance: 'primary', onClick: this.onSave, isLoading: submitted },
            { text: 'Cancel', appearance: 'subtle', onClick: this.close }
        ];

        const content = (
            <>
                <>
                    <label htmlFor="fileName">Name</label>
                    <TextField
                        isCompact={true}
                        isInvalid={isSaveButtonClicked && (!fileName || isValidationError)}
                        name='fileName'
                        value={fileName}
                        onChange={this.onNameChange}
                        onKeyDown={(event) => {
                            if (event.keyCode === ENTER_KEY_CODE) {
                                this.onSave();
                            }
                        }}
                    />
                    {
                        isSaveButtonClicked && (!fileName || !fileName.trim() || isValidationError) &&
                        <ErrorMessage>
                            {errorMessage}
                        </ErrorMessage>
                    }
                    <br />
                </>
                <FilesTree
                    filesTree={this.state.filesTree}
                    onSelect={this.onSelect}
                >
                </FilesTree>
                {
                    selectedItem &&
                    <>
                        <Button
                            appearance={'link'}
                            onClick={() => {
                                this.newFolderModal.open();
                            }}
                            style={linkButtonStyle}
                            spacing={'compact'}
                        >
                            Create new folder
                        </Button>
                        <span style={{ verticalAlign: 'middle', color: colors.grey }}>
                            {`in ${this.currentFolderPath}`}
                        </span>
                    </>
                }
            </>
        );

        return (
            <ModalTransition>
                {isOpen && (
                    <ModalDialog
                        actions={actions}
                        heading={'Save script as...'}
                        onClose={this.close}
                    >
                        {content}
                        <NewFolderModal
                            onSuccess={this.onFolderCreate}
                            ref={(element) => this.newFolderModal = element}
                        />
                        <ConfirmationModal
                            appearance='warning'
                            buttonText='Save'
                            heading='Overwrite script'
                            message={(
                                <span>Are you sure you want to overwrite <b>{fileName}</b>?</span>
                            )}
                            onConfirm={this.saveScript}
                            ref={(element) => this.overwriteScriptModal = element}
                        />
                    </ModalDialog>
                )}
            </ModalTransition>
        );
    }
}