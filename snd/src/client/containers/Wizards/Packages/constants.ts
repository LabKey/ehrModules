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
const PKG_PREFIX = 'wizards/packages/';

export const VALIDATOR_LTE = '~lte=';
export const VALIDATOR_GTE = '~gte=';
export const VALIDATOR_STRING_DEFAULT_MAX = "4000";

export const PKG_WIZARD_TYPES = {
    PACKAGE_CHECK_VALID: PKG_PREFIX + 'PACKAGE_CHECK_VALID',
    PACKAGE_INIT: PKG_PREFIX + 'PACKAGE_INIT',
    PACKAGE_INVALIDATE: PKG_PREFIX + 'PACKAGE_INVALIDATE',
    PACKAGE_ERROR: PKG_PREFIX + 'PACKAGE_ERROR',
    PACKAGE_LOADED: PKG_PREFIX + 'PACKAGE_LOADED',
    PACKAGE_LOADING: PKG_PREFIX + 'PACKAGE_LOADING',
    PACKAGE_SUCCESS: PKG_PREFIX + 'PACKAGE_SUCCESS',
    PACKAGE_WARNING: PKG_PREFIX + 'PACKAGE_WARNING',
    PACKAGE_FULL_NARRATIVE: PKG_PREFIX + 'PACKAGE_FULL_NARRATIVE',
    PACKAGE_CLOSE_FULL_NARRATIVE: PKG_PREFIX + 'PACKAGE_CLOSE_FULL_NARRATIVE',
    PARSE_ATTRIBUTES: PKG_PREFIX + 'PARSE_ATTRIBUTES',

    SET_ACTIVE_PACKAGE: PKG_PREFIX + 'SET_ACTIVE_PACKAGE',

    SAVE_FIELD: PKG_PREFIX + 'SAVE_FIELD',
    SAVE_NARRATIVE: PKG_PREFIX + 'SAVE_NARRATIVE',

    RESET_SUBMISSION: PKG_PREFIX + 'SET_RESET_SUBMISSION',
    SET_SUBMITTED: PKG_PREFIX + 'SET_SUBMITTED',
    SET_SUBMITTING: PKG_PREFIX + 'SET_SUBMITTING',
};
