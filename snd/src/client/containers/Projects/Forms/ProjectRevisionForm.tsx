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

import {ProjectButtonListProps, ProjectFormButtons, ProjectFormProps} from "./ProjectForm";
import {IdInput} from "../../../components/Form/IdInput";
import {NumericInput} from "../../../components/Form/NumericInput";
import {DatePicker} from "../../../components/Form/DatePicker";
import {ExtraFields} from "../../../components/Form/ExtraFields";
import {TextArea} from "../../../components/Form/TextArea";
import {VIEW_TYPES} from "../../App/constants";
import {CheckboxInput} from "../../../components/Form/Checkbox";
import {ProjectModel} from "../../Wizards/Projects/model";

export class ProjectRevisionFormImpl extends React.Component<ProjectFormProps> {

    private oldModel: ProjectModel = null;

    constructor(props?: ProjectFormProps) {
        super(props);

        this.oldModel = props.model;

        this.handleCancel = this.handleCancel.bind(this);
        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.submit = this.submit.bind(this);
    }

    componentWillMount() {
        this.props.handleRevisedValues();
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

    renderExtraFields(revisedFields: boolean, perRow: number, index: number, displayCols: number) {
        const { model } = this.props;

        if (model) {
            const { extraFields } = model;
            return <div key={"extra_fields_" + index}>
            <ExtraFields
                key={"extra_fields_" + index}
                extraFields={extraFields}
                revisedFields={revisedFields}
                handleFieldChange={this.handleFieldChange}
                perRow={perRow}
                index={index}
                displayCols={displayCols}
            />
            </div>
        }

        return null;
    }

    renderOverflowExtraFields(start: number, revised: boolean) {
        const { model } = this.props;
        const perRow = 6;
        const displayCols = 2;

        let fieldRows = [];

        if (model) {
            const { extraFields } = model;
            const overFlowCount = extraFields.length - start;

            let rows = Math.floor(overFlowCount / perRow) + 1;
            for (var i=0; i<rows; i++) {
                fieldRows.push( this.renderExtraFields(revised, perRow, start + (perRow * i), displayCols));
            }
        }

        return fieldRows;
    }

    submit(active: boolean = false) {
        const { handleFormSubmit } = this.props;
        handleFormSubmit(active);
    }

    render() {
        const { model, view } = this.props;

        return (
            <div>
                <form>
                    <div style={{marginBottom: '20px', marginTop: '-15px'}}><h4>New Revision</h4></div>
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
                                        onChange={this.handleFieldChange}
                                        value={model.projectId}
                                        view={view}/>
                                </div>
                                <div className="col-xs-4">
                                    <IdInput
                                        name='revisionNum'
                                        onChange={this.handleFieldChange}
                                        value={model.revisionNum + 1}
                                        view={view}/>
                                </div>
                                <div className="col-xs-4">
                                    <NumericInput
                                        disabled={false}
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
                                {this.renderExtraFields(false, 3, 0, 4)}
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
                                        required
                                        rows={7}
                                        value={model.description}/>
                                </div>
                            </div>
                        </div>
                        <div className="clearfix col-xs-12"  style={{paddingLeft: '15px', marginBottom: '10px', marginRight:'15px'}}>
                            {this.renderOverflowExtraFields(3, false)}
                        </div>
                        <div className="clearfix col-xs-12">
                            <div className="col-xs-6" />
                            <div className="col-xs-6" >
                                <CheckboxInput
                                    disabled={false}
                                    required={false}
                                    value={false}
                                    onChange={this.handleFieldChange}
                                    name='copyRevisedPkgs'
                                />
                                Copy assigned packages from revision {this.oldModel.revisionNum}
                            </div>
                        </div>
                    </div>
                    <div style={{marginTop: '10px'}}/>
                    <div style={{backgroundColor: '#EEEEEE'}}>
                        <div style={{borderTop: '1px solid #DDDDDD', paddingBottom: '15px', paddingTop: '5px', paddingLeft: '15px', marginLeft: '-15px', marginRight: '-15px', backgroundColor: '#EEEEEE'}}>
                            <h4>Previous Revision</h4></div>
                        <div style={{borderBottom: '1px solid #DDDDDD', backgroundColor: '#EEEEEE'}} className="row clearfix">
                            <div className="col-xs-6" style={{height: '156px'}}>
                                <div className="row clearfix">
                                    <div className="col-xs-4">
                                        <ControlLabel htmlFor='projectIdOld'>Project Id</ControlLabel>
                                    </div>
                                    <div className="col-xs-4">
                                        <ControlLabel htmlFor='revisionNumOld'>Revision Number</ControlLabel>
                                    </div>
                                    <div className="col-xs-4">
                                        <ControlLabel htmlFor='referenceIdOld'>Reference Id*</ControlLabel>
                                    </div>
                                </div>
                                <div className="row clearfix">
                                    <div className="col-xs-4">
                                        <IdInput
                                            name='projectIdOld'
                                            onChange={this.handleFieldChange}
                                            value={this.oldModel.projectId}
                                            view={view}/>
                                    </div>
                                    <div className="col-xs-4">
                                        <IdInput
                                            name='revisionNumOld'
                                            onChange={this.handleFieldChange}
                                            value={this.oldModel.revisionNum}
                                            view={view}/>
                                    </div>
                                    <div className="col-xs-4">
                                        <NumericInput
                                            disabled={true}
                                            name='referenceIdOld'
                                            onChange={this.handleFieldChange}
                                            required
                                            value={this.oldModel.referenceId}/>
                                    </div>
                                </div>
                                <div className="row clearfix margin-top">
                                    <div className="col-xs-6">
                                        <ControlLabel htmlFor='startDateOld'>Start Date*</ControlLabel>
                                    </div>
                                    <div className="col-xs-6">
                                        <ControlLabel htmlFor='endDateOld'>End Date</ControlLabel>
                                    </div>
                                </div>
                                <div className="row clearfix">
                                    <div className="col-xs-6">
                                        <DatePicker
                                            name='startDateOld'
                                            onChange={this.handleFieldChange}
                                            value={this.oldModel.startDate}
                                            required
                                            disabled={true}/>
                                    </div>
                                    <div className="col-xs-6">
                                        <DatePicker
                                            name='endDateRevised'
                                            onChange={this.handleFieldChange}
                                            value={model.endDateRevised}
                                            required={false}
                                            disabled={false}/>
                                    </div>
                                </div>
                                <div className="margin-top">
                                    {this.renderExtraFields(true, 3, 0, 4)}
                                </div>
                            </div>
                            <div className="col-xs-6">
                                <div className="row clearfix">
                                    <div className="col-xs-12">
                                        <ControlLabel htmlFor='descriptionOld'>Description*</ControlLabel>
                                    </div>
                                </div>
                                <div className="row clearfix">
                                    <div className="col-xs-12">
                                    <TextArea
                                        disabled={true}
                                        name='descriptionOld'
                                        onChange={this.handleFieldChange}
                                        required
                                        rows={7}
                                        value={this.oldModel.description}/>
                                    </div>
                                </div>
                            </div>
                            <div className="clearfix col-xs-12" style={{paddingLeft: '15px', marginBottom: '10px', marginRight:'15px'}}>
                                {this.renderOverflowExtraFields(3, true)}
                            </div>
                        </div>
                    </div>
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

export const ProjectRevisionForm: any = connect()(ProjectRevisionFormImpl as any);