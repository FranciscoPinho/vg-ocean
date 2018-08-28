import { applyMiddleware, createStore } from "redux"
import logger from "redux-logger"
//import promise from "redux-promise-middleware"

import reducer from "./reducers/combineReducers"

const middleware = applyMiddleware(logger)
const store =  createStore(reducer, middleware)

export default store