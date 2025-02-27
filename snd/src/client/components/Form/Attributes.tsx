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
import { PropertyDescriptor } from '../../containers/Wizards/model'

import { CheckboxInput } from './Checkbox'
import { DataTypeSelect } from './DataTypeSelect'
import { LookupKeyInput } from './LookupKeyInput'
import { NumericInput } from './NumericInput'
import { TextInput } from './TextInput'
import { OrderSelect } from "./OrderSelect";

interface AttributeColumnProps {
    disabled?: boolean
    inputComponent?: (props) => JSX.Element
    label?: string
    name: string
    required?: boolean
    width?: string
}

const ATTRIBUTE_COLUMNS: Array<AttributeColumnProps> = [
    {
        disabled: true,
        inputComponent: TextInput,
        label: 'Key',
        name: 'name',
        required: true,
        width: '7vw'
    },
    {
        inputComponent: LookupKeyInput,
        label: 'Lookup Key',
        name: 'lookupKey',
        required: false,
        width: '13vw'
    },
    {
        inputComponent: DataTypeSelect,
        label: 'Data Type',
        name: 'rangeURI',
        required: true,
        width: '8vw'
    },
    {
        inputComponent: TextInput,
        label: 'Label',
        name: 'label',
        required: false,
        width: '13vw'
    },
    {
        inputComponent: NumericInput,
        label: 'Min',
        name: 'min',
        required: false,
        width: '8vw'
    },
    {
        inputComponent: NumericInput,
        label: 'Max',
        name: 'max',
        required: false,
        width: '8vw'
    },
    {
        inputComponent: TextInput,
        label: 'Format',
        name: 'format',
        required: false,
        width: '8vw'
    },
    {
        inputComponent: TextInput,
        label: 'Default',
        name: 'defaultValue',
        required: false,
        width: '13vw'
    },
    {
        inputComponent: OrderSelect,
        label: 'Order',
        name: 'sortOrder',
        required: false,
        width: '12vw'
    },
    {
        inputComponent: CheckboxInput,
        label: 'Req.',
        name: 'required',
        required: false,
        width: '5vw'
    },
    {
        inputComponent: TextInput,
        label: 'Redacted Text',
        name: 'redactedText',
        required: false,
        width: '13vw'
    }
];

const AttributesGridHeader = () => {
    return (
        <thead>
            <tr>
                {ATTRIBUTE_COLUMNS.map((col: AttributeColumnProps, i: number) => {
                    return (
                        <th key={i} style={{whiteSpace: 'nowrap', width: col.width}}>
                            <strong>{col.label}{col.required ? ' *' : ''}</strong>
                        </th>
                    )
                })}
            </tr>
        </thead>
    )
};

class AttributesGridBody extends React.Component<AttributesGridProps, {}> {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event: React.ChangeEvent<any>) {
        const { handleFieldChange } = this.props;
        handleFieldChange(event);
    }

    render() {
        const { attributes, attributeLookups, readOnly } = this.props;
        let disabled = readOnly;
        if (attributes && attributes.length) {
            return (
                <tbody>
                    {attributes.map((attribute, i) => {
                        return (
                            <tr key={i} data-attributeId={attribute.sortOrder}>
                                {ATTRIBUTE_COLUMNS.map((col: AttributeColumnProps, j: number) => {

                                    // Only enable format for double
                                    if (col.name === 'format' && attribute.rangeURI != 'double') {
                                        disabled = true;
                                    }
                                    else {
                                        disabled = readOnly;
                                    }

                                    // Change default field based on lookup key
                                    let lookups = attributeLookups;
                                    if (col.name === 'defaultValue') {
                                        if (attribute.lookupValues !== null) {
                                            col.inputComponent = LookupKeyInput;
                                            lookups = attribute.lookupValues;
                                            // attribute.defaultValue = attribute.defaultLookups[0].value;
                                        }
                                        else {
                                            col.inputComponent = TextInput
                                        }
                                    }

                                    // Disable data type if lookup key selected
                                    if (col.name === 'rangeURI' && attribute.lookupKey && attribute.lookupKey !== '') {
                                        disabled = true;
                                        attribute[col.name] = "string";
                                    }

                                    const props = {
                                        attribute,
                                        attributeId: i,
                                        attributeLookups: lookups,
                                        disabled: col.disabled || disabled,
                                        first: i === 0,
                                        last: i === attributes.length - 1,
                                        name: `attributes_${attribute.sortOrder}_${col.name}`,
                                        onChange: this.handleChange,
                                        value: attribute[col.name],
                                        required: col.required
                                    };
                                    return (
                                        <td key={j + attribute.name}>
                                            {React.createElement(col.inputComponent, props)}
                                        </td>
                                    )
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            )
        }

        return (
            <tbody>
                <tr>
                    <td colSpan={ATTRIBUTE_COLUMNS.length}>No tokens added</td>
                </tr>
            </tbody>
        );
    }
}

interface AttributesGridProps {
    attributes: Array<PropertyDescriptor>
    attributeLookups?: Array<{label: string, value: string}>
    handleFieldChange?: (evt) => void
    narrative: string
    readOnly?: boolean
}

export class Attributes extends React.Component<AttributesGridProps, {}> {
    render() {
        const { attributes, attributeLookups, handleFieldChange, narrative, readOnly } = this.props;

        return (
            <div>
                <table className='table table-striped table-bordered'>
                    <AttributesGridHeader/>
                    <AttributesGridBody
                        attributes={attributes}
                        attributeLookups={attributeLookups}
                        handleFieldChange={handleFieldChange}
                        narrative={narrative}
                        readOnly={readOnly}/>
                </table>
            </div>
        )
    }
}

