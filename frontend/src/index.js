import React from 'react';
import ReactDOM from 'react-dom';
import './semantic/dist/semantic.min.css';
import App from './App.js';

import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
