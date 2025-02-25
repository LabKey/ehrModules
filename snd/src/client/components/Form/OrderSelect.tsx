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
import { WrappedFieldProps } from 'redux-form';

const OrderOptions: Array<{label: string, value: string}> = [
    {
        value: 'up',
        label: 'Move Up'
    },
    {
        value: 'down',
        label: 'Move Down'
    }
];

interface OrderSelectProps {
    disabled?: boolean
    first?: boolean
    last?: boolean
    name?: string
    onChange?: React.EventHandler<React.ChangeEvent<HTMLSelectElement>>
    required?: boolean
    value?: string
}

export const OrderSelect = (props: OrderSelectProps) => {
    // order is 0 indexed, add 1 for display purposes
    return (
        <div className="input-row">
            <div style={{float: 'left', width: '25%', padding: '5px 0 0'}}>
                {props.value + 1}
            </div>
            <div style={{float: 'left', width: '75%'}}>
                <select
                    className="form-control"
                    disabled={(props.disabled === true) || (props.first && props.last)}
                    name={props.name}
                    onChange={props.onChange}
                    required={props.required === true}
                    value={props.value}>
                    <option />
                    {OrderOptions.filter((o) => {
                        return (!props.first && !props.last) ||
                            (props.first && o.value !== 'up') ||
                            (props.last&& o.value !== 'down');
                    }).map((opt: {label: string, value: string}, i: number) => {
                        return <option key={i} value={opt.value}>{opt.label}</option>;
                    })}
                </select>
            </div>
        </div>
    );
};