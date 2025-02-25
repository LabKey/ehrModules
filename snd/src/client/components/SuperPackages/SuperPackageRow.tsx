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
import { DropdownButton, MenuItem, OverlayTrigger } from 'react-bootstrap'
import {AssignedPackageModel} from "../../containers/SuperPackages/model";
import {VIEW_TYPES} from "../../containers/App/constants";

interface SuperPackageRowProps {
    model: AssignedPackageModel
    selected?: boolean
    handleMenuReorderAction?: (model: AssignedPackageModel, moveUp: boolean) => any
    handleIconClick?: (model: AssignedPackageModel) => any
    handleRowClick?: (model: AssignedPackageModel) => any
    menuActionName?: string
    handleMenuAction?: (model: AssignedPackageModel) => any
    handleAssignedPackageRequired?: (model: AssignedPackageModel) => any
    handleFullNarrative?: (model: AssignedPackageModel) => void
    handleToggleActiveAction?: (subpackage: AssignedPackageModel) => void
    treeLevel?: number
    treeArrIndex?: number
    treeArrLength?: number
    treeCollapsed?: boolean
    showActive?: boolean
    showRequired?: boolean
    isReadOnly?: boolean
    parentActive?: boolean
    view?: VIEW_TYPES
}

interface SuperPackageRowStateProps {
    isHover: boolean
    isDropup: boolean
}

export class SuperPackageRow extends React.Component<SuperPackageRowProps, SuperPackageRowStateProps> {

    constructor(props: SuperPackageRowProps) {
        super(props);

        this.state = {
            isHover: false,
            isDropup: false
        };

        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.handleOnClick = this.handleOnClick.bind(this);
    }

    handleMouseEnter(e) {
        // use dropup for bottom half of the container
        const target = jQuery(e.target);
        const containerHeight = target.closest('.data-search__container').height();
        const isDropup = target.position().top > (containerHeight / 2);

        this.setState({isHover: true, isDropup});
    }

    handleMouseLeave() {
        this.setState({isHover: false, isDropup: false});
    }

    handleOnClick(evnt) {
        const { model, handleIconClick, handleRowClick } = this.props;
        let iconClick = evnt.target.getAttribute('class') && evnt.target.getAttribute('class').indexOf('icon-tree-toggle') > -1;

        if (!iconClick && handleRowClick) {
            handleRowClick(model);
        }

        if (iconClick && handleIconClick) {
            handleIconClick(model);
        }
    }

    render() {
        const {
            model, selected, treeLevel, treeArrIndex, treeArrLength, treeCollapsed, showActive, handleToggleActiveAction, isReadOnly,
            menuActionName, handleMenuAction, handleMenuReorderAction, handleFullNarrative, handleAssignedPackageRequired, parentActive, showRequired
        } = this.props;
        const { isHover, isDropup } = this.state;
        const treeLevelVal = treeLevel == undefined ? -1 : treeLevel;
        const treeCollapsedVal = treeCollapsed != undefined && treeCollapsed;
        const indentPx = treeLevel == undefined ? 0 : treeLevelVal * 15;

        // boolean to indicate if the reorder up/down menu items should be shown
        const showMoveUp = !isReadOnly && handleMenuReorderAction && treeArrIndex != undefined && treeArrIndex > 0;
        const showMoveDown = !isReadOnly && handleMenuReorderAction && treeArrIndex != undefined && treeArrLength != undefined && treeArrIndex < (treeArrLength - 1);
        const showActiveToggle = !isReadOnly && handleToggleActiveAction && treeLevelVal === 0 && showActive;
        const showRequiredToggle = !isReadOnly && handleAssignedPackageRequired && treeLevelVal === 0 && showRequired;

        let notActiveDivStyle = {
            textDecoration: 'line-through'
        };

        return (

            <div
                className={"superpackage_viewer__result clearfix superpackage-row" + (selected ? ' superpackage-selected-row' : '')}
                onMouseEnter={this.handleMouseEnter}
                onMouseLeave={this.handleMouseLeave}
                onClick={this.handleOnClick}
            >
                <div className="pull-left" style={{marginLeft: indentPx + 'px'}}>
                    {treeLevelVal > -1
                        ? model.loadingSubpackages != undefined && model.loadingSubpackages === true
                            ? <i className="fa fa-spinner fa-spin">&nbsp;</i>
                            : !treeCollapsedVal && model.subPackages.length > 0
                                ? <i className="icon-tree-toggle fa fa-caret-down">&nbsp;</i>
                                : model.subPackages.length == 0
                                    ? <i className={"icon-tree-toggle fa fa-circle superpackage-row-leaf"}>&nbsp;&nbsp;&nbsp;</i>
                                    : <i className="icon-tree-toggle fa fa-caret-right">&nbsp;</i>
                        : null
                    }
                    {/*Display package id and name. If in project view, cross out inactive subpackages and their descendants. If in package
                    view, bold the subpackages that are required.*/}
                    <span style={(showActiveToggle && !model.active) || (showActive && !parentActive) ? notActiveDivStyle :
                        (showRequired && model.required) ? {fontWeight:'bold'} : null}>{[model.pkgId, model.description].join(' - ')}&nbsp;</span>
                </div>
                <div className="superpackage-row-dropdown" style={{display: isHover ? 'inline-block' : 'none'}}>
                    <DropdownButton id="superpackage-actions" title="" pullRight dropup={isDropup}
                                    className="superpackage-row-option-btn">
                        {showActiveToggle
                            ? <MenuItem onClick={() => handleToggleActiveAction(model)}>{model.active?'Deactivate':'Activate'}</MenuItem>
                            : null
                        }
                        {!isReadOnly && menuActionName
                            ? <MenuItem onClick={() => handleMenuAction(model)}>{menuActionName}</MenuItem>
                            : null
                        }
                        {showRequiredToggle
                            ? <MenuItem onClick={() => handleAssignedPackageRequired(model)}>{model.required?'Make Optional':'Make Required'}</MenuItem>
                            : null
                        }
                        {showMoveUp
                            ? <MenuItem onClick={() => handleMenuReorderAction(model, true)}>Move Up</MenuItem>
                            : null
                        }
                        {showMoveDown
                            ? <MenuItem onClick={() => handleMenuReorderAction(model, false)}>Move Down</MenuItem>
                            : null
                        }

                        <MenuItem onClick={() => handleFullNarrative(model)}>View Full Narrative</MenuItem>
                        {/*<MenuItem disabled>Packages Using</MenuItem>*/}
                        {/*<MenuItem disabled>Projects Using</MenuItem>*/}
                    </DropdownButton>
                </div>
            </div>
        )
    }
}
