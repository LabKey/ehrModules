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
import { AppModel } from '../containers/App/model'
import { PackagesModel } from '../containers/Packages/model'
import { ProjectsModel } from '../containers/Projects/model'
import { UserModel } from '../containers/SignIn/model'
import { WizardReducerProps } from '../containers/Wizards/reducer'
import { QueryModelsContainer } from '../query/model'

declare global {

    interface APP_STATE_PROPS {
        app: AppModel
        packages: PackagesModel
        projects: ProjectsModel
        queries: QueryModelsContainer
        user: UserModel
        wizards: WizardReducerProps

        form: any
        router: any
    }

    const LABKEY: any;

    const jQuery: any;
}

export {}