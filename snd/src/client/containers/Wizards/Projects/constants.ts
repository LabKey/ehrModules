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



const PROJECT_PREFIX = 'wizards/projects/';

export const PROJECT_WIZARD_TYPES = {
    PROJECT_CHECK_VALID: PROJECT_PREFIX + 'PROJECT_CHECK_VALID',
    PROJECT_INIT: PROJECT_PREFIX + 'PROJECT_INIT',
    PROJECT_INVALIDATE: PROJECT_PREFIX + 'PROJECT_INVALIDATE',
    PROJECT_ERROR: PROJECT_PREFIX + 'PROJECT_ERROR',
    PROJECT_LOADED: PROJECT_PREFIX + 'PROJECT_LOADED',
    PROJECT_LOADING: PROJECT_PREFIX + 'PROJECT_LOADING',
    PROJECT_SUCCESS: PROJECT_PREFIX + 'PROJECT_SUCCESS',
    PROJECT_WARNING: PROJECT_PREFIX + 'PROJECT_WARNING',
    PROJECT_FULL_NARRATIVE: PROJECT_PREFIX + 'PROJECT_FULL_NARRATIVE',
    PROJECT_CLOSE_FULL_NARRATIVE: PROJECT_PREFIX + 'PROJECT_CLOSE_FULL_NARRATIVE',
    PROJECTS_TOGGLE_SUPERPKG_ACTIVE: PROJECT_PREFIX + 'PROJECTS_TOGGLE_SUPERPKG_ACTIVE',
    SET_REVISED_VALUES: PROJECT_PREFIX + 'SET_REVISED_VALUES',

    SET_ACTIVE_PROJECT: PROJECT_PREFIX + 'SET_ACTIVE_PROJECT',

    SAVE_FIELD: PROJECT_PREFIX + 'SAVE_FIELD',
    SAVE_NARRATIVE: PROJECT_PREFIX + 'SAVE_NARRATIVE',

    RESET_SUBMISSION: PROJECT_PREFIX + 'SET_RESET_SUBMISSION',
    SET_SUBMITTED: PROJECT_PREFIX + 'SET_SUBMITTED',
    SET_SUBMITTING: PROJECT_PREFIX + 'SET_SUBMITTING',
};
