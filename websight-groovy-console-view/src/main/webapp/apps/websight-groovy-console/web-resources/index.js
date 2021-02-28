import React from 'react';
import ReactDOM from 'react-dom';

import 'websight-admin/GlobalStyle';

import GroovyConsole from './GroovyConsole.js';

class App extends React.Component {
    render() {
        return (
            <GroovyConsole />
        );
    }
}

ReactDOM.render(<App/>, document.getElementById('app-root'));