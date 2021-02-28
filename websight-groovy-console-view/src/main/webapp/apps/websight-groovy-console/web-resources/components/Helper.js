import React from 'react';
import { IntlProvider } from 'react-intl';
import { AkCode, AkCodeBlock } from '@atlaskit/code';
import { RightSidePanel } from '@atlaskit/right-side-panel';
import SectionMessage from '@atlaskit/section-message';
import styled from 'styled-components';
import Help from '@atlaskit/help';

import { GlobalStyle } from 'websight-admin/GlobalStyle';

const HelpArticleContainer = styled.div`
    margin-bottom: 40px;
    padding: 20px;
`;

const HelpArticleTitleContainer = styled.h2`
    margin-bottom: 15px;
`;

const MethodLiPointContainer = styled.div`
    margin-bottom: 15px;
`;

const MethodExampleContainer = styled.div`
    margin-top: 10px;
`;

const listStyle = {
    marginTop: '6px',
    paddingLeft: '30px'
};

const TextCode = (props) => <AkCode language='text' text={props.text} />

export default class Helper extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isOpen: false
        }

        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
    }

    open() {
        this.setState((prevState) => ({ isOpen: !prevState.isOpen }));
    }

    close() {
        this.setState({ isOpen: false });
    }

    render() {
        const { isOpen } = this.state;

        return (
            <>
                <GlobalStyle styles={`
                    .helper-container--open + div {
                        flex: 0 0 500px !important;
                        width: 500px !important;
                    }
                    .helper-container--open + div > div {
                        width: 500px;
                    }
                `} />
                <div className={`helper-container ${isOpen ? 'helper-container--open' : ''}`}>
                    <RightSidePanel
                        isOpen={isOpen}
                        attachPanelTo="groovy-container"
                        onOpenAnimationFinished={this.props.onAnimationFinished}
                        onCloseAnimationFinished={this.props.onAnimationFinished}
                    >
                        <IntlProvider locale='en'>
                            <Help
                                onButtonCloseClick={this.close}
                                footer={
                                    <span>Footer</span>
                                }
                            >
                                <HelpArticleContainer>
                                    <HelpArticleTitleContainer>Bindings</HelpArticleTitleContainer>
                                    <p>
                                        All of the binding variables listed below are ready to use in a Groovy script:
                                        <ul style={listStyle}>
                                            {
                                                [
                                                    (<><TextCode text='data' /> - if provided data string is valid JSON then <TextCode text='data' /> is a <TextCode text='java.util.Map' /> object, otherwise it is available as a <TextCode text='String' /></>),
                                                    (<><TextCode text='bundleContext' /> - <TextCode text='org.osgi.framework.BundleContext' /></>),
                                                    (<><TextCode text='resourceResolver' /> - <TextCode text='org.apache.sling.api.resource.ResourceResolver' /></>),
                                                    (<><TextCode text='session' /> - <TextCode text='javax.jcr.Session' /></>),
                                                    (<><TextCode text='request' /> - <TextCode text='org.apache.sling.api.SlingHttpServletRequest' /></>),
                                                    (<><TextCode text='out' /> - <TextCode text='java.io.StringWriter' /></>),
                                                    (<><TextCode text='log' /> - <TextCode text='org.slf4j.Logger' /></>)
                                                ].map(line => <li key={`helper-variable-${line}`}>{line}</li>)
                                            }
                                        </ul>
                                    </p>
                                    <HelpArticleTitleContainer>Imports</HelpArticleTitleContainer>
                                    <p>
                                        List of packages imported automatically into all scripts:
                                        <ul style={listStyle}>
                                            {
                                                [
                                                    'javax.jcr',
                                                    'org.apache.sling.api',
                                                    'org.apache.sling.api.resource'
                                                ].map(line => <li key={`helper-package-${line}`}><TextCode text={line} /></li>)
                                            }
                                        </ul>
                                        <br />
                                        <SectionMessage appearance="info">Pre-imported packages or individual classes can be configured via OSGi configuration (Groovy Console Compiler Configuration Service).</SectionMessage>
                                    </p>
                                    <HelpArticleTitleContainer>Methods</HelpArticleTitleContainer>
                                    <p>
                                        List of methods available for use in all scripts:
                                        <ul style={listStyle}>
                                            {
                                                [
                                                    {
                                                        method: 'getNode(String path)',
                                                        description: (<>Returns the <TextCode text='javax.jcr.Node' /> for a specified absolute path. Throws <TextCode text='javax.jcr.PathNotFoundException' /> if it does not exist, or <TextCode text='javax.jcr.RepositoryException' /> if other error occurs.</>)
                                                    },
                                                    {
                                                        method: 'getResource(String path)',
                                                        description: (<>Returns the <TextCode text='org.apache.sling.api.resource.Resource' /> for a given path.</>)
                                                    },
                                                    {
                                                        method: 'recursive(Node node, Closure closure)',
                                                        description: (<>Provides a simple way to traverse through all the children of a given <TextCode text='javax.jcr.Node' />.</>),
                                                        example: 'Node contentNode = getNode("/content") \nrecursive(contentNode) { node -> \n    println node.getPath() \n}'
                                                    },
                                                    {
                                                        method: 'recursive(Resource resource, Closure closure)',
                                                        description: (<>Provides a simple way to traverse through all the children of a given <TextCode text='org.apache.sling.api.resource.Resource' />.</>),
                                                        example: 'Resource contentResource = getResource("/content") \nrecursive(contentResource) { resource -> \n    println resource.getPath() \n}'
                                                    },
                                                    {
                                                        method: 'move(String source, String destination)',
                                                        description: 'Moves a node from a given source to provided destination. Please note that session is automatically saved after move.'
                                                    },
                                                    {
                                                        method: 'rename(Node node, String newName)',
                                                        description: (<>Changes the name of given <TextCode text='javax.jcr.Node' /> to the <TextCode text='newName' />. Please note that session is automatically saved after rename.</>)
                                                    },
                                                    {
                                                        method: 'copy(String source, String destination)',
                                                        description: (<>Copies <TextCode text='javax.jcr.Node' /> from a <TextCode text='source' /> path to a given <TextCode text='destination' /> path.</>)
                                                    },
                                                    {
                                                        method: 'save()',
                                                        description: 'Saves the current session.'
                                                    },
                                                    {
                                                        method: 'getModel(String path, Class type)',
                                                        description: (<>Instantiates the given Sling Model for the resource from a given <TextCode text='path' />.</>)
                                                    },
                                                    {
                                                        method: 'getService(Class type)',
                                                        description: (<>Returns a service that implements and is registered under the given <TextCode text='type' />.</>)
                                                    },
                                                    {
                                                        method: 'getService(String className)',
                                                        description: (<>Returns a service that implements and is registered under the given <TextCode text='className' />.</>)
                                                    },
                                                    {
                                                        method: 'getServices(Class type, String filter)',
                                                        description: (<>Returns a list of services that implement and are registered under the given <TextCode text='type' /> and match the specified <TextCode text='filter' /> expression.</>)
                                                    },
                                                    {
                                                        method: 'getServices(String className, String filter)',
                                                        description: (<>Returns a list of services that implement and are registered under the given <TextCode text='className' /> and match the specified <TextCode text='filter' /> expression.</>)
                                                    }
                                                ].map((line) => (
                                                    <li key={`helper-method-${line.method}`}>
                                                        <MethodLiPointContainer>
                                                            <AkCode language="java" text={line.method} />
                                                            <div>{line.description}</div>
                                                            {
                                                                line.example && (
                                                                    <MethodExampleContainer>
                                                                        Example:
                                                                        <AkCodeBlock language="java" text={line.example || ''} showLineNumbers={false} />
                                                                    </MethodExampleContainer>
                                                                )
                                                            }
                                                        </MethodLiPointContainer>
                                                    </li>
                                                ))
                                            }
                                        </ul>
                                        <br />
                                        <SectionMessage appearance="info">Service objects provided by above methods are automatically released from the bundle context after script execution.</SectionMessage>
                                    </p>
                                </HelpArticleContainer>
                            </Help>
                        </IntlProvider>
                    </RightSidePanel>
                </div>
            </>
        );
    }
}
