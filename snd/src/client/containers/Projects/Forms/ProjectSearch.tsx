/*
 * Copyright (c) 2018 LabKey Corporation
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
import { RouteComponentProps } from 'react-router-dom'

import { QuerySearch } from '../../../query/QuerySearch'

import { ProjectViewer } from './ProjectViewer'
import { PROJECT_SQL, REQUIRED_COLUMNS } from '../constants'

interface ProjectSearchOwnProps extends RouteComponentProps<{}> {}

export class ProjectSearch extends React.Component<ProjectSearchOwnProps, any> {

    render() {
        return (
            <Panel>
                <QuerySearch
                    id='projectSearch'
                    modelProps={{requiredColumns: REQUIRED_COLUMNS.PROJECTS}}
                    schemaQuery={PROJECT_SQL}>
                    <ProjectViewer history={this.props.history}/>
                </QuerySearch>
            </Panel>
        )
    }
}