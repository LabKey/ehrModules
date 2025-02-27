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
import { push } from 'react-router-redux'

import {PKG_WIZARD_TYPES, VALIDATOR_GTE, VALIDATOR_LTE} from './constants'
import {AttributeLookups, PropertyDescriptor, PropertyValidator} from "../model";
import {
    PackageModel, PackageWizardModel, PackageSubmissionModel, PackageWizardContainer
} from './model'

import { setAppError } from "../../App/actions";

import { packagesInvalidate } from '../../Packages/actions'
import { PKG_SQ } from '../../Packages/constants'

import {labkeyAjax, queryInvalidate, selectRows} from '../../../query/actions'
import {parseNarrativeKeywords} from "./reducer";
import {TOPLEVEL_SUPER_PKG_SQ} from "../../SuperPackages/constants";
import {formatSubPackages} from "../SuperPackages/actions";
import {VIEW_TYPES} from "../../App/constants";
import {LabKeyQueryResponse} from "../../../query/model";
import {Dispatch} from "redux";

export function fetchDefaultLookups(model: PackageWizardModel, name: string, value: string, dispatch: Dispatch<any>) {
    const valParts = value.split(".");

    return selectRows(
        valParts[0],
        valParts[1],
        null,
        {
            columns: ["LookupId", "Value"]
        }
    ).then((response: LabKeyQueryResponse) => {

        const parts = name.split('_');
        const index = parts[1];

        let lookups = response.rows.map(function(row) {
            return new AttributeLookups(row["LookupId"].value, row["Value"].value)
        });

        model.data.attributes[index].lookupValues = lookups;

        const updatedModel = new PackageWizardModel(Object.assign({}, model, {
            model
        }));

        dispatch(updatedModel.saveField(name, value));
    });
}

export function fetchPackage(id: string | number, includeExtraFields: boolean, includeLookups: boolean) {
    return labkeyAjax(
        'snd',
        'getPackages',
        null,
        {
            'packages': [id],
            'excludeExtraFields': !includeExtraFields,
            "excludeLookups": !includeLookups
        }
    );
}

export function querySubPackageDetails(id: number, parentPkgId: number) {
    return (dispatch, getState) => {
        return fetchPackage(id, false, false).then((response: PackageQueryResponse) => {
            const parentPackageModel = getState().wizards.packages.packageData[parentPkgId];

            // the response should have exactly one row
            const responseData: PackageModel = getPackageModelFromResponse(response);

            let newSubpackages = parentPackageModel.data.subPackages.map((subPackage) => {
                if (subPackage.pkgId == responseData.pkgId) {
                    subPackage.subPackages = responseData.subPackages;
                    subPackage.loadingSubpackages = undefined;
                }
                return subPackage;
            });

            dispatch(parentPackageModel.saveField('subPackages', newSubpackages));
        }).catch((error) => {
            // set error
            console.log('error', error)
        });
    }
}

export function getPackageModelFromResponse(response: PackageQueryResponse): PackageModel {
    // the response should have exactly one row
    return Array.isArray(response.json) && response.json.length == 1 ?
        response.json[0] :
        new PackageModel();
}

export function init(id: string | number, view: VIEW_TYPES) {
    return (dispatch, getState) => {
        let packageModel: PackageWizardModel = getState().wizards.packages.packageData[id];

        // todo: make this cleaner - works for now
        if (!packageModel || packageModel.formView !== view) {
            const packageModelProps = {
                packageId: id,
                formView: view
            };
            dispatch(initPackageModel(packageModelProps));


            const model = getState().wizards.packages.packageData[id];
            if (packageModel && packageModel.formView !== view && view !== VIEW_TYPES.PACKAGE_VIEW) {
                dispatch(model.checkValid());
            }
        }

        packageModel = getState().wizards.packages.packageData[id];

        if (shouldFetch(packageModel)) {
            dispatch(packageModel.loading());

            return fetchPackage(id, true, true).then((response: PackageQueryResponse) => {

                packageModel = getState().wizards.packages.packageData[id];
                dispatch(packageModel.success(response, view));

                packageModel = getState().wizards.packages.packageData[id];
                dispatch(packageModel.loaded());
            }).catch((error) => {
                // set error
                console.log('error', error);
                dispatch(packageModel.setError(error));
            });
        }

        else if (packageModel && !packageModel.packageLoaded && !packageModel.packageLoading) {
            dispatch(packageModel.loaded());
        }
    }
}

