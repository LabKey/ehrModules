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

import { SchemaQuery } from '../../query/model'

const PROJECT_PREFIX = 'projects/';

export const PROJECT_TYPES = {
    PROJECTS_ERROR: PROJECT_PREFIX + 'PROJECTS_ERROR',
    PROJECTS_INIT: PROJECT_PREFIX + 'PROJECTS_INIT',
    PROJECTS_INVALIDATE: PROJECT_PREFIX + 'PROJECTS_INVALIDATE',
    PROJECTS_SUCCESS: PROJECT_PREFIX + 'PROJECTS_SUCCESS',
    PROJECTS_SEARCH_FILTER: PROJECT_PREFIX + 'PROJECTS_SEARCH_FILTER',
    PROJECTS_TOGGLE_DRAFTS: PROJECT_PREFIX + 'PROJECTS_TOGGLE_DRAFTS',
    PROJECTS_TOGGLE_NOT_ACTIVE: PROJECT_PREFIX + 'PROJECTS_TOGGLE_NOT_ACTIVE',
    PROJECTS_WARNING: PROJECT_PREFIX + 'PROJECTS_WARNING',
    PROJECTS_RESET_WARNING: PROJECT_PREFIX + 'PROJECTS_RESET_WARNING',
    PROJECTS_RESET_FILTER: PROJECT_PREFIX + 'PROJECTS_RESET_FILTER',
    SET_ACTIVE_PROJECT: PROJECT_PREFIX + 'SET_ACTIVE_PROJECT',
};

const projectsRequiredColumns = [
    'Active',
    'Description',
    'EndDate',
    'HasEvent',
    'ObjectId',
    'ProjectId',
    'ReferenceId',
    'RevisionNum',
    'StartDate'
];

export const SND_PROJECT_SCHEMA: string = 'snd',
    SND_PROJECT_QUERY: string = 'Projects';

export const PROJECT_SQL = SchemaQuery.create(SND_PROJECT_SCHEMA, SND_PROJECT_QUERY);

export const REQUIRED_COLUMNS = {
    PROJECTS: projectsRequiredColumns
};