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


interface SubPackageSubmissionModelProps {
    active: boolean;
    projectItemId?: number;
    superPkgId: number;
    sortOrder: number;
    required: boolean;
}

export class SubPackageSubmissionModel implements SubPackageSubmissionModelProps {
    active: boolean = undefined;
    projectItemId?: number = undefined;
    superPkgId: number = undefined;
    sortOrder: number = undefined;
    required: boolean = undefined;

    constructor(props: Partial<SubPackageSubmissionModel>) {
        if (props) {
            for (let k in props) {
                if (this.hasOwnProperty(k) && props.hasOwnProperty(k)) {
                    this[k] = props[k];
                }
            }
        }
    }
}