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
import { connect } from 'react-redux';
import { Dispatch } from 'redux'

import {AssignedPackageModel} from '../model';
import {PackageModel} from "../../Wizards/Packages/model";
import {ProjectModel} from "../../Wizards/Projects/model";
import {QuerySearch} from "../../../query/QuerySearch";
import {SUPERPKG_REQUIRED_COLUMNS, TOPLEVEL_SUPER_PKG_SQ} from "../constants";
import {SuperPackageViewer} from "./SuperPackageViewer";
import {SubpackageViewer} from "./SubpackageViewer";
import {ControlLabel, ListGroupItem} from "react-bootstrap";
import {VIEW_TYPES} from "../../App/constants";
import {toggleSubpackageActive} from "../../Wizards/Projects/actions";

interface SuperPackageFormOwnProps {
    handleFieldChange?: (name: string, value: any) => void
    handleAssignedPackageAdd: (assignedPackage: AssignedPackageModel) => void
    handleAssignedPackageRemove: (assignedPackage: AssignedPackageModel) => any
    handleAssignedPackageRequired: (assignedPackage: AssignedPackageModel) => any
    handleAssignedPackageReorder: (assignedPackage: AssignedPackageModel, moveUp: boolean) => any
    handleFullNarrative?: (model: AssignedPackageModel, shouldQuery: boolean) => void
    handleWarning?: (warning?: string) => void
    model?: ProjectModel | PackageModel
    showActive: boolean
    showRequired: boolean
    view?: VIEW_TYPES
}

interface SuperPackageFormState {
    dispatch?: Dispatch<any>
}

interface SuperPackageFormStateProps {
    selectedSubPackage?: AssignedPackageModel
}

type SuperPackageFormProps = SuperPackageFormOwnProps & SuperPackageFormState;



export class SuperPackageFormImpl extends React.Component<SuperPackageFormProps, SuperPackageFormStateProps>
{

    constructor(props?: SuperPackageFormProps) {
        super(props);

        this.state = {
            selectedSubPackage: undefined
        };

        this.handleAssignedPackageClick = this.handleAssignedPackageClick.bind(this);
        this.handleToggleActiveAction = this.handleToggleActiveAction.bind(this);
    }

    handleAssignedPackageClick(assignedPackage: AssignedPackageModel) {
        let {selectedSubPackage} = this.state;

        let idProp = assignedPackage.superPkgId ? 'superPkgId' : 'altId';

        if (selectedSubPackage == undefined || selectedSubPackage[idProp] != assignedPackage[idProp]) {
            this.setState({selectedSubPackage: assignedPackage});
        }
        else {
            this.setState({selectedSubPackage: undefined});
        }
    }

    handleToggleActiveAction(subpackage: AssignedPackageModel) {
        const { dispatch, model, view } = this.props;

        dispatch(toggleSubpackageActive(subpackage, model, view));
    }

    render()
    {
        const {model, view, handleAssignedPackageAdd, handleAssignedPackageRemove, handleAssignedPackageReorder,
            handleFullNarrative, handleAssignedPackageRequired, showActive, showRequired} = this.props;
        const {selectedSubPackage} = this.state;
        const isReadyOnly = (view === VIEW_TYPES.PROJECT_VIEW || view === VIEW_TYPES.PACKAGE_VIEW
            || (view === VIEW_TYPES.PACKAGE_EDIT && model.hasEvent));
        const isPackageView = (view === VIEW_TYPES.PACKAGE_VIEW || view === VIEW_TYPES.PACKAGE_NEW || view === VIEW_TYPES.PACKAGE_EDIT || view === VIEW_TYPES.PACKAGE_CLONE);

        return (
            <div className="row clearfix">
                {!isReadyOnly ?
                    <div className="col-xs-6">
                        <div className="row clearfix col-xs-12 margin-top">
                            <ControlLabel>Available Packages</ControlLabel>
                        </div>
                        <div className="row col-xs-12">
                            <QuerySearch
                                id='superPackageViewer'
                                modelProps={{requiredColumns: SUPERPKG_REQUIRED_COLUMNS.TOP_LEVEL_SUPER_PKG}}
                                schemaQuery={TOPLEVEL_SUPER_PKG_SQ}>
                                <SuperPackageViewer
                                    schemaQuery={TOPLEVEL_SUPER_PKG_SQ}
                                    handleAssignedPackageAdd={handleAssignedPackageAdd}
                                    handleFullNarrative={handleFullNarrative}
                                    view={view}/>
                            </QuerySearch>
                        </div>
                    </div>
                    : null
                }
                <div className={isReadyOnly ? "col-xs-12" : "col-xs-6"}>
                    <div className="row clearfix col-xs-12 margin-top"><div className="col-xs-8" style={{paddingLeft:0}}>Assigned Packages</div>
                        <div className="col-xs-4 text-right">{isPackageView ?<span style={{fontSize:10}}>(Bold packages are required)</span>: null}</div></div>
                    <div className="row clearfix col-xs-12 assigned_packages">
                        <SubpackageViewer
                            subPackages={model.subPackages}
                            selectedSubPackage={selectedSubPackage}
                            handleAssignedPackageRemove={handleAssignedPackageRemove}
                            handleAssignedPackageReorder={handleAssignedPackageReorder}
                            handleRowClick={this.handleAssignedPackageClick}
                            handleToggleActiveAction={this.handleToggleActiveAction}
                            handleAssignedPackageRequired={handleAssignedPackageRequired}
                            handleFullNarrative={handleFullNarrative}
                            showActive={showActive}
                            showRequired={showRequired}
                            isReadOnly={isReadyOnly}
                            view={view}/>
                    </div>
                    <div className="row clearfix col-xs-12 margin-top assigned_package_narrative">
                        <ListGroupItem className="data-search__container" style={{height: '90px', overflowY: 'auto'}}>
                            <div className="data-search__row">
                                {selectedSubPackage != undefined
                                    ? selectedSubPackage.narrative
                                    : <div className="narrative-none">
                                        Select a package to view its narrative.
                                    </div>
                                }
                            </div>
                        </ListGroupItem>
                    </div>
                </div>
            </div>
        );
    }
}

export const SuperPackageForm = connect<any, any, SuperPackageFormProps>(null)(SuperPackageFormImpl);