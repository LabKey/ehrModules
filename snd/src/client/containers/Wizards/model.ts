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

interface PropertyValidatorProps {
    description: string
    errorMessage: string
    expression: string
    name: string
    type: string
}

export class PropertyValidator implements PropertyValidatorProps {
    description: string = undefined;
    errorMessage: string = undefined;
    expression: string = undefined;
    name: string = undefined;
    type: string = undefined;

    constructor(props?: Partial<PropertyValidator>) {
        if (props) {
            for (let k in props) {
                if (this.hasOwnProperty(k) && props.hasOwnProperty(k)) {
                    this[k] = props[k];
                }
            }
        }
    }
}

export interface AttributeLookupProps {
    value: string
    label: string
}

export class AttributeLookups implements AttributeLookupProps{
    value: string = undefined;
    label: string = undefined;

    constructor(value: string, label: string) {
        this.value = value;
        this.label = label;
    }
}

interface PropertyDescriptorProps {
    defaultValue?: string
    format?: string
    label?: string
    lookupKey?: string
    lookupQuery?: string
    lookupSchema?: string
    lookupValues?: Array<AttributeLookupProps>
    max?: number
    min?: number
    name?: string
    rangeURI?: string
    redactedText?: string
    required?: boolean
    scale?: number
    sortOrder?: number
    validators?: Array<PropertyValidatorProps>
    value?: any
    [key: string]: any
}

export class PropertyDescriptor implements PropertyDescriptorProps {
    defaultValue: string = undefined;
    format: string = undefined;
    label: string = undefined;
    lookupKey: string = undefined;
    lookupQuery: string = undefined;
    lookupSchema: string = undefined;
    lookupValues: Array<AttributeLookupProps> = null;
    max: number = 0;
    min: number = 0;
    name: string = undefined;
    rangeURI: string = 'string';
    redactedText: string = undefined;
    required: boolean = false;
    scale: number = 0;
    sortOrder: number = 0;
    validators: Array<PropertyValidatorProps> = [];
    value: any = undefined;
    [key: string]: any;

    constructor(props?: Partial<PropertyDescriptor>) {
        if (props) {
            for (let k in props) {
                if (this.hasOwnProperty(k) && props.hasOwnProperty(k)) {
                    this[k] = props[k];
                }
            }
        }
    }
}