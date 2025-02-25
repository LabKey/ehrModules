/*
 * Copyright (c) 2017-2019 LabKey Corporation
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
import { handleActions } from 'redux-actions';

import {
    EditableQueryModel,
    QueryModel,
    QueryModelsContainer,
    SchemaQuery
} from './model'

export const queries = handleActions({

    [QUERY_TYPES.QUERY_ERROR]: (state: QueryModelsContainer, action: any) => {
        const { error, model } = action;

        const updatedModel = new QueryModel(Object.assign({}, state.models[model.id], {
            isError: true,
            message: 'Something went wrong' // should be error.exception/error.message
        }));

        const updatedModels = Object.assign({}, state.models, {[updatedModel.id]: updatedModel});

        const updatedState = Object.assign({}, state, {models: updatedModels});
        return new QueryModelsContainer(updatedState);
    },

    [QUERY_TYPES.QUERY_INITIALIZE]: (state: QueryModelsContainer, action: any) => {
        const { model } = action;

        const models = Object.assign({}, state.models,{[model.id]: model});

        const updatedState = Object.assign({}, state, {models});
        return new QueryModelsContainer(updatedState);
    },

    [QUERY_TYPES.QUERY_INVALIDATE]: (state: QueryModelsContainer, action: any) => {
        const { schemaQuery } = action;
        const { loadedQueries, loadingQueries } = state;

        let loaded = removeQuery(schemaQuery, loadedQueries),
            loading = removeQuery(schemaQuery, loadingQueries);

        let models = Object.assign({}, state.models);
        delete models[schemaQuery.resolveKey()];
        let editableModels = Object.assign({}, state.editableModels);
        delete editableModels[schemaQuery.resolveKey()];

        // clear any models or editable models using this schemaQuery
        Object.keys(models).forEach((modelId: string) => {
            if (modelId.toLowerCase().indexOf(schemaQuery.resolveKey()) !== -1) {
                delete models[modelId];
            }
        });

        Object.keys(editableModels).forEach((modelId: string) => {
            if (modelId.toLowerCase().indexOf(schemaQuery.resolveKey()) !== -1) {
                delete editableModels[modelId];
            }
        });

        const updatedState = Object.assign({}, state, {
            editableModels,
            loadedQueries: loaded,
            loadingQueries: loading,
            models
        });
        return new QueryModelsContainer(updatedState);
    },

    [QUERY_TYPES.QUERY_LOADED]: (state: QueryModelsContainer, action: any) => {
        const { model } = action;
        const { schemaQuery } = model;
        const { loadedQueries, loadingQueries } = state;

        let loaded = addQuery(schemaQuery, loadedQueries),
            loading = removeQuery(schemaQuery, loadingQueries);

        const updatedModel = new QueryModel(Object.assign({}, state.models[model.id], {
            isLoaded: true,
            isLoading: false
        }));

        const updatedModels = Object.assign({}, state.models, {[updatedModel.id]: updatedModel});

        const updatedState = Object.assign({}, state, {
            models: updatedModels,
            loadedQueries: loaded,
            loadingQueries: loading
        });
        return new QueryModelsContainer(updatedState);
    },

    [QUERY_TYPES.QUERY_LOADING]: (state: QueryModelsContainer, action: any) => {
        const { model } = action;
        const { schemaQuery } = model;
        const { loadedQueries, loadingQueries } = state;

        let loaded = removeQuery(schemaQuery, loadedQueries),
            loading = addQuery(schemaQuery, loadingQueries);

        const updatedModel = new QueryModel(Object.assign({}, state.models[model.id], {
            isLoaded: false,
            isLoading: true
        }));

        const updatedModels = Object.assign({}, state.models, {[updatedModel.id]: updatedModel});

        const updatedState = Object.assign({}, state, {
            models: updatedModels,
            loadedQueries: loaded,
            loadingQueries: loading
        });
        return new QueryModelsContainer(updatedState);
    },

    [QUERY_TYPES.QUERY_DETAILS_SUCCESS]: (state: QueryModelsContainer, action: any) => {
        const { model, queryInfo } = action;

        const queryModel = new QueryModel(Object.assign({}, state.models[model.id], {
            queryInfo
        }));
        //
        const models = Object.assign({}, state.models,{[model.id]: queryModel});

        const updatedState = Object.assign({}, state, {models});
        return new QueryModelsContainer(updatedState);
    },

    [QUERY_TYPES.QUERY_SUCCESS]: (state: QueryModelsContainer, action: any) => {
        const { response, model } = action;
        const pkCol = response.metaData.id;

        let dataIds = [];
        const data = response.rows.reduce((prev, next) => {

            const id = next[pkCol].value;
            dataIds.push(id);
            prev[id] = next;

            return prev;

        }, {});

        const queryModel = new QueryModel(Object.assign({}, state.models[model.id], {
            data,
            dataIds,
            dataCount: response.rowCount,
            metaData: response.metaData
        }));

        const models = Object.assign({}, state.models,{[model.id]: queryModel});

        const updatedState = Object.assign({}, state, {models});
        return new QueryModelsContainer(updatedState);
    },


    // editable models

    [QUERY_TYPES.QUERY_EDIT_INITIALIZE]: (state: QueryModelsContainer, action: any) => {
        const { initialModel } = action;
        const { data, dataCount, dataIds } = initialModel;

        const editableModels = Object.assign({}, state.editableModels,{
            [initialModel.id]: new EditableQueryModel({
                ...initialModel,
                initialData: data,
                initialDataCount: dataCount,
                initialIds: dataIds
            })
        });

        const updatedState = Object.assign({}, state, {editableModels});
        return new QueryModelsContainer(updatedState);
    },

    [QUERY_TYPES.QUERY_EDIT_ADD_ROW]: (state: QueryModelsContainer, action: any) => {
        const { editableModel } = action;
        const stateModel = state.editableModels[editableModel.id];

        const initialIds = Object.keys(stateModel.data).map((id) => parseInt(id)).sort(function(a, b){return a - b});
        let dataIds = [].concat(stateModel.dataIds);

        // in case a row has been removed, ensure we are adding a fake rowId that does not and did not exist
        const initialLargest = initialIds.length ? initialIds.slice(-1)[0] : 0;
        const dataLargest = dataIds.length ? dataIds.sort(function(a, b){return a - b}).slice(-1)[0] : 0;

        const largest = dataLargest <= initialLargest ? initialLargest : dataLargest;
        dataIds.push(largest + 1);

        const updatedModel = new EditableQueryModel(Object.assign({}, stateModel, {
            dataIds,
            dataCount: dataIds.length,
        }));

        const editableModels = Object.assign({}, state.editableModels,{
            [editableModel.id]: updatedModel
        });

        const updatedState = Object.assign({}, state, {editableModels});
        return new QueryModelsContainer(updatedState);
    },

    [QUERY_TYPES.QUERY_EDIT_REMOVE_ROW]: (state: QueryModelsContainer, action: any) => {
        const { editableModel, rowId } = action;
        const stateModel = state.editableModels[editableModel.id];
        let dataIds = [].concat(stateModel.dataIds);
        const index = dataIds.findIndex(d => {
            return d === rowId
        });

        dataIds.splice(index, 1);

        const updatedModel = new EditableQueryModel(Object.assign({}, stateModel, {
            dataIds,
            dataCount: dataIds.length,
        }));

        const editableModels = Object.assign({}, state.editableModels,{
            [editableModel.id]: updatedModel
        });

        const updatedState = Object.assign({}, state, {editableModels});
        return new QueryModelsContainer(updatedState);
    },

    [QUERY_TYPES.QUERY_EDIT_SET_SUBMITTED]: (state: QueryModelsContainer, action: any) => {
        const { editableModel } = action;
        const stateModel = state.editableModels[editableModel.id];

        const updatedModel = new EditableQueryModel(Object.assign({}, stateModel, {
            isSubmitted: true,
            isSubmitting: false
        }));

        const editableModels = Object.assign({}, state.editableModels,{
            [updatedModel.id]: updatedModel
        });

        const updatedState = Object.assign({}, state, {editableModels});
        return new QueryModelsContainer(updatedState);
    },

    [QUERY_TYPES.QUERY_EDIT_SET_SUBMITTING]: (state: QueryModelsContainer, action: any) => {
        const { editableModel } = action;
        const stateModel = state.editableModels[editableModel.id];

        const updatedModel = new EditableQueryModel(Object.assign({}, stateModel, {
            isSubmitted: false,
            isSubmitting: true
        }));

        const editableModels = Object.assign({}, state.editableModels,{
            [updatedModel.id]: updatedModel
        });

        const updatedState = Object.assign({}, state, {editableModels});
        return new QueryModelsContainer(updatedState);
    },

}, new QueryModelsContainer());


function addQuery(schemaQuery: SchemaQuery, queries: Array<string>): Array<string> {
    if (queries && Array.isArray(queries) && queries.indexOf(schemaQuery.resolveKey()) === -1) {
        return queries.concat(schemaQuery.resolveKey());
    }

    return [];
}

function removeQuery(schemaQuery: SchemaQuery, queries: Array<string>): Array<string> {
    if (queries && Array.isArray(queries) && queries.indexOf(schemaQuery.resolveKey()) !== -1) {
        return queries.filter((q) => q !== schemaQuery.resolveKey());
    }

    return queries;
}