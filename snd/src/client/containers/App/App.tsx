/*
 * Copyright (c) 2017-2018 LabKey Corporation
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
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux'
import { Route, RouteComponentProps, Switch } from 'react-router-dom';

import { AppMessage, AppModel } from './model'
import * as actions from './actions'
import { UserModel } from '../SignIn/model'

import {CrumbRoutes, RouteProps, Routes} from '../../routing/Routes'
import {Crumb} from "../../components/Crumb/Crumb";

interface AppOwnProps extends RouteComponentProps<{}> {}
interface AppStateDispatch {
    dispatch?: Dispatch<any>
    dismissWarning?: (id?: number) => any
    clearAllErrors?: (id?: number) => any
}
interface AppStateProps {
    dispatch?: Dispatch<any>
    app?: AppModel
    user?: UserModel
}

type AppProps = AppOwnProps & AppStateProps & AppStateDispatch;

function mapStateToProps(state: APP_STATE_PROPS) {
    return {
        app: state.app,
        user: state.user
    }
}

function mapDispatchToProps(dispatch: Dispatch<any>): AppStateDispatch {
    return {
        dismissWarning: (id?: number) => dispatch(actions.resetAppError(id)),
        clearAllErrors: () => dispatch(actions.clearAllErrors())
    }
}

export class AppImpl extends React.Component<AppProps, {}> {

    static getMessageTypes(msg: AppMessage): {
        alertClassName: string
        alertType: string
    } {
        let alertClassName,
            alertType;

        if (msg.role === 'error') {
            alertClassName = 'alert-danger';
            alertType = 'alert';
        }
        else if (msg.role === 'warning') {
            alertClassName = 'alert-warning';
            alertType = 'warning';
        }
        else {
            alertClassName = 'alert-success';
            alertType = 'success';
        }

        return {
            alertClassName,
            alertType
        }
    }

    renderMessage() {
        const { app, dismissWarning } = this.props;

        if (app.messages && app.messages.length) {
            return (
                <div className='app-alert-container'>
                    {app.messages.map(msg => {
                        const alerts = AppImpl.getMessageTypes(msg);
                        const { alertClassName, alertType } = alerts;

                        if (msg.message.indexOf('\n') === 0) {
                            msg.message = msg.message.substring(1)
                        }
                        let msgs = msg.message.split('\n');

                        return (
                            <div className="app-error" key={msg.message + msg.id}>
                                <div className={['alert-dismiss', alertClassName].join(' ')}>
                                    <i className='fa fa-times' onClick={() => dismissWarning(msg.id)}/>
                                </div>
                                <div className={['alert', alertClassName].join(' ')} role={alertType}>
                                    {msgs.map(alertMsg => {
                                        return (
                                            <span key={alertMsg + msg.id}>
                                            {alertMsg}
                                            <br />
                                            </span>
                                        )
                                    })
                                    }
                                </div>
                            </div>
                        )
                    })}
                </div>
            );
        }
    }

    render() {
        const { user, clearAllErrors } = this.props;

        if (!user.isSignedIn) {
            return (
                <div className="error">Login Required</div>
            );
        }

        return (
            <div className={"app-container"}>
                <div>
                    <Switch>
                        {CrumbRoutes.map((route: RouteProps, index: number) => {
                            return <Route
                                key={index}
                                path={route.path}
                                exact={route.exact}
                                render={route.component !== null ? (routeProps) => (
                                    <Crumb {...routeProps} {...route.props} {...{clearAllErrors}} />
                                ) : null}
                                />;
                        })}
                    </Switch>
                    {this.renderMessage()}
                    <Switch>
                        {Routes.map((route: RouteProps, index: number) => {
                            return <Route
                                key={index}
                                path={route.path}
                                exact={route.exact}
                                component={route.component}/>;
                        })}
                    </Switch>
                </div>
            </div>
        )
    }
}

export const App = connect<any, AppStateDispatch, AppProps>(
    mapStateToProps,
    mapDispatchToProps
)(AppImpl);