export function initPackageModel(props: {[key: string]: any}) {
    return {
        type: PKG_WIZARD_TYPES.PACKAGE_INIT,
        props
    }
}

export function invalidateModel(model: PackageWizardModel) {
    return {
        type: PKG_WIZARD_TYPES.PACKAGE_INVALIDATE,
        model
    };
}

function shouldFetch(model: PackageWizardModel): boolean {
    return !model.packageLoaded && !model.packageLoading && !model.isError;
}

export function packageCheckValid(model: PackageWizardModel) {
    return {
        type: PKG_WIZARD_TYPES.PACKAGE_CHECK_VALID,
        model
    }
}

export function packageError(model: PackageWizardModel, error: any) {
    return {
        type: PKG_WIZARD_TYPES.PACKAGE_ERROR,
        error,
        model
    }
}

export function packageLoaded(model: PackageWizardModel) {
    return {
        type: PKG_WIZARD_TYPES.PACKAGE_LOADED,
        model
    }
}

export function packageLoading(model: PackageWizardModel) {
    return {
        type: PKG_WIZARD_TYPES.PACKAGE_LOADING,
        model
    };
}

export function packageSuccess(model: PackageWizardModel, response: PackageQueryResponse, view: VIEW_TYPES) {
    return {
        type: PKG_WIZARD_TYPES.PACKAGE_SUCCESS,
        model,
        response,
        view
    };
}

export function packageWarning(model: PackageWizardModel, warning?: string) {
    return {
        type: PKG_WIZARD_TYPES.PACKAGE_WARNING,
        model,
        warning
    }
}

export function saveNarrative(model: PackageWizardModel, narrative: string) {
    return (dispatch) => {
        dispatch({
            type: PKG_WIZARD_TYPES.SAVE_NARRATIVE,
            model,
            narrative
        });
    }
}

export function parseAttributes(model: PackageWizardModel) {
    return (dispatch) => {
        const narrative = model.data.narrative;
        const parsedKeywords = parseNarrativeKeywords(narrative);

        // Check for duplicate key words
        let dupes = parsedKeywords.some((item, index) => {
            let idx = parsedKeywords.indexOf(item);
            return (idx > -1 && idx != index);
        });

        // Throw error for duplicates
        if (dupes) {
            dispatch(setAppError({exception:"Tokens in narrative must have unique names."}));
        }
        else {
            dispatch({
                type: PKG_WIZARD_TYPES.PARSE_ATTRIBUTES,
                model
            });
        }
    }
}

export function saveField(model: PackageWizardModel, name: string, value: any) {
    return {
        type: PKG_WIZARD_TYPES.SAVE_FIELD,
        model,
        name,
        value
    };
}


export function resetSubmitting(model: PackageWizardModel) {
    return {
        type: PKG_WIZARD_TYPES.RESET_SUBMISSION,
        model
    };
}

export function setSubmitted(model: PackageWizardModel) {
    return {
        type: PKG_WIZARD_TYPES.SET_SUBMITTED,
        model
    };
}

export function setSubmitting(model: PackageWizardModel) {
    return {
        type: PKG_WIZARD_TYPES.SET_SUBMITTING,
        model
    };
}

interface PackageQueryResponse {
    json: Array<PackageModel>
}

