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
import * as React from 'react';
import { WrappedFieldProps } from 'redux-form';

interface FieldCheckboxInputProps {
    disabled?: boolean
    required?: boolean
}

export const FieldCheckboxInput = (field: WrappedFieldProps<any> & FieldCheckboxInputProps) => {
    const checked = field.input.value;
    return (
        <span className="input-row">
            <input
                {...field.input}
                checked={checked}
                disabled={field.disabled === true}
                required={field.required === true}
                tabIndex={0}
                type="checkbox"/>
            {field.meta.touched && field.meta.error ?
                <div className="error">
                    <span>{field.meta.error}</span>
                </div>
                : null}
        </span>
    );
};

interface CheckboxInputProps {
    disabled?: boolean
    name?: string
    onChange?: React.EventHandler<React.ChangeEvent<HTMLInputElement>>
    required?: boolean
    value?: boolean
}

export const CheckboxInput = (props: CheckboxInputProps) => {
    return (
        <span className="input-row">
            <input
                defaultChecked={props.value}
                disabled={props.disabled === true}
                name={props.name}
                onChange={props.onChange}
                required={props.required === true}
                tabIndex={0}
                type="checkbox"/>
        </span>
    );
};