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
import { Button, ControlLabel } from 'react-bootstrap'
import { connect } from 'react-redux';
import { Dispatch } from 'redux'

import {ProjectAssignedPackageModel, ProjectModel} from '../../Wizards/Projects/model'
import { IdInput } from '../../../components/Form/IdInput'
import { TextArea } from '../../../components/Form/TextArea'
import { ExtraFields} from '../../../components/Form/ExtraFields'
import {SuperPackageForm} from "../../SuperPackages/Forms/SuperPackageForm";
import {AssignedPackageModel} from "../../SuperPackages/model";
import {NumericInput} from "../../../components/Form/NumericInput";
import {DatePicker} from "../../../components/Form/DatePicker";
import {getRevisionId, queryProjectSubPackageDetails} from "../../Wizards/Projects/actions";
import {VIEW_TYPES} from "../../App/constants";

export interface ProjectButtonListProps {
    action: string
    disabled?: boolean
    id: string
    label: string
    type: string
}
export const ProjectFormButtons: Array<ProjectButtonListProps> = [
    {
        action:  'saveDraft',
        id: 'saveAsDraft',
        label: 'Save as Draft',
        type: 'submit'
    },
    {
        action: 'submitReview',
        id: 'submitReview',
        disabled: true,
        label: 'Submit for Review',
        type: 'submit'
    },
    {
        action: 'save',
        id: 'save',
        label: 'Save',
        type: 'submit'
    },
];

interface ProjectFormOwnProps {
    handleCancel?: () => void
    handleFieldChange?: (name: string, value: any) => void
    handleFormSubmit?: any
    handleFullNarrative?: (model: AssignedPackageModel, shouldQuery: boolean) => void
    handleWarning?: (warning?: string) => void
    handleRevisedValues?: () => void
    isValid?: boolean
    model?: ProjectModel
    parseAttributes?: () => void
    view?: VIEW_TYPES
}

interface ProjectFormState {
    dispatch?: Dispatch<any>
}

interface ProjectFormStateProps {
    selectedSubPackage?: AssignedPackageModel
}

export type ProjectFormProps = ProjectFormOwnProps & ProjectFormState;

export class ProjectFormImpl extends React.Component<ProjectFormProps, ProjectFormStateProps> {

    constructor(props?: ProjectFormProps) {
        super(props);

        this.state = {
            selectedSubPackage: undefined
        };

        this.handleCancel = this.handleCancel.bind(this);
        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.handleAssignedPackageAdd = this.handleAssignedPackageAdd.bind(this);
        this.handleAssignedPackageRemove = this.handleAssignedPackageRemove.bind(this);
        this.submit = this.submit.bind(this);
    }

    handleButtonAction(action: string) {
        switch (action) {
            case 'cancel':
                this.handleCancel();
                break;

            case 'saveDraft':
                this.submit(false);
                break;

            case 'submitReview':
                break;

            case 'save':
                this.submit(true);
                break;

            default:
                return false;
        }
    }

    handleCancel() {
        this.props.handleCancel();
    }

    handleFieldChange(event: React.ChangeEvent<any>) {
        const { handleFieldChange } = this.props;
        const name = event.currentTarget.name;
        let value = event.currentTarget.value;

        if (event.currentTarget.type === 'checkbox')
            value = event.currentTarget.checked;

        if (event.currentTarget.type === 'date' && event.currentTarget.value === '')
            value = undefined;

        handleFieldChange(name, value);
    }

    handleAssignedPackageAdd(assignedSuperPackage: AssignedPackageModel) {
        const { dispatch, model, handleFieldChange, handleWarning } = this.props;
        const { pkgId, description, narrative, repeatable, superPkgId } = assignedSuperPackage;

        if (!repeatable) {
            // if the added package cannot be repeated and is already in the assigned packages array, emit warning
            const canAdd = model.subPackages.every((superPkg) => {
                return superPkg.pkgId !== pkgId;
            });

            if (!canAdd) {
                return handleWarning(['Package', pkgId, 'is not repeatable.'].join(' '));
            }
        }

        // create a new AssignedPackageModel object as the SuperPkgId needs to be undefined as it will be set on save/submit
        let newAssignedSuperPackage = new ProjectAssignedPackageModel({
                pkgId, description, narrative, repeatable, superPkgId, active: true, showActive: true, required: false, sortOrder: model.subPackages.length});
        newAssignedSuperPackage.loadingSubpackages = true;

        handleFieldChange('subPackages', model.subPackages.concat([newAssignedSuperPackage]));
        this.setState({selectedSubPackage: newAssignedSuperPackage});

        dispatch(queryProjectSubPackageDetails(pkgId, getRevisionId(model)));
    }

    handleAssignedPackageRemove(assignedSuperPackage: AssignedPackageModel) {
        const { handleFieldChange } = this.props;
        handleFieldChange('subPackages', this.getNonmatchingSubpackages(assignedSuperPackage));
    }

    getNonmatchingSubpackages(assignedSuperPackage: AssignedPackageModel) {
        const { model } = this.props;

        // use the generated altId to match as that will be unique for
        // both previously existing and newly added assigned packages
        return model.subPackages.filter((subPackage) => {
            return subPackage.altId != assignedSuperPackage.altId;
        });
    }

