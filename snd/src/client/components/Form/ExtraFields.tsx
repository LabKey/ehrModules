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
import {ControlLabel} from 'react-bootstrap'

import {TextInput} from '../../components/Form/TextInput'
import {ExtraFieldSelectInput} from "./ExtraFieldSelect";
import {VIEW_TYPES} from "../../containers/App/constants";

interface ExtraFieldsProps
{
    disabled?: any
    extraFields?: any
    handleFieldChange?: any
    name?: string
    revisedFields?: boolean
    perRow: number
    index?: number
    displayCols: number
    key: string
    view?: VIEW_TYPES
}

export class ExtraFields extends React.Component<ExtraFieldsProps, any>
{
    private staticVals: Array<string>
    constructor(props) {
        super(props);

        if (this.props.revisedFields) {
            this.staticVals = this.props.extraFields.map((extra) => {
                return extra.value;
            });
        }
    }

    render()
    {
        const {extraFields, disabled, handleFieldChange, revisedFields, displayCols, index, perRow, key} = this.props;
        let count = index - 1;
        let colClass = "col-xs-" + displayCols;
        let start = index ? index : 0;

        if (extraFields && extraFields.length)
        {
            let fields = extraFields.slice(start, start + perRow);  // One row
            if (fields.length > 0)
            {
                let divClass = "row clearfix";
                if (index != 0)
                    divClass += " margin-top";

                return (
                    <div key={key}>
                        <div className={divClass}>
                            {fields.map((extra) => {
                                    let {name, label} = extra;
                                    if (!label)
                                        label = name;

                                    return (
                                        <div key={"extraCol-" + name + (revisedFields ? 'Old' : '')} className={colClass}
                                             style={{paddingRight: '-15px'}}>
                                            <ControlLabel>{label}</ControlLabel>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                        <div className="row clearfix">
                            {fields.map((extra, i) => {
                                    let {lookupValues, value, name} = extra;
                                    count++;
                                    return (

                                        <div key={"extraCol-" + name + (revisedFields ? 'Old' : '')} className={colClass}
                                             style={{paddingRight: '-15px !important'}}>
                                            {lookupValues ? (
                                                <div>
                                                    {React.createElement(ExtraFieldSelectInput,
                                                        {
                                                            disabled: disabled || revisedFields,
                                                            options: lookupValues,
                                                            handleFieldChange: revisedFields ? null : handleFieldChange,
                                                            val: revisedFields ? this.staticVals[i + index] : value,
                                                            name: name + (revisedFields ? 'Old' : ''),
                                                            index: count
                                                        }
                                                    )}
                                                </div>
                                            ) : (
                                                <div>
                                                    {React.createElement(TextInput,
                                                        {
                                                            disabled: disabled || revisedFields,
                                                            value: revisedFields ? this.staticVals[i + index] : value,
                                                            onChange: revisedFields ? null : handleFieldChange,
                                                            name: ('extraFields_' + count + '_' + name + (revisedFields ? 'Old' : ''))
                                                        }
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    </div>
                );
            }
            return <div/>
        }

        return <div className="row col-xs-12" style={{height: '46px'}}/>
    }
}
