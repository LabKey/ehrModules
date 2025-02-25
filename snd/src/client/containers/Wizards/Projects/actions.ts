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

import { labkeyAjax, queryInvalidate } from '../../../query/actions';
import {PROJECT_WIZARD_TYPES} from './constants';
import {
    ProjectModel, ProjectQueryResponse, ProjectWizardModel, ProjectSubmissionModel, ProjectIdRev
} from './model';
import { projectsInvalidate } from '../../Projects/actions';
import { PROJECT_SQL } from '../../Projects/constants'
import {push} from "react-router-redux";
import {setAppError} from "../../App/actions";
import {formatProjectSubPackages, formatSubPackages} from "../SuperPackages/actions";
import {fetchPackage, getPackageModelFromResponse} from "../Packages/actions";
import {PackageModel, PackageQueryResponse} from "../Packages/model";
import {VIEW_TYPES} from "../../App/constants";
import {AssignedPackageModel} from "../../SuperPackages/model";


function fetchProject(idRev: string | number)
{
    let id, rev;

    if (idRev === -1)
    {
        id = -1;
        rev = 0;
    }
    else if (typeof idRev === 'string') {
        let parts = getProjectIdRev(idRev)
        id = parts.id;
        rev = parts.rev;
    }

    return labkeyAjax(
        'snd',
        'getProject',
        null,
        {
            'projectId': id,
            'revisionNum': rev
        }
    );
}

function saveProject(jsonData) {
    return new Promise((resolve, reject) => {
        LABKEY.Ajax.request({
            method: 'POST',
            url: LABKEY.ActionURL.buildURL('snd', 'saveProject.api'),
            jsonData,
            success: LABKEY.Utils.getCallbackWrapper((data) => {
                resolve(data);
            }),
            failure: LABKEY.Utils.getCallbackWrapper((data) => {
                reject(data);
            })
        });
    })
}

export function getProjectIdRev(idRev: string): ProjectIdRev {
    let parts = idRev.split('|');
    return new ProjectIdRev({
        id: parseInt(parts[0]),
        rev: parseInt(parts[1])
    })

}

function getProjectModelFromResponse(response: ProjectQueryResponse): ProjectModel {
    // the response should have exactly one row
    return Array.isArray(response.json) && response.json.length == 1 ?
        response.json[0] :
        new ProjectModel();
}

export function init(idRev: string | number, view: VIEW_TYPES) {
    if (!idRev)
        idRev = -1;

    return (dispatch, getState) => {
        let projectModel: ProjectWizardModel = getState().wizards.projects.projectData[idRev];

        // todo: make this cleaner - works for now
        if (!projectModel || projectModel.formView !== view) {
            const projectModelProps = {
                idRev: idRev,
                formView: view
            };
            dispatch(initProjectModel(projectModelProps));


            const model = getState().wizards.projects.projectData[idRev];
            if (projectModel && projectModel.formView !== view && view !== VIEW_TYPES.PROJECT_VIEW) {
                dispatch(model.checkValid());
            }
        }

        projectModel = getState().wizards.projects.projectData[idRev];

        if (shouldFetch(projectModel)) {
            dispatch(projectModel.loading());

            return fetchProject(idRev).then((response: ProjectQueryResponse) => {

                projectModel = getState().wizards.projects.projectData[idRev];
                dispatch(projectModel.success(response, view));

                projectModel = getState().wizards.projects.projectData[idRev];
                dispatch(projectModel.loaded());
            }).catch((error) => {
                // set error
                console.log('error', error);
                dispatch(projectModel.setError(error));
            });
        }

        else if (projectModel && !projectModel.projectLoaded && !projectModel.projectLoading) {
            dispatch(projectModel.loaded());
        }
    }
}

export function initProjectModel(props: {[key: string]: any}) {
    return {
        type: PROJECT_WIZARD_TYPES.PROJECT_INIT,
        props
    }
}

function shouldFetch(model: ProjectWizardModel): boolean {
    return !model.projectLoaded && !model.projectLoading && !model.isError;
}

export function projectCheckValid(model: ProjectWizardModel) {
    return {
        type: PROJECT_WIZARD_TYPES.PROJECT_CHECK_VALID,
        model
    }
}

export function projectError(model: ProjectWizardModel, error: any) {
    return {
        type: PROJECT_WIZARD_TYPES.PROJECT_ERROR,
        error,
        model
    }
}

export function projectLoaded(model: ProjectWizardModel) {
    return {
        type: PROJECT_WIZARD_TYPES.PROJECT_LOADED,
        model
    }
}

