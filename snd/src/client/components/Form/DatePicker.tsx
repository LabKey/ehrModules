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

import * as React from 'react';

interface DatePickerProps {
    disabled?: boolean
    name?: string
    onChange?: any
    required?: boolean
    value?: string
}

export const DatePicker = (props: DatePickerProps) => {
    const { value } = props;
    let dateString = "", year, month, day;

    if (value != null && value != '') {
        let dateParts, date = value.split(' ')[0];
        if (date.indexOf('-') !== -1) {
            dateParts = date.split('-');
        } else {
            dateParts = date.split('/');
        }
        year = dateParts[0];
        month = dateParts[1];
        day = dateParts[2];
        dateString = year + '-'
            + (month.toString().length === 1 ? '0' + month : month) + '-'
            + (day.toString().length === 1 ? '0' + day : day);
    }

    const disabledStyle = {
        backgroundColor: '#EEEEEE'
    };

    return (
        <div className="input-row">
            <input
                className="details-input"
                type="date"
                disabled={props.disabled}
                required={props.required}
                value={dateString}
                onChange={props.onChange}
                name={props.name}
                style={props.disabled ? disabledStyle : null}
                />
        </div>
    );
};