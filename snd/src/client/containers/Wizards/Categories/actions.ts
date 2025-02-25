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
import { deleteRows, insertRows, queryInvalidate, updateRows } from '../../../query/actions'
import { EditableQueryModel, QueryColumn } from '../../../query/model'
import { clearAppMessage, setAppError, setAppMessage } from '../../App/actions'

import { CAT_SQ } from '../../Packages/constants'

const CATEGORY_SUCCESS_MESSAGE = (changeType: string) => [changeType, 'saved.'].join(' ');

interface CategoryActionProps {
    action: (schemaName: string, queryName: string, rows: Array<any>) => any
    actionName: string
    schemaName: string
    queryName: string
    rows: Array<any>
}

export function saveCategoryChanges(editableModel: EditableQueryModel, values: {[key: string]: any}) {
    return (dispatch, getState: () => APP_STATE_PROPS) => {
        // parse out the form and get applicable changes and assign them to the correct type
        const changes = getChanges(editableModel, values);
        // keep an array of the changes that were successful
        let successActions = [];

        dispatch(editableModel.setSubmitting());

        // recursively walk the array of actions and dispatching errors/success where necessary
        function handleActions(actionArr: Array<CategoryActionProps>) {
            if (actionArr.length === 0) {
                return Promise.resolve(successActions);
            }

            const nextAction: CategoryActionProps = actionArr[0];
            const { action, actionName, queryName, schemaName, rows } = nextAction;

            const remaining: Array<CategoryActionProps> = actionArr.slice(1);
            return action(schemaName, queryName, rows).catch((error) => {
                dispatch(setAppError(error));
                return error;
            }).then((response) => {
                if (response && response.success !== false) {
                    successActions.push(actionName);
                }
                return handleActions(remaining);
            });
        }

        let hasAdded = changes.added && changes.added.length,
            hasEdited = changes.edited && changes.edited.length,
            hasRemoved = changes.removed && changes.removed.length;

        let actions: Array<CategoryActionProps> = [];

        // set each type of change with associated actions
        if (hasAdded) {
            const actionName = 'Category Addition' + (changes.added.length > 1 ? 's' : '');
            const addCategories: CategoryActionProps = {
                action: insertRows,
                actionName,
                schemaName: CAT_SQ.schemaName,
                queryName: CAT_SQ.queryName,
                rows: changes.added
            };

            actions.push(addCategories);
        }

        if (hasEdited) {
            const actionName = 'Edit' + (changes.edited.length > 1 ? 's' : '');
            const editCategories: CategoryActionProps = {
                action: updateRows,
                actionName,
                schemaName: CAT_SQ.schemaName,
                queryName: CAT_SQ.queryName,
                rows: changes.edited
            };

            actions.push(editCategories);
        }

        if (hasRemoved) {
            const actionName = 'Category Removal' + (changes.removed.length > 1 ? 's' : '');
            const deleteCategories: CategoryActionProps = {
                action: deleteRows,
                actionName,
                schemaName: CAT_SQ.schemaName,
                queryName: CAT_SQ.queryName,
                rows: changes.removed
            };

            actions.push(deleteCategories);
        }

        return handleActions(actions).then((success: Array<string>) => {
            if (success.length) {
                // if we successfully made an edit, the model can be set to submitted
                // then go through and set a message for each change we made
                let editModel = getState().queries.editableModels[editableModel.id];
                dispatch(editModel.setSubmitted());

                success.forEach(s => {
                    const message = CATEGORY_SUCCESS_MESSAGE(s);
                    dispatch(setAppMessage(message));

                    setTimeout(() => {
                        dispatch(clearAppMessage({message: message}));
                    }, 2000);
                })
            }

            // even if category changes are not successful, invalidate the SQ to ensure correct grid status
            dispatch(queryInvalidate(CAT_SQ));

        }).catch(error => {
            console.log('action handler error', error)
        });
    }
}

function getChanges(editableModel: EditableQueryModel, values: {[key: string]: any}): {
    added: Array<{[key: string]: any}>
    edited: Array<{[key: string]: any}>
    removed: Array<{[key: string]: any}>
} {
    const initialValues = editableModel.data;

    let added = [],
        edited = [],
        removed = editableModel.getRemoved();

    Object.keys(values).forEach((key) => {
        const row = values[key];
        const initialRow = initialValues[key];

        if (initialRow) {
            const hasEdits = Object.keys(row).some((field) => {
                if (row[field] && initialRow[field]) {
                    return row[field]['value'] !== initialRow[field]['value'];
                }

                return false;
            });

            hasEdits ? edited.push(row) : null;
        }
        else {
            added.push(values[key]);
        }
    });

    return {
        added: formatChanges(added, editableModel),
        edited: formatChanges(edited, editableModel),
        removed
    }
}

function formatChanges(changed: Array<any>, editableModel: EditableQueryModel) {
    if (changed && changed.length) {
        return changed.map((row) => {
            return editableModel.getRequiredInsertColumns().reduce((prev, next: QueryColumn) => {
                const name = next.name,
                    type = next.jsonType,
                    hasValue = row[name] !== undefined;

                // Checkbox inputs will not hand back true/false as values, so we need to correctly set booleans here
                if (type === 'boolean' && (!hasValue || row[name]['value'] !== true)) {
                    prev[name] = false;
                }
                else if (hasValue) {
                    prev[name] = row[name]['value'];
                }

                return prev;
            }, {});
        });
    }

    return [];
}