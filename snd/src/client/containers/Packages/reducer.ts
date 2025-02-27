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
import { handleActions } from 'redux-actions';

import { PKG_TYPES } from './constants'
import { QueryPackageModel, PackagesModel } from './model'

export const packages = handleActions({

    [PKG_TYPES.PACKAGES_INIT]: (state: PackagesModel, action: any) => {
        const { dataResponse } = action;
        const { data, dataCount, dataIds } = dataResponse;

        let active = [],
            ids = [],
            drafts = [];
        const packagesData = dataIds.reduce((prev, next: number) => {
            const packageData = data[next];
            const id = packageData.PkgId.value;
            ids.push(id);
            prev[id] = new QueryPackageModel(packageData);
            // // should filter on hasEvent or Active?
            if (packageData.Active.value === true) {
                active.push(id);
            }
            else {
                drafts.push(id);
            }

            return prev;
        }, {});

        return new PackagesModel(Object.assign({}, state, {
            active,
            data: packagesData,
            dataIds: ids,
            drafts,
            isInit: true,
            filteredActive: active,
            filteredDrafts: drafts,
            packageCount: dataCount
        }));
    },

    [PKG_TYPES.PACKAGES_INVALIDATE]: () => {
        return new PackagesModel();
    },

    [PKG_TYPES.PACKAGES_RESET_FILTER]: (state: PackagesModel) => {
        const { active, drafts } = state;

        return new PackagesModel(Object.assign({}, state, {
            filteredActive: active,
            filteredDrafts: drafts
        }));
    },

    [PKG_TYPES.PACKAGES_RESET_WARNING]: (state: PackagesModel) => {
        return new PackagesModel(Object.assign({}, state, {
            isWarning: false,
            message: undefined
        }));
    },

    [PKG_TYPES.PACKAGES_SEARCH_FILTER]: (state: PackagesModel, action: any) => {
        const { active, data, dataIds, drafts } = state;
        const { input } = action;

        let filteredActive = active,
            filteredDrafts = drafts;

        if (input && input !== '') {
            const filtered = filterPackages(input, dataIds, data);
            filteredActive = filtered.filter((id) => {
                return active.indexOf(id) !== -1;
            });

            filteredDrafts = filtered.filter((id) => {
                return drafts.indexOf(id) !== -1;
            });
        }

        return new PackagesModel(Object.assign({}, state, {
            filteredActive,
            filteredDrafts,
            input
        }));
    },

    [PKG_TYPES.PACKAGES_TOGGLE_DRAFTS]: (state: PackagesModel, action: any) => {
        const { toggled } = action;

        const showDrafts = toggled && typeof toggled === 'boolean' ? toggled : !state.showDrafts;

        return new PackagesModel(Object.assign({}, state, {
            showDrafts
        }));
    },

    [PKG_TYPES.PACKAGES_WARNING]: (state: PackagesModel, action: any) => {
        const { message } = action;

        return new PackagesModel(Object.assign({}, state, {
            isWarning: true,
            message
        }));
    },

}, new PackagesModel());

function filterPackages(input: string, dataIds: Array<number> , data: {[key: string]: any}) {

    return dataIds.filter((id: number) => {
        const pkg: QueryPackageModel = data[id];

        if (pkg) {
            return (
                pkg.Description &&
                pkg.Description.value.toLowerCase().indexOf(input.toLowerCase()) !== -1
            ) || (
                pkg.PkgId &&
                pkg.PkgId.value.toString().indexOf(input) !== -1
            )
        }

        return false;
    });

}