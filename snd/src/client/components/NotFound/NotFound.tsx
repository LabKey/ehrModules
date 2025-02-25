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
import * as React from 'react';
import { Panel } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';

export class NotFound extends React.Component<RouteComponentProps<any>, any> {
    render() {
        return (
            <div>
                <Panel>
                    <div>No page found at:</div>
                    <div className="not-found-message">
                        <em>{this.props.location.pathname}</em>
                    </div>
                </Panel>
            </div>
        );
    }
}