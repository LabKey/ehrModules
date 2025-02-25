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
import * as actions from './actions'
import {AttributeLookupProps, PropertyDescriptor} from "../model";
import {AssignedPackageModel} from "../../SuperPackages/model";
import {SubPackageSubmissionModel} from "../SuperPackages/model";
import {VIEW_TYPES} from "../../App/constants";

interface PackageQueryResponseProps {
    json: Array<PackageModel>
}

export class PackageQueryResponse implements PackageQueryResponseProps {
    json: Array<PackageModel> = [];
}

interface PackageModelProps {
    active?: boolean
    attributes?: Array<PropertyDescriptor>
    attributeLookups?: Array<AttributeLookupProps>
    categories?: Array<number>
    container?: string
    description?: string
    extraFields?: Array<PropertyDescriptor>
    hasEvent?: boolean
    hasProject?: boolean
    narrative?: string
    narrativeKeywords?: {[key:string] : number}
    pkgId?: number
    qcState?: any
    repeatable?: boolean
    subPackages?: Array<AssignedPackageModel>
}

export class PackageModel implements PackageModelProps {
    active: boolean = false;
    attributes: Array<PropertyDescriptor> = [];
    attributeLookups: Array<AttributeLookupProps> = [];
    categories: Array<number> = [];
    container: string = undefined;
    description: string = undefined;
    extraFields: Array<PropertyDescriptor> = [];
    hasEvent: boolean = false;
    hasProject: boolean = false;
    narrative: string = undefined;
    narrativeKeywords: {[key:string] : number} = {};
    pkgId: number = undefined;
    qcState: any = null; // todo: find out qcState type
    repeatable: boolean = false;
    subPackages: Array<AssignedPackageModel> = [];

    constructor(props?: Partial<PackageModel>) {
        if (props) {
            for (let k in props) {
                if (this.hasOwnProperty(k) && props.hasOwnProperty(k)) {
                    this[k] = props[k];
                }
            }
        }
    }
}

interface PackageSubmissionModelProps {
    active?: boolean;
    attributes?: Array<PropertyDescriptor>;
    categories?: Array<number>;
    clone?: boolean;
    container?: string;
    description?: string;
    extraFields?: Array<PropertyDescriptor>;
    id?: number;
    narrative?: string;
    pkgId?: number;
    qcState?: any;
    repeatable?: boolean;
    subPackages?: Array<SubPackageSubmissionModel>;
}

export class PackageSubmissionModel implements PackageSubmissionModelProps {
    active: boolean = false;
    attributes: Array<PropertyDescriptor> = [];
    categories: Array<number> = [];
    clone: boolean = false;
    container: string = undefined;
    description: string = undefined;
    extraFields: Array<PropertyDescriptor> = [];
    id: number = undefined;
    narrative: string = undefined;
    pkgId: number = undefined;
    qcState: any = null;
    repeatable: boolean = false;
    subPackages: Array<SubPackageSubmissionModel> = [];

    constructor(props: Partial<PackageSubmissionModel>) {
        if (props) {
            for (let k in props) {
                if (this.hasOwnProperty(k) && props.hasOwnProperty(k)) {
                    this[k] = props[k];
                }
            }
        }
    }
}

interface PackageWizardModelProps {
    data?: PackageModel;
    formView?: VIEW_TYPES;
    initialData?: PackageModel;
    isActive?: boolean;
    isError?: boolean;
    isSubmitted?: boolean;
    isSubmitting?: boolean;
    isValid?: boolean;
    isWarning?: boolean;
    message?: string;
    narrativePkg?: AssignedPackageModel;
    packageCount?: number;
    packageId?: number
    packageLoaded?: boolean;
    packageLoading?: boolean;
}

export class PackageWizardModel implements PackageWizardModelProps {
    data: PackageModel = new PackageModel();
    formView: VIEW_TYPES = undefined;
    initialData: PackageModel = new PackageModel();
    isActive: boolean = false;
    isError: boolean = false;
    isSubmitted: boolean = false;
    isSubmitting: boolean = false;
    isValid: boolean = false;
    isWarning: boolean = false;
    message: string = undefined;
    narrativePkg?: AssignedPackageModel = undefined;
    packageCount: number = 0;
    packageId: number = undefined;
    packageLoaded: boolean = false;
    packageLoading: boolean = false;

    constructor(props: Partial<PackageWizardModelProps>) {
        if (props) {
            for (let k in props) {
                if (this.hasOwnProperty(k) && props.hasOwnProperty(k)) {
                    this[k] = props[k];
                }
            }
        }
    }

    checkValid() {
        return actions.packageCheckValid(this);
    }

    formatPackageValues(active: boolean): PackageSubmissionModel {
        return actions.formatPackageValues(this, active);
    }

    invalidate() {
        return actions.invalidateModel(this);
    }

    loaded() {
        return actions.packageLoaded(this);
    }

    loading() {
        return actions.packageLoading(this);
    }

    parseAttribtues() {
        return actions.parseAttributes(this);
    }

    saveField(name, value) {
        return actions.saveField(this, name, value);
    }

    saveNarrative(narrative: string) {
        return actions.saveNarrative(this, narrative);
    }

    setError(error) {
        return actions.packageError(this, error);
    }

    setWarning(warning?: string) {
        return actions.packageWarning(this, warning);
    }

    submitForm(active: boolean) {
        return actions.save(this, this.formatPackageValues(active));
    }

    success(response: PackageQueryResponse, view: VIEW_TYPES) {
        return actions.packageSuccess(this, response, view);
    }
}

interface PackageWizardContainerProps {
    packageData: {[key: string]: PackageWizardModel}
}

export class PackageWizardContainer implements PackageWizardContainerProps {
    packageData: {[key: string]: PackageWizardModel} = {};

    constructor(props?: Partial<PackageWizardContainer>) {
        if (props) {
            for (let k in props) {
                if (this.hasOwnProperty(k) && props.hasOwnProperty(k)) {
                    this[k] = props[k];
                }
            }
        }
    }
}