/*
 * Copyright (c) 2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// React
import * as React from 'react';
import * as ReactDom from 'react-dom';

// Redux
import { applyMiddleware, compose, createStore } from 'redux';
import { Provider } from 'react-redux';
import { composeWithDevTools } from 'redux-devtools-extension';

// Routing
import { createBrowserHistory, createHashHistory } from 'history';
import { Route } from 'react-router-dom';
import { ConnectedRouter, routerMiddleware } from 'react-router-redux';

// Middleware
import thunk from 'redux-thunk';

// Components
import { App } from './containers/App/App';

// Reducers
import { reducers } from './reducers/index';

// switch history to createBrowser history after servlet work
const history = createHashHistory();
const middleware = applyMiddleware(thunk, routerMiddleware(history));

const storeCreator = compose(
    middleware
)(createStore);
const store = storeCreator(
    reducers
    // uncomment following line to view redux dev tools in chrome
    // ,composeWithDevTools()
);

jQuery(() => {
    ReactDom.render(
        <Provider store={store}>
            <div className="app">
                { /* ConnectedRouter will use the store from Provider automatically */ }
                <ConnectedRouter history={history}>
                    <div>
                        <Route path="/" component={App}/>
                    </div>
                </ConnectedRouter>
            </div>
        </Provider>,
        document.getElementById('app')
    );
});