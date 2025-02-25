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
// setAppError
import { APP_TYPES } from './constants'

interface ClearMessage {
    message?: string
    id?: number
}

export function clearAppMessage(values: ClearMessage) {
    return {
        type: APP_TYPES.APP_CLEAR_MESSAGE,
        values
    }
}

export function clearAllErrors() {
    return {
        type: APP_TYPES.APP_ERROR_CLEAR_ALL
    }
}

export function resetAppError(id?: number) {
    return {
        type: APP_TYPES.APP_ERROR_RESET,
        id
    }
}

export function setAppError(error) {
    return {
        type: APP_TYPES.APP_ERROR,
        error
    }
}

export function setAppMessage(message: string) {
    return {
        type: APP_TYPES.APP_MESSAGE,
        message
    }
}