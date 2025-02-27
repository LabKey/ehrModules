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
import {PKG_SQ, PKG_TYPES, SND_PKG_QUERY, SND_PKG_SCHEMA } from './constants'
import { PackagesModel } from './model'

import { deleteRows, queryInvalidate } from '../../query/actions'
import { QueryModel } from '../../query/model'
import {clearAppMessage, setAppError, setAppMessage} from "../App/actions";
import {TOPLEVEL_SUPER_PKG_SQ} from "../SuperPackages/constants";

export function deletePackage(id: number) {
    return (dispatch) => {
        const rows = [{PkgId: id }];

        // todo: this should be wrapped in permissions check
        // should also display feedback to the user that the pkg was successfully deleted
        // need app wide 'message/error' field
        return deleteRows(SND_PKG_SCHEMA, SND_PKG_QUERY, rows).then((response) => {
            dispatch(queryInvalidate(PKG_SQ));
            dispatch(queryInvalidate(TOPLEVEL_SUPER_PKG_SQ));
            dispatch(packagesInvalidate());
            let msg = 'Package ' +  id + ' successfully removed.';
            dispatch(setAppMessage(msg));
            setTimeout(() => {
                dispatch(clearAppMessage({message: msg}));
            }, 2000);
        }).catch((error) => {
            dispatch(packagesResetWarning());
            dispatch(setAppError(error));
            console.log('delete package error', error);
        });
    }
}

export function filterPackages(input: string) {
    return {
        type: PKG_TYPES.PACKAGES_SEARCH_FILTER,
        input
    };
}

export function packagesInit(model: PackagesModel, dataResponse: QueryModel) {
    return {
        type: PKG_TYPES.PACKAGES_INIT,
        dataResponse,
        model
    };
}

export function packagesInvalidate() {
    return {
        type: PKG_TYPES.PACKAGES_INVALIDATE
    };
}

export function packagesResetWarning() {
    return {
        type: PKG_TYPES.PACKAGES_RESET_WARNING
    }
}

export function packagesWarning(message?: string) {
    return {
        type: PKG_TYPES.PACKAGES_WARNING,
        message
    }
}
export function resetPackageFilter() {
    return {
        type: PKG_TYPES.PACKAGES_RESET_FILTER
    };
}

export function toggleDrafts() {
    return {
        type: PKG_TYPES.PACKAGES_TOGGLE_DRAFTS
    };
}