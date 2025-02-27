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

interface FieldTextInputProps {
    disabled?: boolean
    required?: boolean
}

export const FieldTextInput = (field: WrappedFieldProps<{}> & FieldTextInputProps) => {
    return (
        <div className="input-row">
            <input
                {...field.input}
                className="form-control"
                disabled={field.disabled === true}
                required={field.required === true}
                type="text"/>
            {field.meta.touched && field.meta.error ?
                <div className="error">
                    <span>{field.meta.error}</span>
                </div>
                : null}
        </div>
    );
};


interface TextInputProps {
    disabled?: boolean
    name?: string
    onChange?: React.EventHandler<React.ChangeEvent<HTMLInputElement>>
    required?: boolean
    value?: string
}

export const TextInput = (props: TextInputProps) => {
    const inputValue = props.value != null ? props.value : '';
    return (
        <div className="input-row" title={inputValue}>
            <input
                className="form-control"
                disabled={props.disabled === true}
                name={props.name}
                onChange={props.onChange}
                required={props.required === true}
                type="text"
                value={inputValue}/>
        </div>
    );
};