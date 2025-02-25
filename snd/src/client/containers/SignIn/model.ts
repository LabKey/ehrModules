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

// User
interface UserProps {
    avatar: string;
    canDelete: boolean;
    canDeleteOwn: boolean;
    canInsert: boolean;
    canUpdate: boolean;
    canUpdateOwn: boolean;
    displayName: string;
    email: string;
    id: number;
    isAdmin: boolean;
    isDeveloper: boolean;
    isGuest: boolean;
    isRootAdmin: boolean;
    isSignedIn: boolean;
    isSystemAdmin: boolean;
    phone: string;
}

export class UserModel implements UserProps {
    avatar: string = LABKEY.contextPath + '/_images/defaultavatar.png';
    canDelete: boolean = false;
    canDeleteOwn: boolean = false;
    canInsert: boolean = false;
    canUpdate: boolean = false;
    canUpdateOwn: boolean = false;
    displayName: string = 'guest';
    email: string = undefined;
    id: number = 0;
    isAdmin: boolean = false;
    isDeveloper: boolean = false;
    isGuest: boolean = true;
    isRootAdmin: boolean = false;
    isSignedIn: boolean = false;
    isSystemAdmin: boolean = false;
    phone: string = null;

    constructor(props?: Partial<UserModel>) {
        if (props) {
            for (let k in props) {
                if (this.hasOwnProperty(k) && props.hasOwnProperty(k)) {
                    this[k] = props[k];
                }
            }
        }
    }
}