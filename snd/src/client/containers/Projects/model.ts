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

import { LabKeyQueryRowPropertyProps, QueryModel } from '../../query/model'
import * as actions from './actions'
import {AssignedPackageModel} from "../SuperPackages/model";

interface ProjectsModelProps {
    active: Array<any>
    notActive: Array<any>
    data: {[key: string]: any}
    dataIds: Array<any>
    drafts: Array<any>
    filteredActive?: Array<any>
    filteredNotActive?: Array<any>
    filteredDrafts?: Array<any>
    input?: string
    isError: boolean
    isInit?: boolean
    isWarning?: boolean
    message: string
    projectCount: number
    showDrafts?: boolean
    showNotActive?: boolean
}

export class ProjectsModel implements ProjectsModelProps {
    active: Array<any> = [];
    notActive: Array<any> = [];
    data: {[key: string]: any} = {};
    dataIds: Array<any> = [];
    drafts: Array<any> = [];
    filteredActive: Array<any> = [];
    filteredNotActive: Array<any> = [];
    filteredDrafts: Array<any> = [];
    input: string = undefined;
    isError: boolean = false;
    isInit: boolean = false;
    isWarning: boolean = false;
    message: string = undefined;
    projectCount: number = 0;
    showDrafts: boolean = false;
    showNotActive: boolean = false;

    constructor(props?: Partial<ProjectsModel>) {
        if (props) {
            for (let k in props) {
                if (this.hasOwnProperty(k) && props.hasOwnProperty(k)) {
                    this[k] = props[k];
                }
            }
        }
    }

    init(data: QueryModel) {
        return actions.projectsInit(this, data);
    }

    toggleDrafts() {
        return actions.toggleDrafts();
    }

    toggleNotActive() {
        return actions.toggleNotActive();
    }
}

interface QueryProjectModelProps {
    Active: LabKeyQueryRowPropertyProps
    Description: LabKeyQueryRowPropertyProps
    EndDate: LabKeyQueryRowPropertyProps
    HasEvent: LabKeyQueryRowPropertyProps
    ObjectId: LabKeyQueryRowPropertyProps
    ProjectId: LabKeyQueryRowPropertyProps
    ReferenceId: LabKeyQueryRowPropertyProps
    Repeatable: LabKeyQueryRowPropertyProps
    RevisionNum: LabKeyQueryRowPropertyProps
    StartDate: LabKeyQueryRowPropertyProps
    Latest: boolean
    links: any
}

export class QueryProjectModel implements QueryProjectModelProps {
    Active: LabKeyQueryRowPropertyProps = undefined;
    Description: LabKeyQueryRowPropertyProps = undefined;
    EndDate: LabKeyQueryRowPropertyProps = undefined;
    HasEvent: LabKeyQueryRowPropertyProps = undefined;
    ObjectId: LabKeyQueryRowPropertyProps = undefined;
    ProjectId: LabKeyQueryRowPropertyProps = undefined;
    ReferenceId: LabKeyQueryRowPropertyProps = undefined;
    Repeatable: LabKeyQueryRowPropertyProps = undefined;
    RevisionNum: LabKeyQueryRowPropertyProps = undefined;
    StartDate: LabKeyQueryRowPropertyProps = undefined;
    Latest: boolean = undefined;
    links: any = undefined;

    constructor(props?: Partial<QueryProjectModel>) {
        if (props) {
            for (let k in props) {
                if (this.hasOwnProperty(k) && props.hasOwnProperty(k)) {
                    this[k] = props[k];
                }
            }
        }
    }
}