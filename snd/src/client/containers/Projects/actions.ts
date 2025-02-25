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


import {PROJECT_SQL, PROJECT_TYPES, SND_PROJECT_QUERY, SND_PROJECT_SCHEMA} from './constants'
import { ProjectsModel } from './model'

import { deleteRows, queryInvalidate } from '../../query/actions'
import { QueryModel } from '../../query/model'
import { setAppError, setAppMessage, clearAppMessage } from "../App/actions";

export function deleteProject(id: number, rev: number, objId: number) {
    return (dispatch) => {
        const rows = [{ObjectId: objId }];

        return deleteRows(SND_PROJECT_SCHEMA, SND_PROJECT_QUERY, rows).then((response) => {
            dispatch(queryInvalidate(PROJECT_SQL));
            dispatch(projectsInvalidate());
            let msg = 'Project ' +  id + ', ' + 'Revision ' + rev + ' successfully removed.';
            dispatch(setAppMessage(msg));
            setTimeout(() => {
                dispatch(clearAppMessage({message: msg}));
            }, 2000);
        }).catch((error) => {
            dispatch(projectsResetWarning());
            dispatch(setAppError(error));
            console.log('delete project error', error);
        });
    }
}

export function filterProjects(input: string) {
    return {
        type: PROJECT_TYPES.PROJECTS_SEARCH_FILTER,
        input
    };
}

export function projectsInit(model: ProjectsModel, dataResponse: QueryModel) {
    return {
        type: PROJECT_TYPES.PROJECTS_INIT,
        dataResponse,
        model
    };
}

export function projectsInvalidate() {
    return {
        type: PROJECT_TYPES.PROJECTS_INVALIDATE
    };
}

export function projectsResetWarning() {
    return {
        type: PROJECT_TYPES.PROJECTS_RESET_WARNING
    }
}

export function projectsWarning(message?: string) {
    return {
        type: PROJECT_TYPES.PROJECTS_WARNING,
        message
    }
}
export function resetProjectFilter() {
    return {
        type: PROJECT_TYPES.PROJECTS_RESET_FILTER
    };
}

export function toggleDrafts() {
    return {
        type: PROJECT_TYPES.PROJECTS_TOGGLE_DRAFTS
    };
}

export function toggleNotActive() {
    return {
        type: PROJECT_TYPES.PROJECTS_TOGGLE_NOT_ACTIVE
    };
}