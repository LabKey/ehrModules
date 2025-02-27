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

import { QueryPackageModel } from '../../containers/Packages/model'
import { PackageRow } from './PackageRow'

interface PackageSearchResultsProps {
    data: {[key: string]: QueryPackageModel}
    dataIds: Array<number>
    isLoaded: boolean
    handleDelete?: (rowId) => any
}

export class PackageSearchResults extends React.Component<PackageSearchResultsProps, any> {

    static defaultProps: PackageSearchResultsProps = {
        data: {},
        dataIds: [],
        isLoaded: false
    };

    render() {
        const { data, dataIds, isLoaded, handleDelete } = this.props;

        if (isLoaded && data && dataIds.length) {
            return (
                <div className="data-search__container">
                    {dataIds.map((d, i) => {
                        const rowData: QueryPackageModel = data[d];
                        return (
                            <div key={'data-search__row' + i}>
                                <PackageRow data={rowData} dataId={d} handleDelete={handleDelete}/>
                            </div>
                        )
                    })}
                </div>
            )
        }
        else if (isLoaded && dataIds.length === 0) {
            return (
                <div className="data-search__container">
                    <div className="data-search__row">
                        No results found
                    </div>
                </div>
            )
        }

        return null;
    }
}