export function save(model: PackageWizardModel, pkg: PackageSubmissionModel) {
    return (dispatch, getState) => {
        dispatch(setSubmitting(model));
        const updatedModel = getState().wizards.packages.packageData[model.packageId];

        return savePackage(pkg).then((response) => {
            dispatch(setSubmitted(updatedModel));
            dispatch(packagesInvalidate());
            dispatch(queryInvalidate(PKG_SQ));
            dispatch(queryInvalidate(TOPLEVEL_SUPER_PKG_SQ));
            //onSuccess('/packages');
            dispatch(push('/packages'));
        }).catch((error) => {
            console.warn('save package error', error);
            dispatch(resetSubmitting(updatedModel));
            dispatch(setAppError(error));
        });
    }
}

export function formatPackageValues(model: PackageWizardModel, active: boolean): PackageSubmissionModel {
    const { formView } = model;
    const { categories, description, extraFields, narrative, pkgId, repeatable } = model.data;
    let id;
    if (formView !== VIEW_TYPES.PACKAGE_NEW) {
        id = pkgId;
    }

    const attributes = formatAttributes(model.data.attributes),
        subPackages = formatSubPackages(model.data.subPackages);

    return new PackageSubmissionModel({
        active,
        attributes,
        categories,
        clone: formView === VIEW_TYPES.PACKAGE_CLONE,
        description,
        extraFields,
        id,
        narrative,
        repeatable,
        subPackages
    });
}

function formatAttributes(attributes: Array<PropertyDescriptor>): Array<PropertyDescriptor> {
    if (attributes.length) {
        return attributes.map((attribute, i) => {
            // loop through the attribute keys and strip off the _# like name_0 = name
            let pkgAttribute = new PropertyDescriptor(Object.keys(attribute).reduce((prev, next) => {
                const nextKey = next.split('_')[0];
                if (next === 'lookupKey') {
                    // Set lookup values in attribute and prev so they don't get overwritten when iterating through
                    if (attribute[next]) {
                        const splitKey = attribute[next].split('.');
                        if (splitKey && splitKey.length > 1) {
                            attribute['lookupSchema'] = splitKey[0];
                            attribute['lookupQuery'] = splitKey[1];
                            prev['lookupSchema'] = splitKey[0];
                            prev['lookupQuery'] = splitKey[1];
                        }
                    }
                    else {
                        attribute['lookupSchema'] = "";
                        attribute['lookupQuery'] = "";
                        prev['lookupSchema'] = "";
                        prev['lookupQuery'] = "";
                    }
                }
                else {
                    prev[nextKey] = attribute[next];
                }

                return prev;
            }, {}));

            pkgAttribute = addValidator(pkgAttribute);
            return pkgAttribute;
        });
    }

    return [];
}

function addValidator(attribute: PropertyDescriptor) : PropertyDescriptor {

    let type = attribute.rangeURI;
    let min = attribute.min;
    let max = attribute.max;

    if (!min && !max)
        return attribute;

    let newValidator = new PropertyValidator();
    newValidator.type = (type === 'string' ? 'textlength' : 'range');
    newValidator.name = (type === 'string' ? 'SND Length' : 'SND Range');  // Name must start with SND
    newValidator.description = (type === 'string' ? 'SND String Length' : 'SND Numeric Range');

    // Create expression
    if (min && max) {
        newValidator.expression = VALIDATOR_GTE + min + '&' + VALIDATOR_LTE + max;
    }
    else if (min && !max) {
        newValidator.expression = VALIDATOR_GTE + min;
    }
    else if (!min && max) {
        newValidator.expression = VALIDATOR_LTE + max;
    }
    else { // Should never get here
        newValidator.expression = '';
    }

    attribute['validators'] = [newValidator];
    return attribute;
}

function savePackage(jsonData) {
    return new Promise((resolve, reject) => {
        LABKEY.Ajax.request({
            method: 'POST',
            url: LABKEY.ActionURL.buildURL('snd', 'savePackage.api'),
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