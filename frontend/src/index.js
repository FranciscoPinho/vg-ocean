import React from 'react'
import ReactDOM from 'react-dom'
import './semantic/dist/semantic.min.css'
import Home from './components/Home'
import { Provider } from "react-redux"
import { BrowserRouter as Router, Route, Switch} from "react-router-dom" 
import Addplus from './components/Addplus/Addplus'
import store from './Store'
import './components/Common/Common.css'
import registerServiceWorker from './registerServiceWorker'
document.title="VGOcean"

export var server_url

if (process.env.NODE_ENV !== 'production') {
    server_url = process.env.REACT_APP_SERVER_BASE_URL;
}

ReactDOM.render(<Provider store={store}>
     <Router>
        <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/add+" component={Addplus} />
        </Switch>
    </Router>
</Provider>, document.getElementById('root'))
registerServiceWorker()
