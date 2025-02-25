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
const APP_PREFIX = 'app/';

export const APP_TYPES = {
    APP_CLEAR_MESSAGE: APP_PREFIX + 'APP_CLEAR_MESSAGE',
    APP_ERROR: APP_PREFIX + 'APP_ERROR',
    APP_ERROR_RESET: APP_PREFIX + 'APP_ERROR_RESET',
    APP_MESSAGE: APP_PREFIX + 'APP_MESSAGE',
    APP_WARNING: APP_PREFIX + 'APP_WARNING',
    APP_ERROR_CLEAR_ALL: APP_PREFIX + 'APP_ERROR_CLEAR_ALL'
};

export enum VIEW_TYPES {
    PACKAGE_CLONE,
    PACKAGE_EDIT,
    PACKAGE_NEW,
    PACKAGE_VIEW,
    PROJECT_REVISE,
    PROJECT_EDIT,
    PROJECT_NEW,
    PROJECT_VIEW
};
