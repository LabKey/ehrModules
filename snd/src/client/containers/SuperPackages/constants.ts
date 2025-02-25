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

const SUPER_PACKAGES_PREFIX = 'superpackages/';

export const SND_PKG_SCHEMA: string = 'snd',
    SND_TOP_LEVEL_SUPER_PKG_QUERY: string = 'topLevelSuperPkgs';

export const TOPLEVEL_SUPER_PKG_SQ = SchemaQuery.create(SND_PKG_SCHEMA, SND_TOP_LEVEL_SUPER_PKG_QUERY);

const superPkgRequiredColumns = [
    'SuperPkgId',
    'ParentSuperPkgId',
    'PkgId',
    'SuperPkgPath',
    'SortOrder',
    'Required',
    'HasEvent',
    'HasProject',
    'IsPrimitive',
    'Container',
    'Created',
    'CreatedBy',
    'Modified',
    'ModifiedBy'
];

const topLevelSuperPkgRequiredColumns = [
    'SuperPkgId',
    'PkgId',
    'Description',
    'Narrative',
    'IsPrimitive',
    'Container',
    'Repeatable'
];

export const SUPERPKG_REQUIRED_COLUMNS = {
    SUPER_PKG: superPkgRequiredColumns,
    TOP_LEVEL_SUPER_PKG: topLevelSuperPkgRequiredColumns
};