export function projectLoading(model: ProjectWizardModel) {
    return {
        type: PROJECT_WIZARD_TYPES.PROJECT_LOADING,
        model
    };
}

export function projectSuccess(model: ProjectWizardModel, response: ProjectQueryResponse, view: VIEW_TYPES) {
    return {
        type: PROJECT_WIZARD_TYPES.PROJECT_SUCCESS,
        model,
        response,
        view
    };
}

export function projectWarning(model: ProjectWizardModel, warning?: string) {
    return {
        type: PROJECT_WIZARD_TYPES.PROJECT_WARNING,
        model,
        warning
    }
}

export function toggleSubpackageActive(subpackage: AssignedPackageModel, model: any, view: VIEW_TYPES) {
    return {
        type: PROJECT_WIZARD_TYPES.PROJECTS_TOGGLE_SUPERPKG_ACTIVE,
        subpackage,
        model,
        view
    };
}

export function saveField(model: ProjectWizardModel, name: string, value: any) {
    return {
        type: PROJECT_WIZARD_TYPES.SAVE_FIELD,
        model,
        name,
        value
    };
}

export function invalidateModel(model: ProjectWizardModel) {
    return {
        type: PROJECT_WIZARD_TYPES.PROJECT_INVALIDATE,
        model
    };
}

export function resetSubmitting(model: ProjectWizardModel) {
    return {
        type: PROJECT_WIZARD_TYPES.RESET_SUBMISSION,
        model
    };
}

export function setSubmitted(model: ProjectWizardModel) {
    return {
        type: PROJECT_WIZARD_TYPES.SET_SUBMITTED,
        model
    };
}

export function setSubmitting(model: ProjectWizardModel) {
    return {
        type: PROJECT_WIZARD_TYPES.SET_SUBMITTING,
        model
    };
}

export function setRevisedValues(model: ProjectWizardModel) {
    return {
        type: PROJECT_WIZARD_TYPES.SET_REVISED_VALUES,
        model
    };
}

export function save(model: ProjectWizardModel, project: ProjectSubmissionModel) {
    return (dispatch, getState) => {
        dispatch(setSubmitting(model));
        const updatedModel = getState().wizards.projects.projectData[getRevisionId(model)];

        return saveProject(project).then((response) => {
            dispatch(setSubmitted(updatedModel));
            dispatch(projectsInvalidate());
            dispatch(queryInvalidate(PROJECT_SQL));
            //onSuccess('/packages');
            dispatch(push('/projects'));
        }).catch((error) => {
            console.warn('save project error', error);
            dispatch(resetSubmitting(updatedModel));
            dispatch(setAppError(error));
        });
    }
}

export function formatProjectValues(model: ProjectWizardModel, active: boolean): ProjectSubmissionModel {
    const { formView } = model;
    const { description, extraFields, projectId, revisionNum } = model.data;
    let id, rev;
    if (formView !== VIEW_TYPES.PROJECT_NEW) {
        id = projectId;
        rev = revisionNum;
    }

    let subPackages = formatProjectSubPackages(model.data.subPackages);

    return new ProjectSubmissionModel({
        projectId: id,
        revisionNum: rev,
        active,
        description,
        extraFields,
        startDate: model.data.startDate,
        endDate: model.data.endDate,
        referenceId: model.data.referenceId,
        projectItems: subPackages,
        isEdit: formView === VIEW_TYPES.PROJECT_EDIT,
        copyRevisedPkgs: model.data.copyRevisedPkgs,
        endDateRevised: model.data.endDateRevised,
        isRevision: formView === VIEW_TYPES.PROJECT_REVISE
    });
}

export function queryProjectSubPackageDetails(id: number, parentProjectId: string) {
    return (dispatch, getState) => {
        return fetchPackage(id, false, false).then((response: PackageQueryResponse) => {
            const parentProjectModel = getState().wizards.projects.projectData[parentProjectId];

            // the response should have exactly one row
            const responseData: PackageModel = getPackageModelFromResponse(response);

            let newSubpackages = parentProjectModel.data.subPackages.map((subPackage) => {
                if (subPackage.pkgId == responseData.pkgId) {
                    subPackage.subPackages = responseData.subPackages;
                    subPackage.loadingSubpackages = undefined;
                }
                return subPackage;
            });

            dispatch(parentProjectModel.saveField('subPackages', newSubpackages));
        }).catch((error) => {
            // set error
            console.log('error', error)
        });
    }
}

export function getRevisionId(model: ProjectModel | ProjectWizardModel) {
    if (typeof model === 'undefined') {
        return '-1';
    }
    else if (model.projectId === -1) {
        return '-1';
    }
    else {
        return model.projectId + '|' + model.revisionNum;
    }
}