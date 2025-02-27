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
import { ListGroupItem } from 'react-bootstrap'

import { LabKeyQueryRowPropertyProps } from '../../query/model'

// Results
interface CategoriesSelectResultsProps {
    data?: {[key: string]: LabKeyQueryRowPropertyProps}
    dataIds?: Array<number>
    disabled?: boolean
    handleSelect?: (id: number) => any
    focused?: boolean
    selected?: Array<number>
}

export class CategoriesSelectResults extends React.Component<CategoriesSelectResultsProps, any> {

    renderSelected() {
        const { data, selected } = this.props;
        if (selected && selected.length) {
            return (
                <div>
                    {selected.map((id, i) => {
                        return (
                            <ListGroupItem
                                className={"data-search__row_" + id + i}
                                key={['selected_data', id, i].join('_')}
                                onClick={() => this.props.handleSelect(id)}>
                                <div>
                                    {[data[id]['CategoryId'].value, data[id]['Description'].value].join(' ')}
                                    <span>
                                        &nbsp;<i className="fa fa-check"/>
                                    </span>
                                </div>
                            </ListGroupItem>
                        )
                    })}
                    <div style={{borderBottom: '3px solid black'}}/>
                </div>
            )
        }

        return null;
    }

    renderSelectedCondensed() {
        const { data, disabled, selected } = this.props;

        let text;
        if (selected && selected.length) {
            text = selected.map((id) => {
                return [data[id]['CategoryId'].value, data[id]['Description'].value].join('-');
            }).join(', ');

        }
        else {
            text = 'No categories assigned'
        }
        // todo: disabled version will show white block where '...' would be, need to figure out dynamic background color
        return (
            <div
                style={{
                    background: disabled ? '#eee' : '',
                    border: '1px solid #ddd',
                    height: '82px',
                    maxHeight: '525px'
                }}
                title={text}>
                <div
                    className={"data-search__row_selected"}
                    style={{padding: '10px 15px'}}>
                    <div className={disabled ? 'disabled__block-with-text' : 'block-with-text'}>
                        {text}
                    </div>
                    <span/>
                </div>
            </div>
        )

    }

    renderOptions() {
        const { data, dataIds } = this.props;

        if (data && dataIds.length) {
            return (
                <div>
                    {dataIds.map((id, i) => {
                        return (
                            <ListGroupItem
                                className={"data-search__row_" + id}
                                key={['data_option', id, i].join('_')}
                                onClick={() => this.props.handleSelect(id)}>
                                <div>
                                    {[data[id]['CategoryId'].value, data[id]['Description'].value].join(' ')}
                                </div>
                                <span/>
                            </ListGroupItem>
                        )
                    })}
                </div>

            )
        }

        return (
            <ListGroupItem className="data-search__container">
                <div className="data-search__row">
                    No results found
                </div>
            </ListGroupItem>
        )
    }

    render() {
        const { focused } = this.props;

        if (focused) {
            return (
                <div className='col-xs-12 clearfix data-search__container' style={{position: 'relative'}}>
                    <div style={{position: 'absolute', zIndex: 1000, left: 15, top: 0, right: 15}}>
                        {this.renderSelected()}
                        {this.renderOptions()}
                    </div>
                </div>
            )
        }

        return (
            <div className='col-xs-12 clearfix data-search__container' style={{position: 'relative'}}>
                {this.renderSelectedCondensed()}
            </div>
        )
    }
}