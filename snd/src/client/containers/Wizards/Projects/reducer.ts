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


import {ProjectAssignedPackageModel, ProjectModel, ProjectWizardContainer, ProjectWizardModel} from "./model";
import {PROJECT_WIZARD_TYPES} from "./constants";
import {handleActions} from "redux-actions";
import {PropertyDescriptor} from "../model";
import {AssignedPackageModel} from "../../SuperPackages/model";
import {getProjectIdRev, getRevisionId} from "./actions";
import {VIEW_TYPES} from "../../App/constants";

export const projects = handleActions({


    [PROJECT_WIZARD_TYPES.PROJECT_ERROR]: (state: ProjectWizardContainer, action: any) => {
        const {error, model} = action;


        const errorModel = new ProjectWizardModel(Object.assign({}, model, {
            isError: true,
            message: error && error.exception ? error.exception : 'Something went wrong.'
        }));

        return new ProjectWizardContainer(Object.assign({}, state, {
            projectData: {
                [getRevisionId(errorModel)]: errorModel
            }
        }));
    },

    [PROJECT_WIZARD_TYPES.PROJECT_WARNING]: (state: ProjectWizardContainer, action: any) => {
        const {model, warning} = action;

        const warningModel = new ProjectWizardModel(Object.assign({}, model, {
            isWarning: !!warning, // if warning message is provided, set to true, otherwise false
            message: warning
        }));

        return new ProjectWizardContainer(Object.assign({}, state, {
            projectData: {
                [getRevisionId(warningModel)]: warningModel
            }
        }));
    },

    [PROJECT_WIZARD_TYPES.PROJECT_INIT]: (state: ProjectWizardContainer, action: any) => {
        const {idRev} = action.props;
        let id = -1, rev = 0;
        if (idRev !== -1) {
            let parts = getProjectIdRev(idRev)
            id = parts.id;
            rev = parts.rev;
        }

        const model = new ProjectWizardModel(
            Object.assign({}, state.projectData[idRev], {projectId: id}, {revisionNum: rev})
        );

        return new ProjectWizardContainer(Object.assign({}, state, {
            projectData: {
                [idRev]: model
            }
        }));
    },

    [PROJECT_WIZARD_TYPES.PROJECT_INVALIDATE]: (state: ProjectWizardContainer, action: any) => {
        const { model } = action;

        return new ProjectWizardContainer(Object.assign({}, state, {projectData: {
            [getRevisionId(model)]: new ProjectModel()
        }}));
    },

    [PROJECT_WIZARD_TYPES.PROJECT_CHECK_VALID]: (state: ProjectWizardContainer, action: any) => {
        const { model } = action;
        const { data } = model;

        const successModel = new ProjectWizardModel(Object.assign({}, model, {
            isValid: isFormValid(data, data, model.formView)
        }));

        return new ProjectWizardContainer(Object.assign({}, state, {projectData: {
            [getRevisionId(successModel)]: successModel
        }}));
    },

    [PROJECT_WIZARD_TYPES.PROJECT_LOADED]: (state: ProjectWizardContainer, action: any) => {
        const { model } = action;

        const loadingModel = new ProjectWizardModel(Object.assign({}, model, {
            projectLoaded: true,
            projectLoading: false
        }));

        return new ProjectWizardContainer(Object.assign({}, state, {projectData: {
            [getRevisionId(loadingModel)]: loadingModel
        }}));
    },

    [PROJECT_WIZARD_TYPES.PROJECT_LOADING]: (state: ProjectWizardContainer, action: any) => {
        const { model } = action;

        const loadingModel = new ProjectWizardModel(Object.assign({}, model, {
            projectLoaded: false,
            projectLoading: true
        }));

        return new ProjectWizardContainer(Object.assign({}, state, {projectData: {
            [getRevisionId(loadingModel)]: loadingModel
        }}));
    },

    [PROJECT_WIZARD_TYPES.PROJECT_SUCCESS]: (state: ProjectWizardContainer, action: any) => {
        const { model, response, view } = action;
        const { json } = response;
        const idRev = getRevisionId(model);

        let subPackages = [];

        if (json.projectItems && Array.isArray(json.projectItems)) {
            subPackages = json.projectItems.map(function (item) {
                return new ProjectAssignedPackageModel({
                    pkgId: item.superPkg.pkgId,
                    projectItemId: item.projectItemId,
                    description: item.superPkg.description,
                    narrative: item.superPkg.narrative,
                    repeatable: item.superPkg.repeatable,
                    superPkgId: item.superPkg.superPkgId,
                    active: item.active,
                    showActive: true,
                    required:false,
                    sortOrder: item.superPkg.sortOrder,
                    subPackages: item.superPkg.subPackages});
            });
        }

        let data = Object.assign({}, json, {subPackages: subPackages});

        const modelData = new ProjectModel(Object.assign({}, state.projectData[idRev].data, data));
        const successModel = new ProjectWizardModel(Object.assign({}, model, {
            data: modelData,
            formView: view,
            initialData: modelData,
            isValid: isFormValid(modelData, modelData, view)
        }));

        return new ProjectWizardContainer(Object.assign({}, state, {projectData: {
            [getRevisionId(successModel)]: successModel
        }}));
    },

    [PROJECT_WIZARD_TYPES.SAVE_FIELD]: (state: ProjectWizardContainer, action: any) => {
        const { model, name, value } = action;

        let data: ProjectModel;

        if (name.indexOf('extraFields') !== -1) {
            const fieldParts = name.split('_');
            const fieldIndex = fieldParts[1];

            let extraFields = [].concat(model.data.extraFields);
            extraFields[fieldIndex] = new PropertyDescriptor(
                Object.assign({}, model.data.extraFields[fieldIndex], {["value"]: value})
            );

            data = new ProjectModel(Object.assign({}, model.data, {
                extraFields
            }));
        }
        else {
            data = new ProjectModel(Object.assign({}, model.data, {[name]: value}));
        }

        const updatedModel = new ProjectWizardModel(Object.assign({}, model, {
            data,
            isValid: isFormValid(data, model.initialData, model.formView)
        }));

        return new ProjectWizardContainer(Object.assign({}, state, {projectData: {
            [getRevisionId(updatedModel)]: updatedModel
        }}));
    },

    [PROJECT_WIZARD_TYPES.SET_SUBMITTED]: (state: ProjectWizardContainer, action: any) => {
        const { model } = action;

        const submittedModel = new ProjectWizardModel(Object.assign({}, model, {
            isSubmitted: true,
            isSubmitting: false
        }));

        return new ProjectWizardContainer(Object.assign({}, state, {projectData: {
            [getRevisionId(submittedModel)]: submittedModel
        }}));
    },

    [PROJECT_WIZARD_TYPES.RESET_SUBMISSION]: (state: ProjectWizardContainer, action: any) => {
        const { model } = action;

        const resetModel = new ProjectWizardModel(Object.assign({}, model, {
            isSubmitted: false,
            isSubmitting: false
        }));

        return new ProjectWizardContainer(Object.assign({}, state, {projectData: {
            [getRevisionId(resetModel)]: resetModel
        }}));
    },

    [PROJECT_WIZARD_TYPES.PROJECT_FULL_NARRATIVE]: (state: ProjectWizardContainer, action: any) => {
        const { model, narrativePkg } = action;

        const submittingModel = new ProjectWizardModel(Object.assign({}, model, {
            narrativePkg: narrativePkg
        }));

        return new ProjectWizardContainer(Object.assign({}, state, {projectData: {
            [getRevisionId(submittingModel)]: submittingModel
        }}));
    },

    [PROJECT_WIZARD_TYPES.PROJECT_CLOSE_FULL_NARRATIVE]: (state: ProjectWizardContainer, action: any) => {
        const { model } = action;

        const submittingModel = new ProjectWizardModel(Object.assign({}, model, {
            narrativePkg: null
        }));

        return new ProjectWizardContainer(Object.assign({}, state, {projectData: {
            [getRevisionId(submittingModel)]: submittingModel
        }}));
    },

    [PROJECT_WIZARD_TYPES.SET_REVISED_VALUES]: (state: ProjectWizardContainer, action: any) => {
        const { model } = action;
        let revisedEndDate;

        if (model.data.endDate) {
            revisedEndDate = new Date(model.data.endDate.split('-'));
        }
        else {
            revisedEndDate = new Date();  // If previous end date is null, initialize to today's date
        }

        let revisedDateString = revisedEndDate.getFullYear() + '-' + (revisedEndDate.getMonth() + 1) + '-' + revisedEndDate.getDate();

        // Start date of next revision is day after end date of previous revision
        revisedEndDate.setDate(revisedEndDate.getDate() + 1);
        let newStartDateString = revisedEndDate.getFullYear() + '-' + (revisedEndDate.getMonth() + 1) + '-' + revisedEndDate.getDate();

        const data = new ProjectModel(Object.assign({}, model.data, {
            endDateRevised: revisedDateString, startDate: newStartDateString, endDate: ""}));
        const revisedModel = new ProjectWizardModel(Object.assign({}, model, {
            data
        }));

        return new ProjectWizardContainer(Object.assign({}, state, {projectData: {
            [getRevisionId(revisedModel)]: revisedModel
        }}));
    },

    [PROJECT_WIZARD_TYPES.PROJECTS_TOGGLE_SUPERPKG_ACTIVE]: (state: ProjectWizardContainer, action: any) => {
        const { model, subpackage, view } = action;
        const projectWizardModel = state.projectData[getRevisionId(model)];

        const subPackages = projectWizardModel.data.subPackages.map(function(subPkg) {
            if (subpackage.superPkgId === subPkg.superPkgId) {
                return new ProjectAssignedPackageModel({
                    pkgId: subPkg.pkgId,
                    projectItemId: subPkg.projectItemId,
                    description: subPkg.description,
                    narrative: subPkg.narrative,
                    repeatable: subPkg.repeatable,
                    superPkgId: subPkg.superPkgId,
                    active: !subpackage.active,
                    showActive: subPkg.showActive,
                    required: false,
                    sortOrder: subPkg.sortOrder,
                    subPackages: subPkg.subPackages
                });
            }
            else {
                return subPkg;
            }
        });

        const data = new ProjectModel(Object.assign({}, model, {
            subPackages
        }));

        const toggledModel = new ProjectWizardModel(Object.assign({}, projectWizardModel, {
            data,
            isValid: isFormValid(data, projectWizardModel.initialData, view)
        }));

        return new ProjectWizardContainer(Object.assign({}, state, {projectData: {
            [getRevisionId(toggledModel)]: toggledModel
        }}));

    }
}, new ProjectWizardContainer());

