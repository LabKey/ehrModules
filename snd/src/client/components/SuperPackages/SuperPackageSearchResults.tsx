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

import { QuerySuperPackageModel } from '../../containers/Packages/model'
import { SuperPackageRow } from './SuperPackageRow'
import {AssignedPackageModel} from "../../containers/SuperPackages/model";
import {VIEW_TYPES} from "../../containers/App/constants";

interface SuperPackageSearchResultsProps {
    data: {[key: string]: any}
    dataIds: Array<number>
    isLoaded: boolean
    primitivesOnly: boolean,
    handleAssignedPackageAdd: (assignedPackage: AssignedPackageModel) => void
    handleFullNarrative: (model: AssignedPackageModel) => void
    view: VIEW_TYPES
}

export class SuperPackageSearchResults extends React.Component<SuperPackageSearchResultsProps, any> {

    static defaultProps: SuperPackageSearchResultsProps = {
        data: {},
        dataIds: [],
        isLoaded: false,
        primitivesOnly: false,
        handleAssignedPackageAdd: undefined,
        handleFullNarrative: undefined,
        view: undefined
    };

    shouldComponentUpdate(nextProps: SuperPackageSearchResultsProps) {
        const { dataIds, isLoaded, primitivesOnly, view } = nextProps;

        return dataIds.length !== this.props.dataIds.length ||
            isLoaded !== this.props.isLoaded ||
            primitivesOnly !== this.props.primitivesOnly ||
            view !== this.props.view;
    }

    render() {
        const {
            data, dataIds, isLoaded, primitivesOnly, view,
            handleAssignedPackageAdd, handleFullNarrative
        } = this.props;

        if (isLoaded && data && Array.isArray(dataIds)) {
            return (
                <ListGroupItem className="data-search__container" style={{height: '200px', overflowY: 'scroll'}}>
                    {dataIds.length > 0 ?
                        dataIds.filter((d) => {
                            return !primitivesOnly || data[d].IsPrimitive.value === 'true';
                        }).map((d, i) => {
                            let assignedPackage = new AssignedPackageModel({
                                pkgId: data[d].PkgId.value,
                                description: data[d].PkgId.displayValue,
                                narrative: data[d].Narrative.value,
                                repeatable: data[d].Repeatable.value,
                                superPkgId: data[d].SuperPkgId.value,
                                active: true,
                                showActive: true,
                                required: false
                            });

                            return (
                                <div key={'data-search__row' + i}>
                                    <SuperPackageRow
                                        model={assignedPackage}
                                        menuActionName="Add"
                                        handleMenuAction={handleAssignedPackageAdd}
                                        handleFullNarrative={handleFullNarrative}
                                        view={view}
                                        showActive={false}
                                    />
                                </div>
                            )
                        })
                        : 'No results found'
                    }
                </ListGroupItem>
            )
        }

        return null;
    }
};