    renderButtons() {
        const { isValid, view } = this.props;

        if (view !== VIEW_TYPES.PROJECT_VIEW) {
            return (
                <div className="btn-group pull-right">
                    <Button
                        id='cancelButton'
                        onClick={() => this.handleButtonAction('cancel')}>
                        Cancel
                    </Button>
                    {ProjectFormButtons.map((button: ProjectButtonListProps, i: number) => {
                        return (
                            <Button
                                id={button.id}
                                disabled={button.disabled === true || !isValid}
                                key={i}
                                onClick={() => this.handleButtonAction(button.action)}>
                                {button.label}
                            </Button>
                        );
                    })}
                </div>
            );
        }
    }

    renderExtraFields(perRow: number, index: number, displayCols: number) {
        const { model } = this.props;

        if (model) {
            const { extraFields } = model;
            return <ExtraFields
                key={"extra_fields_" + index}
                extraFields={extraFields}
                disabled={false}
                handleFieldChange={this.handleFieldChange}
                perRow={perRow}
                index={index}
                displayCols={displayCols}
            />
        }

        return null;
    }

    renderOverflowExtraFields(start) {
        const { model } = this.props;
        const perRow = 6;
        const displayCols = 2;

        let fieldRows = [];

        if (model) {
            const { extraFields } = model;
            const overFlowCount = extraFields.length - start;

            let rows = Math.floor(overFlowCount / perRow) + 1;
            for (var i=0; i<rows; i++) {
                fieldRows.push( this.renderExtraFields(perRow, start + (perRow * i), displayCols));
            }
        }

        return fieldRows;
    }

    submit(active: boolean = false) {
        const { handleFormSubmit } = this.props;
        handleFormSubmit(active);
    }

    render() {
        const { handleFieldChange, handleWarning, handleFullNarrative, model, view } = this.props;
        const disabled = view === VIEW_TYPES.PROJECT_VIEW ||
            (view === VIEW_TYPES.PROJECT_EDIT && model.hasEvent);

        return (
            <div>
                <form>
                    <div className="row clearfix">
                        <div className="col-xs-6" style={{height: '156px'}}>
                            <div className="row clearfix">
                                <div className="col-xs-4">
                                    <ControlLabel htmlFor='projectId'>Project Id</ControlLabel>
                                </div>
                                <div className="col-xs-4">
                                    <ControlLabel htmlFor='revisionNum'>Revision Number</ControlLabel>
                                </div>
                                <div className="col-xs-4">
                                    <ControlLabel htmlFor='referenceId'>Reference Id*</ControlLabel>
                                </div>
                            </div>
                            <div className="row clearfix">
                                <div className="col-xs-4">
                                    <IdInput
                                        name='projectId'
                                        onChange={handleFieldChange}
                                        value={model.projectId}
                                        view={view}/>
                                </div>
                                <div className="col-xs-4">
                                    <IdInput
                                        name='revisionNum'
                                        onChange={handleFieldChange}
                                        value={model.revisionNum}
                                        view={view}/>
                                </div>
                                <div className="col-xs-4">
                                    <NumericInput
                                        disabled={disabled}
                                        name='referenceId'
                                        onChange={this.handleFieldChange}
                                        required={true}
                                        value={model.referenceId}/>
                                </div>
                            </div>
                            <div className="row clearfix margin-top">
                                <div className="col-xs-6">
                                    <ControlLabel htmlFor='startDate'>Start Date*</ControlLabel>
                                </div>
                                <div className="col-xs-6">
                                    <ControlLabel htmlFor='endDate'>End Date</ControlLabel>
                                </div>
                            </div>
                            <div className="row clearfix">
                                <div className="col-xs-6">
                                    <DatePicker
                                        name='startDate'
                                        onChange={this.handleFieldChange}
                                        value={model.startDate}
                                        required={true}
                                        disabled={false}/>
                                </div>
                                <div className="col-xs-6">
                                    <DatePicker
                                        name='endDate'
                                        onChange={this.handleFieldChange}
                                        value={model.endDate}
                                        required={false}
                                        disabled={false}/>
                                </div>
                            </div>
                            <div className="margin-top">
                                    {this.renderExtraFields(3, 0, 4)}
                            </div>
                        </div>
                        <div className="col-xs-6">
                            <div className="row clearfix">
                                <div className="col-xs-12">
                                    <ControlLabel htmlFor='description'>Description*</ControlLabel>
                                </div>
                            </div>
                            <div className="row clearfix">
                                <div className="col-xs-12">
                                    <TextArea
                                        disabled={false}
                                        name='description'
                                        onChange={this.handleFieldChange}
                                        required={true}
                                        rows={7}
                                        value={model.description}/>
                                </div>
                            </div >
                        </div>
                        <div className="clearfix col-xs-12" style={{marginRight:'15px'}}>
                            {this.renderOverflowExtraFields(3)}
                        </div>
                    </div>
                    <div style={{borderBottom: '1px solid black', paddingTop: '15px'}}/>

                    <SuperPackageForm
                        model={model}
                        view={view}
                        handleFieldChange={handleFieldChange}
                        handleWarning={handleWarning}
                        handleAssignedPackageAdd={this.handleAssignedPackageAdd}
                        handleAssignedPackageRemove={this.handleAssignedPackageRemove}
                        handleAssignedPackageRequired={null}
                        handleAssignedPackageReorder={null}
                        handleFullNarrative={handleFullNarrative}
                        showActive={true}
                        showRequired={false}
                    />

                    <div className="row clearfix">
                        <div className="col-xs-12 margin-top">
                            {this.renderButtons()}
                        </div>
                    </div>
                </form>
            </div>
        )
    }
}

export const ProjectForm: any = connect()(ProjectFormImpl as any); // fix typing