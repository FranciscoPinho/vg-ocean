import React from 'react';
import ReactDOM from 'react-dom';
import './semantic/dist/semantic.min.css';
import App from './App';
import { Provider } from "react-redux";
import store from './Store';

import registerServiceWorker from './registerServiceWorker';
ReactDOM.render(<Provider store={store}>
    <App />
</Provider>, document.getElementById('root'));
registerServiceWorker();
