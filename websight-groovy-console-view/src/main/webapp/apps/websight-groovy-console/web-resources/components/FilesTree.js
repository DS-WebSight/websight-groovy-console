import React from 'react';
import Tree, {
    mutateTree
} from '@atlaskit/tree';
import styled from 'styled-components';

import { TreeIcon } from 'websight-admin/Icons';
import { colors } from 'websight-admin/theme';

const PADDING_PER_LEVEL = 20;

const TreeContainer = styled.div`
    height: 250px;
    overflow: auto;
    padding: 5px;
    border: 1px solid black;
    position: relative;
`;

const TreeItemStyle = {
    display: 'inline',
    padding: '2px'
};

const TreeItemSelectedStyle = {
    display: 'inline',
    padding: '2px',
    background: colors.lightBlue
};

const getIcon = (item) => {
    if (item.isFolder) {
        return item.isExpanded ?
            <TreeIcon className='material-icons-outlined'>folder_open</TreeIcon>
            :
            <TreeIcon className='material-icons-outlined'>folder</TreeIcon>
        ;
    }
    return <TreeIcon className='material-icons'>insert_drive_file</TreeIcon>
};

export default class FilesTree extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tree: this.props.filesTree
        };

        this.onSelect = this.onSelect.bind(this);
        this.onFolderSelect = this.onFolderSelect.bind(this);
        this.selectItem = this.selectItem.bind(this);
        this.renderItem = this.renderItem.bind(this);
    }

    componentWillReceiveProps(props) {
        const mergeItems = (oldItem = {}, newItem) =>
            ({ ...oldItem, ...newItem });

        if (Object.keys(props.filesTree) !== Object.keys(this.state.tree)) {
            this.setState((prevState) => {
                const treeItemsEntries = Object.entries(props.filesTree.items)
                    .map(([key, item]) => [key, mergeItems(prevState.tree.items[key], item)]);
                return { tree: { ...props.filesTree, items: Object.fromEntries(treeItemsEntries) } }
            });
        }
    }

    rootItem() {
        return this.state.tree.items[this.state.tree.rootId];
    }

    selectItem(tree, item) {
        const keys = Object.keys(tree.items);
        let newTree = { ...tree };
        keys.forEach((id) => newTree = mutateTree(newTree, id, { isSelected: false }));

        let selected = !item.isSelected;

        if (item.isFolder) {
            item.isExpanded ? selected = false : selected = true;
        }

        return mutateTree(newTree, item.id, { isSelected: selected });
    }

    onFolderSelect(item) {
        this.setState((prevState) => {
            const { tree } = prevState;
            const newTree = this.selectItem(tree, item);

            return {
                tree: mutateTree(newTree, item.id, { isExpanded: !item.isExpanded })
            }
        }, () => item.isExpanded ? this.props.onSelect(this.rootItem()) :  this.props.onSelect(item));
    }

    onSelect(item) {
        this.setState((prevState) => {
            const { tree } = prevState;

            return {
                tree: this.selectItem(tree, item)
            }
        }, () => this.props.onSelect(item.isSelected ? this.rootItem() : item));
    }

    renderItem({ item, provided }) {
        return (
            <div ref={provided.innerRef}
                {...provided.draggableProps}
            >
                <div
                    onClick={() => {
                        if (item.isFolder) {
                            this.onFolderSelect(item);
                        } else {
                            this.onSelect(item);
                        }
                    }}
                    style={item.isSelected ? TreeItemSelectedStyle : TreeItemStyle}
                >
                    <span>{getIcon(item)}</span>
                    <span style={{ cursor: 'pointer' }}>{item.name}</span>
                </div>
            </div>
        );
    }

    render() {
        const { tree } = this.state;

        return (
            <TreeContainer>
                <Tree
                    tree={tree}
                    renderItem={this.renderItem}
                    offsetPerLevel={PADDING_PER_LEVEL}
                    isDragEnabled={false}
                />
                {this.props.children}
            </TreeContainer>
        );
    }
}
