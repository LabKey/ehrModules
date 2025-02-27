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
import { LabKeyQueryRowPropertyProps, QueryModel } from '../../query/model'

import * as actions from './actions'


interface PackagesModelProps {
    active: Array<any>
    data: {[key: string]: any}
    dataIds: Array<any>
    drafts: Array<any>
    filteredActive?: Array<any>
    filteredDrafts?: Array<any>
    input?: string
    isError: boolean
    isInit?: boolean
    isWarning?: boolean
    message: string
    packageCount: number
    showDrafts?: boolean
}

// may make more sense for this to be in wizards/packages/packageSearch?
export class PackagesModel implements PackagesModelProps {
    active: Array<any> = [];
    data: {[key: string]: any} = {};
    dataIds: Array<any> = [];
    drafts: Array<any> = [];
    filteredActive: Array<any> = [];
    filteredDrafts: Array<any> = [];
    input: string = undefined;
    isError: boolean = false;
    isInit: boolean = false;
    isWarning: boolean = false;
    message: string = undefined;
    packageCount: number = 0;
    showDrafts: boolean = false;

    constructor(props?: Partial<PackagesModel>) {
        if (props) {
            for (let k in props) {
                if (this.hasOwnProperty(k) && props.hasOwnProperty(k)) {
                    this[k] = props[k];
                }
            }
        }
    }

    init(data: QueryModel) {
        return actions.packagesInit(this, data);
    }

    toggleDrafts() {
        return actions.toggleDrafts();
    }
}

interface QueryPackageModelProps {
    Active: LabKeyQueryRowPropertyProps
    Container: LabKeyQueryRowPropertyProps
    Created: LabKeyQueryRowPropertyProps
    CreatedBy: LabKeyQueryRowPropertyProps
    Description: LabKeyQueryRowPropertyProps
    HasEvent: LabKeyQueryRowPropertyProps
    HasProject: LabKeyQueryRowPropertyProps
    ModifiedBy: LabKeyQueryRowPropertyProps
    Narrative: LabKeyQueryRowPropertyProps
    ObjectId: LabKeyQueryRowPropertyProps
    PkgId: LabKeyQueryRowPropertyProps
    QcState: LabKeyQueryRowPropertyProps
    Repeatable: LabKeyQueryRowPropertyProps
    links: any
}

export class QueryPackageModel implements QueryPackageModelProps {
    Active: LabKeyQueryRowPropertyProps = undefined;
    Container: LabKeyQueryRowPropertyProps = undefined;
    Created: LabKeyQueryRowPropertyProps = undefined;
    CreatedBy: LabKeyQueryRowPropertyProps = undefined;
    Description: LabKeyQueryRowPropertyProps = undefined;
    HasEvent: LabKeyQueryRowPropertyProps = undefined;
    HasProject: LabKeyQueryRowPropertyProps = undefined;
    ModifiedBy: LabKeyQueryRowPropertyProps = undefined;
    Narrative: LabKeyQueryRowPropertyProps = undefined;
    ObjectId: LabKeyQueryRowPropertyProps = undefined;
    PkgId: LabKeyQueryRowPropertyProps = undefined;
    QcState: LabKeyQueryRowPropertyProps = undefined;
    Repeatable: LabKeyQueryRowPropertyProps = undefined;
    links: any = undefined;

    constructor(props?: Partial<QueryPackageModel>) {
        if (props) {
            for (let k in props) {
                if (this.hasOwnProperty(k) && props.hasOwnProperty(k)) {
                    this[k] = props[k];
                }
            }
        }
    }
}

interface QuerySuperPackageModelProps {
    container: LabKeyQueryRowPropertyProps
    created: LabKeyQueryRowPropertyProps
    createdBy: LabKeyQueryRowPropertyProps
    modified: LabKeyQueryRowPropertyProps
    modifiedBy: LabKeyQueryRowPropertyProps
    parentSuperPkgId: LabKeyQueryRowPropertyProps
    repeatable: LabKeyQueryRowPropertyProps
    superPkgPath: LabKeyQueryRowPropertyProps
    superPkgId: LabKeyQueryRowPropertyProps
    pkgId: LabKeyQueryRowPropertyProps
    isPrimitive: LabKeyQueryRowPropertyProps
    narrative: LabKeyQueryRowPropertyProps
    links: any
}

export class QuerySuperPackageModel implements QuerySuperPackageModelProps {
    container: LabKeyQueryRowPropertyProps = undefined;
    created: LabKeyQueryRowPropertyProps = undefined;
    createdBy: LabKeyQueryRowPropertyProps = undefined;
    isPrimitive: LabKeyQueryRowPropertyProps = undefined;
    modified: LabKeyQueryRowPropertyProps = undefined;
    modifiedBy: LabKeyQueryRowPropertyProps = undefined;
    narrative: LabKeyQueryRowPropertyProps = undefined;
    parentSuperPkgId: LabKeyQueryRowPropertyProps = undefined;
    repeatable: LabKeyQueryRowPropertyProps = undefined;
    superPkgPath: LabKeyQueryRowPropertyProps = undefined;
    superPkgId: LabKeyQueryRowPropertyProps = undefined;
    pkgId: LabKeyQueryRowPropertyProps = undefined;
    links: any = undefined;

    constructor(props?: Partial<QuerySuperPackageModel>) {
        if (props) {
            for (let k in props) {
                if (this.hasOwnProperty(k) && props.hasOwnProperty(k)) {
                    this[k] = props[k];
                }
            }
        }
    }
}

