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
import * as React from 'react';

// add error check type behavior looking for schema.query format
interface LookupKeyInputProps {
    attribute?: any
    attributeId?: any
    attributeLookups?: any
    disabled?: boolean
    name?: string
    onChange?: React.EventHandler<React.ChangeEvent<HTMLSelectElement>>
    required?: boolean
    value?: string
}

export const LookupKeyInput = (props: LookupKeyInputProps) => {
    let value = '';

    if (props.value) {
        value = props.value;
    }

    return (
        <div className="input-row">
            <select
                className="form-control"
                disabled={props.disabled === true}
                name={props.name}
                onChange={props.onChange}
                value={value}>
                <option value=""/>
                {props.attributeLookups.map((opt: any, i: number) => {
                    return <option key={i} value={opt.value}>{opt.label}</option>;
                })}
            </select>
        </div>
    );
};