function isFormValid(data: ProjectModel, initialData: ProjectModel, view: VIEW_TYPES): boolean {

    // Required Fields
    if (!data.description ||
        !data.startDate ||
        !data.referenceId) {
        return false;
    }

    // If required fields filled in, a new or draft project can be saved
    let isValidChange: boolean = (view === VIEW_TYPES.PROJECT_NEW || !data.active);

    // Check common fields for changes
    if (!isValidChange && (view === VIEW_TYPES.PROJECT_EDIT || view === VIEW_TYPES.PROJECT_REVISE)) {
        isValidChange = data.description !== initialData.description ||
        data.startDate !== initialData.startDate ||
        data.referenceId.toString() !== initialData.referenceId.toString() ||
        data.endDate !== initialData.endDate ||
        data.extraFields.map(ef => ef.value!=null?ef.value.toString():ef.value).sort().join('') !==
        initialData.extraFields.map(ef => ef.value!=null ? ef.value.toString() : ef.value).sort().join('')
    }

    // Check updated assigned packages for Edit
    if (!isValidChange && view === VIEW_TYPES.PROJECT_EDIT) {
        isValidChange = data.subPackages.map(p => (p.pkgId + '.' + p.active)).sort().join('') !==
            initialData.subPackages.map(p => (p.pkgId + '.' + p.active)).sort().join('')
        || data.subPackages.map(p => (p.pkgId + '.' + p.active)).sort().join('') !==
            initialData.subPackages.map(p => (p.pkgId + '.' + p.active)).sort().join('')
    }

    // Check previous revision end date for revision
    if (!isValidChange && view === VIEW_TYPES.PROJECT_REVISE) {
        isValidChange = data.endDateRevised !== initialData.endDateRevised
    }

    return isValidChange;
}