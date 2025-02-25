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
import { connect } from 'react-redux';
import { Dispatch } from 'redux'

import { SuperPackageRow } from '../../../components/SuperPackages/SuperPackageRow'
import {AssignedPackageModel} from "../model";
import {VIEW_TYPES} from "../../App/constants";
import {toggleSubpackageActive} from "../../Wizards/Projects/actions";

interface SubpackageViewerOwnProps {
    subPackages: Array<AssignedPackageModel>
    selectedSubPackage: AssignedPackageModel
    handleAssignedPackageRemove: (assignedPackage: AssignedPackageModel) => any
    handleAssignedPackageRequired: (assignedPackage: AssignedPackageModel) => any
    handleAssignedPackageReorder: (assignedPackage: AssignedPackageModel, moveUp: boolean) => any
    handleToggleActiveAction: (assignedPackage: AssignedPackageModel) => any
    handleRowClick: (assignedPackage: AssignedPackageModel) => any
    handleFullNarrative: (model: AssignedPackageModel, shouldQuery: boolean) => void
    showActive: boolean
    showRequired: boolean
    isReadOnly: boolean
    view?: VIEW_TYPES
}

interface SubpackageViewerState {
    dispatch?: Dispatch<any>
}

interface SubpackageViewerStateProps {
    collapsed: {[key: string]: boolean}
}

type SubpackageViewerProps = SubpackageViewerOwnProps & SubpackageViewerState;

export class SubpackageViewerImpl extends React.Component<SubpackageViewerProps, SubpackageViewerStateProps> {

    constructor(props: SubpackageViewerProps) {
        super(props);

        this.state = {
            collapsed: {}
        };

        this.handleIconClick = this.handleIconClick.bind(this);
        this.handleAssignedFullNarrative = this.handleAssignedFullNarrative.bind(this);
    }

    handleIconClick(model: AssignedPackageModel) {
        let { collapsed } = this.state;

        if (model) {
            let id = this.getModelId(model);

            if (collapsed[id] != undefined) {
                collapsed[id] = !collapsed[id];
            }
            else {
                collapsed[id] = true;
            }
        }

        this.setState({collapsed});
    }

    handleAssignedFullNarrative(model: AssignedPackageModel) {
        const { handleFullNarrative } = this.props;
        handleFullNarrative(model, false);
    }

    getModelId(model: AssignedPackageModel) {
        if (model.altId == undefined) {
            model.altId = LABKEY.Utils.id();
        }

        return model.altId;
    }

    renderAssignedPackageRow(assignedPackage: AssignedPackageModel, key: string, treeLevel: number, arrIndex: number, arrLength: number, parentActive: boolean) {
        const { selectedSubPackage, handleAssignedPackageRemove, handleAssignedPackageReorder, handleRowClick, handleAssignedPackageRequired,
            handleToggleActiveAction, view, showActive, showRequired, isReadOnly } = this.props;
        const { collapsed } = this.state;
        const idProp = selectedSubPackage != undefined && selectedSubPackage.superPkgId ? 'superPkgId' : 'altId';
        const treeCollapsed = collapsed[this.getModelId(assignedPackage)] || false;
        const isTopLevelSubpackage = treeLevel == 0;

        return (
            <div key={key}>
                <SuperPackageRow
                    model={assignedPackage}
                    selected={selectedSubPackage != undefined && assignedPackage[idProp] == selectedSubPackage[idProp]}
                    menuActionName={isTopLevelSubpackage ? "Remove" : null}
                    handleMenuAction={isTopLevelSubpackage ? handleAssignedPackageRemove : null}
                    handleAssignedPackageRequired={isTopLevelSubpackage ? handleAssignedPackageRequired : null}
                    handleMenuReorderAction={isTopLevelSubpackage ? handleAssignedPackageReorder : null}
                    handleIconClick={this.handleIconClick}
                    handleRowClick={handleRowClick}
                    handleFullNarrative={this.handleAssignedFullNarrative}
                    handleToggleActiveAction={handleToggleActiveAction}
                    treeLevel={treeLevel}
                    treeArrIndex={arrIndex}
                    treeArrLength={arrLength}
                    treeCollapsed={treeCollapsed}
                    view={view}
                    parentActive={parentActive}
                    showActive={showActive}
                    showRequired={showRequired}
                    isReadOnly={isReadOnly}
                />

                {!treeCollapsed && Array.isArray(assignedPackage.subPackages) && assignedPackage.subPackages.length > 0
                    ? assignedPackage.subPackages.map((dd, ii) => {
                        return this.renderAssignedPackageRow(
                            assignedPackage.subPackages[ii], key + "-" + ii,
                            treeLevel+1, ii, assignedPackage.subPackages.length, parentActive
                        );
                    })
                    : null
                }
            </div>
        )
    }

    render() {
        const { subPackages } = this.props;

        return (
            <ListGroupItem className="data-search__container" style={{height: '150px', overflowY: 'scroll'}}>
                <div className="data-search__row">
                    {Array.isArray(subPackages) && subPackages.length > 0 ?
                        subPackages.map((d, i) => {
                            return this.renderAssignedPackageRow(subPackages[i], 'data-search__row' + i, 0, i, subPackages.length, subPackages[i].active);
                        })
                        : 'None'
                    }
                </div>
            </ListGroupItem>
        )
    }
}

export const SubpackageViewer = connect<any, any, SubpackageViewerProps>(null)(SubpackageViewerImpl);