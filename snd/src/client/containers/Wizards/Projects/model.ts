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

import * as actions from './actions';
import {PropertyDescriptor} from "../model";
import {AssignedPackageModel} from "../../SuperPackages/model";
import {SubPackageSubmissionModel} from "../SuperPackages/model";
import {VIEW_TYPES} from "../../App/constants";

interface ProjectSubmissionModelProps {
    active: boolean;
    isRevision?: boolean;
    isEdit?: boolean;
    copyRevisedPkgs?: boolean;
    description: string;
    extraFields?: Array<PropertyDescriptor>;
    projectId: number;
    revisionNum: number;
    startDate: string;
    endDate: string;
    endDateRevised?: string;
    referenceId: number;
    qcState?: any;
    projectItems?: Array<SubPackageSubmissionModel>;
}

export class ProjectSubmissionModel implements ProjectSubmissionModelProps {
    active: boolean = false;
    isRevision: boolean = false;
    isEdit: boolean = false;
    copyRevisedPkgs: boolean = false;
    description: string = undefined;
    extraFields: Array<PropertyDescriptor> = [];
    projectId: number = undefined;
    revisionNum: number = undefined;
    startDate: string = undefined;
    endDate: string = undefined;
    endDateRevised: string = undefined;
    referenceId: number = undefined;
    qcState: any = null;
    projectItems: Array<SubPackageSubmissionModel> = [];

    constructor(props: Partial<ProjectSubmissionModel>) {
        if (props) {
            for (let k in props) {
                if (this.hasOwnProperty(k) && props.hasOwnProperty(k)) {
                    this[k] = props[k];
                }
            }
        }
    }
}

interface ProjectQueryResponseProps {
    json: ProjectModel
}

export class ProjectQueryResponse {
    json: ProjectModel = undefined;

    constructor(props?: Partial<ProjectModel>) {
        if (props) {
            for (let k in props) {
                if (this.hasOwnProperty(k) && props.hasOwnProperty(k)) {
                    this[k] = props[k];
                }
            }
        }
    }
}

interface IProjectAssignedPackageModel {
    projectItemId?: number
}

export class ProjectAssignedPackageModel extends AssignedPackageModel implements IProjectAssignedPackageModel {
    projectItemId: number = undefined;

    constructor(props?: Partial<ProjectAssignedPackageModel>) {
        super(props);
        this.projectItemId = props.projectItemId;
    }
}

interface ProjectModelProps {
    active?: boolean
    container?: string
    description?: string
    extraFields?: Array<PropertyDescriptor>
    hasEvent?: boolean
    projectId?: number
    revisionNum?: number
    startDate?: string
    endDate?: string
    endDateRevised?: string
    objectId?: string
    referenceId?: number
    copyRevisedPkgs?: boolean
    qcState?: any
    subPackages?: Array<ProjectAssignedPackageModel>
}

export class ProjectModel implements ProjectModelProps {
    active: boolean = false;
    container: string = undefined;
    description: string = undefined;
    extraFields: Array<PropertyDescriptor> = [];
    hasEvent: boolean = false;
    projectId: number = undefined;
    revisionNum: number = undefined;
    startDate: string = undefined;
    endDate: string = undefined;
    endDateRevised: string = undefined;
    objectId: string = undefined;
    referenceId: number = undefined;
    copyRevisedPkgs: boolean = false;
    qcState: any = null; // todo: find out qcState type
    subPackages: Array<ProjectAssignedPackageModel> = [];

    constructor(props?: Partial<ProjectModel>) {
        if (props) {
            for (let k in props) {
                if (this.hasOwnProperty(k) && props.hasOwnProperty(k)) {
                    this[k] = props[k];
                }
            }
        }
    }
}

interface ProjectWizardModelProps {
    data?: ProjectModel;
    formView?: VIEW_TYPES;
    initialData?: ProjectModel;
    isActive?: boolean;
    isError?: boolean;
    isSubmitted?: boolean;
    isSubmitting?: boolean;
    isValid?: boolean;
    isWarning?: boolean;
    message?: string;
    narrativePkg?: AssignedPackageModel;
    // packageCount?: number;
    projectId?: number
    revisionNum?: number
    objectId?: number
    projectLoaded?: boolean;
    projectLoading?: boolean;
}

export class ProjectWizardModel implements ProjectWizardModelProps {
    data: ProjectModel = new ProjectModel();
    formView: VIEW_TYPES = undefined;
    initialData: ProjectModel = new ProjectModel();
    isActive: boolean = false;
    isError: boolean = false;
    isSubmitted: boolean = false;
    isSubmitting: boolean = false;
    isValid: boolean = false;
    isWarning: boolean = false;
    message: string = undefined;
    narrativePkg?: AssignedPackageModel = undefined;
    // packageCount: number = 0;
    objectId: number = undefined;
    projectId: number = undefined;
    revisionNum: number = undefined;
    projectLoaded: boolean = false;
    projectLoading: boolean = false;

    constructor(props: Partial<ProjectWizardModelProps>) {
        if (props) {
            for (let k in props) {
                if (this.hasOwnProperty(k) && props.hasOwnProperty(k)) {
                    this[k] = props[k];
                }
            }
        }
    }

    checkValid() {
        return actions.projectCheckValid(this);
    }

    formatProjectValues(active: boolean): ProjectSubmissionModel {
        return actions.formatProjectValues(this, active);
    }

    invalidate() {
        return actions.invalidateModel(this);
    }

    loaded() {
        return actions.projectLoaded(this);
    }

    loading() {
        return actions.projectLoading(this);
    }

    saveField(name, value) {
        return actions.saveField(this, name, value);
    }

    setError(error) {
        return actions.projectError(this, error);
    }

    setWarning(warning?: string) {
        return actions.projectWarning(this, warning);
    }

    submitForm(active: boolean) {
        return actions.save(this, this.formatProjectValues(active));
    }

    success(response: ProjectQueryResponse, view: VIEW_TYPES) {
        return actions.projectSuccess(this, response, view);
    }
}

interface ProjectIdRevProps {
    id: number
    rev: number
}

export class ProjectIdRev implements ProjectIdRevProps {
    id: number = undefined;
    rev: number = undefined;

    constructor(props: Partial<ProjectIdRev>) {
        if (props) {
            for (let k in props) {
                if (this.hasOwnProperty(k) && props.hasOwnProperty(k)) {
                    this[k] = props[k];
                }
            }
        }
    }
}

interface ProjectWizardContainerProps {
    projectData: {[key: string]: ProjectWizardModel}
}

export class ProjectWizardContainer implements ProjectWizardContainerProps {
    projectData: {[key: string]: ProjectWizardModel} = {};

    constructor(props?: Partial<ProjectWizardContainer>) {
        if (props) {
            for (let k in props) {
                if (this.hasOwnProperty(k) && props.hasOwnProperty(k)) {
                    this[k] = props[k];
                }
            }
        }
    }
}