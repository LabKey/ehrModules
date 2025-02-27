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
import { ListGroupItem } from 'react-bootstrap'

import { QueryModel, SchemaQuery } from '../../../query/model'
import { SuperPackageSearchResults } from "../../../components/SuperPackages/SuperPackageSearchResults";
import { SearchInput } from "../../../components/Search/SearchInput";
import {AssignedPackageModel} from "../model";
import {VIEW_TYPES} from "../../App/constants";

interface SuperPackageViewerOwnProps {
    schemaQuery: SchemaQuery
    handleAssignedPackageAdd: (assignedPackage: AssignedPackageModel) => void
    handleFullNarrative: (model: AssignedPackageModel, shouldQuery: boolean) => void
    model?: QueryModel
    view: VIEW_TYPES
}

interface SuperPackageViewerStateProps {
    input?: string
    primitivesOnly?: boolean
    filteredIds?: Array<number>
}

type SuperPackageViewerProps = SuperPackageViewerOwnProps;

export class SuperPackageViewer extends React.Component<SuperPackageViewerProps, SuperPackageViewerStateProps> {

    private timer: number = 0;
    private inputRef: HTMLInputElement;

    constructor(props: SuperPackageViewerProps) {
        super(props);

        this.state = {
            input: '',
            primitivesOnly: false,
            filteredIds: undefined
        };

        this.handleClear = this.handleClear.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleAssignedFullNarrative = this.handleAssignedFullNarrative.bind(this);
        this.togglePrimitivesOnly = this.togglePrimitivesOnly.bind(this);
    }

    handleClear() {
        this.setInput('');
        this.setFilteredIds(undefined);
        this.inputRef.focus();
    }

    handleInputChange(evt: React.ChangeEvent<HTMLInputElement>) {
        const input = evt.currentTarget.value;

        this.setInput(input);

        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.timer = null;
            this.updateFilterIds();
        }, 50);
    }

    handleAssignedFullNarrative(model: AssignedPackageModel) {
        const { handleFullNarrative } = this.props;
        handleFullNarrative(model, true);
    }

    togglePrimitivesOnly() {
        const { primitivesOnly } = this.state;
        this.setState({primitivesOnly: !primitivesOnly});
    }

    updateFilterIds() {
        const { model } = this.props;
        const { input } = this.state;
        let filterIds: Array<number>;

        if (model != undefined && Array.isArray(model.dataIds) && model.data) {
            filterIds =  model.dataIds.filter((id: number) => {
                const superPkg: any = model.data[id]; // TODO: why doesn't QuerySuperPackageModel work instead of any?

                if (superPkg) {
                    return (
                            superPkg.PkgId &&
                            superPkg.PkgId.displayValue.toLowerCase().indexOf(input.toLowerCase()) !== -1
                        ) || (
                            superPkg.PkgId &&
                            superPkg.PkgId.value.toString().indexOf(input) !== -1
                        )
                }
           });
        }

        this.setFilteredIds(filterIds);
    }

    setInput(input: string) {
        this.setState({input});
    }

    setFilteredIds(filteredIds: Array<number>) {
        this.setState({filteredIds});
    }

    render() {
        const { model, handleAssignedPackageAdd, view } = this.props;
        const { input, filteredIds, primitivesOnly } = this.state;

        if (model != undefined && model.data != undefined) {
            return (
                <div>
                    <ListGroupItem className="col-xs-12">
                        <SearchInput
                            inputRef={(el) => this.inputRef = el}
                            input={input}
                            handleClear={this.handleClear}
                            handleInputChange={this.handleInputChange}
                            name="packageSearch"
                            wrapperClassName="col-xs-8"/>
                        <div className="col-xs-4" onClick={this.togglePrimitivesOnly}>
                            <input type="checkbox" style={{marginTop: '10px'}}/> Primitives only
                        </div>
                    </ListGroupItem>
                    <SuperPackageSearchResults
                        data={model.data}
                        dataIds={Array.isArray(filteredIds) ? filteredIds : model.dataIds}
                        primitivesOnly={primitivesOnly}
                        isLoaded={model.isLoaded}
                        handleAssignedPackageAdd={handleAssignedPackageAdd}
                        handleFullNarrative={this.handleAssignedFullNarrative}
                        view={view}
                    />
                </div>
            )
        }

        return (
            <ListGroupItem className="data-search__container" style={{height: '250px'}}>
                <div className="data-search__row">
                    Loading...
                </div>
            </ListGroupItem>
        )
    }
}
