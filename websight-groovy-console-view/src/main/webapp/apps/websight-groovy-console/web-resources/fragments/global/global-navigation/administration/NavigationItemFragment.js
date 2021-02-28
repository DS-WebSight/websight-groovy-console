import React from 'react';
import { LinkItem } from '@atlaskit/menu';

import { NavigationItemIcon } from 'websight-admin/Icons';

import { GROOVY_CONSOLE_ROOT_PATH } from '../../../../utils/GroovyConsoleConstants.js';

export default class NavigationItemFragment extends React.Component {
    render() {
        return (
            <LinkItem
                href={GROOVY_CONSOLE_ROOT_PATH}
                elemBefore={<NavigationItemIcon className='material-icons'>code</NavigationItemIcon>}
            >
                Groovy Console
            </LinkItem>
        );
    }
}
