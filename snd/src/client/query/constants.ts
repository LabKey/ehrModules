/*
 * Copyright (c) 2017 LabKey Corporation
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
const QUERY_PREFIX = 'queries/';

export const QUERY_TYPES = {
    QUERY_EDIT_ADD_ROW: QUERY_PREFIX + 'QUERY_EDIT_ADD_ROW',
    QUERY_EDIT_INITIALIZE: QUERY_PREFIX + 'QUERY_EDIT_INITIALIZE',
    QUERY_EDIT_REMOVE_ROW: QUERY_PREFIX + 'QUERY_EDIT_REMOVE_ROW',
    QUERY_EDIT_SET_SUBMITTED: QUERY_PREFIX + 'QUERY_EDIT_SET_SUBMITTED',
    QUERY_EDIT_SET_SUBMITTING: QUERY_PREFIX + 'QUERY_EDIT_SET_SUBMITTING',
    QUERY_EDIT_SUCCESS: QUERY_PREFIX + 'QUERY_EDIT_SUCCESS',


    QUERY_DETAILS_SUCCESS: QUERY_PREFIX + 'QUERY_DETAILS_SUCCESS',
    QUERY_ERROR: QUERY_PREFIX + 'QUERY_ERROR',
    QUERY_INITIALIZE: QUERY_PREFIX + 'QUERY_INITIALIZE',
    QUERY_INVALIDATE: QUERY_PREFIX + 'QUERY_INVALIDATE',
    QUERY_LOADED: QUERY_PREFIX + 'QUERY_LOADED',
    QUERY_LOADING: QUERY_PREFIX + 'QUERY_LOADING',
    QUERY_SUCCESS: QUERY_PREFIX + 'QUERY_SUCCESS',

    QUERY_SEARCH_ERROR: QUERY_PREFIX + 'QUERY_SEARCH_ERROR',
    QUERY_SEARCH_FINISHED: QUERY_PREFIX + 'QUERY_SEARCH_FINISHED',
    QUERY_SEARCH_INIT: QUERY_PREFIX + 'QUERY_SEARCH_INIT',
    QUERY_SEARCH_SEARCHING: QUERY_PREFIX + 'QUERY_SEARCH_SEARCHING',
    QUERY_SEARCH_SUCCESS: QUERY_PREFIX + 'QUERY_SEARCH_SUCCESS',
};