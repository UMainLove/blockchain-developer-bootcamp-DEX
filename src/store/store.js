//this is the database that stores the states after every action
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

//import reducers 
import { provider, tokens } from './reducers'

const reducer = combineReducers({       /* this function puts together all reducers */
	provider,
	tokens
})


//phases of the store
const initialState = {}

const middleware = [thunk]

const store = createStore(reducer, initialState, composeWithDevTools(applyMiddleware(...middleware)))

export default store;