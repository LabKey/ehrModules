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
import { QUERY_TYPES } from './constants'
import { EditableQueryModel, LabKeyQueryResponse, QueryModel, SchemaQuery } from './model'

export function getStateQueryModel(
    state: any,
    id: string,
    schemaQuery: SchemaQuery,
    props?: {
        requiredColumns?: Array<string>
    }
) {
    let parts = [id, schemaQuery.schemaName, schemaQuery.queryName];

    if (schemaQuery.viewName) {
        parts.push(schemaQuery.viewName);
    }

    const modelId = parts.join('|').toLowerCase();

    if (state.models[modelId] !== undefined) {
        return state.models[modelId];
    }

    interface QModelProps {
        id: string
        query: string
        requiredColumns?: Array<string>
        schema: string
        schemaQuery: SchemaQuery
        view: string
    }

    let modelProps: QModelProps = {
        id: modelId,
        schema: schemaQuery.schemaName, // todo: remove these for schemaQuery prop
        query: schemaQuery.queryName,
        view: schemaQuery.viewName,
        schemaQuery
    };

    if (props) {
        if (props.requiredColumns !== undefined) {
            modelProps.requiredColumns = props.requiredColumns;
        }
    }

    return new QueryModel(modelProps);
}

function fetchData(model: QueryModel) {
    return (dispatch, getState: () => APP_STATE_PROPS) => {

        dispatch(queryLoading(model));

        let updatedModel = getState().queries.models[model.id];

        return getQueryDetails(
            updatedModel.schema,
            updatedModel.query,
            updatedModel.view
        ).then(queryInfo => {
            dispatch(queryModelDetailsSuccess(updatedModel, queryInfo));

            updatedModel = getState().queries.models[model.id];

            return selectRows(
                updatedModel.schema,
                updatedModel.query,
                updatedModel.view,
                {
                    columns: updatedModel.requiredColumns
                }
            ).then((response: LabKeyQueryResponse) => {
                const { id } = response.metaData;
                if (id) {
                    dispatch(queryModelSuccess(updatedModel, response));

                    updatedModel = getState().queries.models[model.id];
                    dispatch(queryLoaded(updatedModel));
                }
                else {
                    throw new Error([updatedModel.schema, updatedModel.query, updatedModel.view].join(' ') + 'Response does not include id column');
                }

            }).catch((error) => {
                dispatch(queryError(updatedModel, error));
            });
        }).catch((error) => {
            dispatch(queryError(updatedModel, error));
        })
    }
}

function shouldInit(state, id: string) {
    const model = state.queries.models[id];

    if (!model) {
        return true;
    }
    else if (!model.isLoaded && !model.isLoading && !model.isError) {
        return true;
    }

    return false;
}

export function init(model: QueryModel) {
    return (dispatch, getState: () => APP_STATE_PROPS) => {
        if (shouldInit(getState(), model.id)) {

            dispatch({
                type: QUERY_TYPES.QUERY_INITIALIZE,
                model
            });

            const updatedModel: QueryModel = getState().queries.models[model.id];
            dispatch(updatedModel.load());
        }
    }
}

export function load(model: QueryModel) {
    return (dispatch, getState: () => APP_STATE_PROPS) => {

        if (!model.isLoaded && !model.isLoading) {
            dispatch(fetchData(model));
        }
    }
}

export function queryError(model: QueryModel, error: any) {
    return {
        type: QUERY_TYPES.QUERY_ERROR,
        error,
        model
    };
}

export function queryInvalidate(schemaQuery: SchemaQuery) {
    return {
        type: QUERY_TYPES.QUERY_INVALIDATE,
        schemaQuery
    };
}

export function queryLoaded(model: QueryModel) {
    return {
        type: QUERY_TYPES.QUERY_LOADED,
        model
    };
}

export function queryLoading(model: QueryModel) {
    return {
        type: QUERY_TYPES.QUERY_LOADING,
        model
    };
}
export function queryModelDetailsSuccess(model: QueryModel, queryInfo) {
    return {
        type: QUERY_TYPES.QUERY_DETAILS_SUCCESS,
        model,
        queryInfo
    };
}

export function queryModelSuccess(model: QueryModel, response) {
    return {
        type: QUERY_TYPES.QUERY_SUCCESS,
        model,
        response
    };
}

// QueryEditModel

function editShouldInit(state, id: string) {
    const model = state.queries.editableModels[id];

    if (!model) {
        return true;
    }
    else if (!model.isLoaded && !model.isLoading && !model.isError) {
        return true;
    }

    return false;
}

