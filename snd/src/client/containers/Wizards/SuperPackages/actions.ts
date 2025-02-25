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


import {fetchPackage} from "../Packages/actions";
import {PackageModel, PackageQueryResponse, PackageWizardModel} from "../Packages/model";
import {AssignedPackageModel} from "../../SuperPackages/model";
import {ProjectAssignedPackageModel, ProjectWizardModel} from "../Projects/model";
import {SubPackageSubmissionModel} from "./model";



function getPackageModelFromResponse(response: PackageQueryResponse): PackageModel {
    // the response should have exactly one row
    return Array.isArray(response.json) && response.json.length == 1 ?
        response.json[0] :
        new PackageModel();
}

export function queryPackageFullNarrative(id: number, model: PackageWizardModel | ProjectWizardModel, dispatchType: string ) {
    return (dispatch) => {
        return fetchPackage(id, false, false).then((response: PackageQueryResponse) => {
            const packageModel = getPackageModelFromResponse(response);
            const narrativePkg = new AssignedPackageModel({
                pkgId: packageModel.pkgId,
                description: packageModel.description,
                narrative: packageModel.narrative,
                repeatable: packageModel.repeatable,
                superPkgId: undefined,
                active: true,
                showActive: true,
                required: false,
                sortOrder: undefined,
                subPackages: packageModel.subPackages
            });

            dispatch({
                type: dispatchType,
                model,
                narrativePkg
            });
        }).catch((error) => {
            // set error
            console.log('error', error)
        });
    }
}

export function formatSubPackages(subPackages: Array<AssignedPackageModel>): Array<SubPackageSubmissionModel> {

    if (subPackages.length) {
        return subPackages.map((s: AssignedPackageModel, i: number) => {
            return new SubPackageSubmissionModel({
                sortOrder: i,
                active: s.active,
                required: s.required,
                superPkgId: s.superPkgId
            });
        });
    }

    return [];
}

export function formatProjectSubPackages(subPackages: Array<ProjectAssignedPackageModel>): Array<SubPackageSubmissionModel> {

    if (subPackages.length) {
        return subPackages.map((s: ProjectAssignedPackageModel, i: number) => {
            return new SubPackageSubmissionModel({
                sortOrder: i,
                active: s.active,
                projectItemId: s.projectItemId,
                required: s.required,
                superPkgId: s.superPkgId
            });
        });
    }

    return [];
}