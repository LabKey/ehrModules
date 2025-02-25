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
import { SchemaQuery } from '../../query/model'

const PKG_PREFIX = 'packages/';

export const PKG_TYPES = {
    PACKAGES_ERROR: PKG_PREFIX + 'PACKAGES_ERROR',
    PACKAGES_INIT: PKG_PREFIX + 'PACKAGES_INIT',
    PACKAGES_INVALIDATE: PKG_PREFIX + 'PACKAGES_INVALIDATE',
    PACKAGES_SUCCESS: PKG_PREFIX + 'PACKAGES_SUCCESS',
    PACKAGES_SEARCH_FILTER: PKG_PREFIX + 'PACKAGES_SEARCH_FILTER',
    PACKAGES_TOGGLE_DRAFTS: PKG_PREFIX + 'PACKAGES_TOGGLE_DRAFTS',
    PACKAGES_WARNING: PKG_PREFIX + 'PACKAGES_WARNING',
    PACKAGES_RESET_WARNING: PKG_PREFIX + 'PACKAGES_RESET_WARNING',
    PACKAGES_RESET_FILTER: PKG_PREFIX + 'PACKAGES_RESET_FILTER',
    SET_ACTIVE_PACKAGE: PKG_PREFIX + 'SET_ACTIVE_PACKAGE',
};

export const SND_PKG_SCHEMA: string = 'snd',
    SND_PKG_QUERY: string = 'pkgs',
    SND_CATEGORY_QUERY: string = 'pkgCategories';

export const CAT_SQ = SchemaQuery.create(SND_PKG_SCHEMA, SND_CATEGORY_QUERY);
export const EDITABLE_CAT_SQ = SchemaQuery.create(SND_PKG_SCHEMA, SND_CATEGORY_QUERY, undefined, {editable: true});
export const PKG_SQ = SchemaQuery.create(SND_PKG_SCHEMA, SND_PKG_QUERY);

const categoriesRequiredColumns = [
    'CategoryId',
    'Description'
];

const packagesRequiredColumns = [
    'PkgId',
    'Description',
    'Active',
    'Repeatable',
    'QcState',
    'ObjectId',
    'Narrative',
    'HasEvent',
    'HasProject',
    'Container',
    'Created',
    'CreatedBy',
    'Modified',
    'ModifiedBy'
];

export const REQUIRED_COLUMNS = {
    CATS: categoriesRequiredColumns,
    PKGS: packagesRequiredColumns,
};