export function queryEditAddRow(editableModel: EditableQueryModel) {
    return {
        type: QUERY_TYPES.QUERY_EDIT_ADD_ROW,
        editableModel
    };
}

export function queryEditInitModel(initialModel: QueryModel) {
    return (dispatch, getState) => {

        if (initialModel && editShouldInit(getState(), initialModel.id)) {
            dispatch({
                type: QUERY_TYPES.QUERY_EDIT_INITIALIZE,
                initialModel
            });
        }
    }
}

export function queryEditRemoveRow(editableModel: EditableQueryModel, rowId: number) {
    return {
        type: QUERY_TYPES.QUERY_EDIT_REMOVE_ROW,
        editableModel,
        rowId
    };
}

export function queryEditSetSubmitted(editableModel: EditableQueryModel) {
    return {
        type: QUERY_TYPES.QUERY_EDIT_SET_SUBMITTED,
        editableModel
    };
}

export function queryEditSetSubmitting(editableModel: EditableQueryModel) {
    return {
        type: QUERY_TYPES.QUERY_EDIT_SET_SUBMITTING,
        editableModel
    };
}

export function getRemoved(initial: Array<number>, current: Array<number>, pkCol: string) {
    if (initial.length) {
        return initial.filter((id: number) => {
            return current.indexOf(id) === -1;
        }).map(id => {
            return {
                [pkCol]: id
            };
        });
    }

    return [];
}

export function labkeyAjax(controller: string, action: string, params?: any, jsonData?: any, container?: string): Promise<any> {
    return new Promise((resolve, reject) => {
        return LABKEY.Ajax.request({
            url: LABKEY.ActionURL.buildURL(controller, [action, 'api'].join('.'), container),
            jsonData,
            params,
            success: LABKEY.Utils.getCallbackWrapper((data) => {
                resolve(data);
            }),
            failure: LABKEY.Utils.getCallbackWrapper((data) => {
                reject(data);
            })
        });
    });
}

export function deleteRows(schemaName: string, queryName: string, rows: Array<{[key: string]: any}>) {
    return new Promise((resolve, reject) => {
        LABKEY.Query.deleteRows({
            schemaName,
            queryName,
            rows,
            success: (data: LabKeyQueryResponse) => {
                resolve(data);
            },
            failure: (data) => {
                reject(data);
            }
        });
    });
}

export function insertRows(schemaName: string, queryName: string, rows: Array<{[key: string]: any}>) {
    return new Promise((resolve, reject) => {
        LABKEY.Query.insertRows({
            schemaName,
            queryName,
            rows,
            success: (data: LabKeyQueryResponse) => {
                resolve(data);
            },
            failure: (data) => {
                reject(data);
            }
        });
    });
}

export function selectRows(schemaName: string, queryName: string, viewName?: string, params?: {[key: string]: any}): Promise<any> {
    return new Promise((resolve, reject) => {
        return LABKEY.Query.selectRows({
            schemaName,
            queryName,
            viewName,
            ...params,
            requiredVersion: 17.1, // newer?
            success: (data: LabKeyQueryResponse) => {
                resolve(data);
            },
            failure: (data) => {
                reject(data);
            }
        });
    });
}

export function updateRows(schemaName: string, queryName: string, rows: Array<{[key: string]: any}>) {
    return new Promise((resolve, reject) => {
        LABKEY.Query.updateRows({
            schemaName,
            queryName,
            rows,
            success: (data: LabKeyQueryResponse) => {
                resolve(data);
            },
            failure: (data) => {
                reject(data);
            }
        });
    });
}

export function getQueryDetails(schemaName: string, queryName: string, viewName?: string, params?: {[key: string]: any}) {
    return new Promise((resolve, reject) => {
        return LABKEY.Query.getQueryDetails({
            schemaName,
            queryName,
            viewName: viewName || '*',
            ...params,
            requiredVersion: 17.1, // newer?
            success: (queryDetails: LabKeyQueryResponse | any) => {
                // getQueryDetails will return an exception parameter in cases
                // where it is unable to resolve the tableInfo. This is deemed a 'success'
                // by the request standards but here we reject as an outright failure
                if (queryDetails.exception) {
                    reject({
                        schemaName,
                        queryName,
                        viewName,
                        message: queryDetails.exception,
                        exceptionClass: undefined
                    });
                }
                resolve(queryDetails);
            },
            failure: (data, request) => {
                console.log('GetQueryDetailsError', data, request);
                reject({
                    data,
                    request
                });
            }
        });
    });
}