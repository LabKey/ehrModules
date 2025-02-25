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
import { Button, ControlLabel, ListGroupItem } from 'react-bootstrap'
import { connect } from 'react-redux';
import { Dispatch } from 'redux'

import { PackageModel } from '../../Wizards/Packages/model'
import { CheckboxInput } from '../../../components/Form/Checkbox'
import { IdInput } from '../../../components/Form/IdInput'
import { TextArea } from '../../../components/Form/TextArea'
import { TextInput } from '../../../components/Form/TextInput'
import { Attributes } from '../../../components/Form/Attributes'
import { ExtraFields} from '../../../components/Form/ExtraFields'
import { QuerySearch } from '../../../query/QuerySearch'
import { AssignedPackageModel } from '../../SuperPackages/model';
import { CAT_SQ, REQUIRED_COLUMNS, } from '../constants'
import { CategoriesSelect } from '../../Wizards/Packages/CategoriesSelect'
import {SuperPackageForm} from "../../SuperPackages/Forms/SuperPackageForm";
import {querySubPackageDetails} from "../../Wizards/Packages/actions";
import {VIEW_TYPES} from "../../App/constants";

interface ButtonListProps {
    action: string
    disabled?: boolean
    id: string
    label: string
    type: string
}
const buttons: Array<ButtonListProps> = [
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

interface PackageFormOwnProps {
    handleCancel?: () => void
    handleFieldChange?: (name: string, value: any) => void
    handleNarrativeChange?: (val) => void
    handleFormSubmit?: any
    handleFullNarrative?: (model: AssignedPackageModel, shouldQuery: boolean) => void
    handleWarning?: (warning?: string) => void
    isValid?: boolean
    model?: PackageModel
    parseAttributes?: () => void
    view?: VIEW_TYPES
}

interface PackageFormState {
    dispatch?: Dispatch<any>
}

interface PackageFormStateProps {
    selectedSubPackage?: AssignedPackageModel
}

type PackageFormProps = PackageFormOwnProps & PackageFormState;

export class PackageFormImpl extends React.Component<PackageFormProps, PackageFormStateProps> {

    constructor(props?: PackageFormProps) {
        super(props);



        this.handleCancel = this.handleCancel.bind(this);
        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.handleNarrativeChange = this.handleNarrativeChange.bind(this);
        this.handleAssignedPackageAdd = this.handleAssignedPackageAdd.bind(this);
        this.handleAssignedPackageRemove = this.handleAssignedPackageRemove.bind(this);
        this.handleAssignedPackageRequired = this.handleAssignedPackageRequired.bind(this);
        this.handleAssignedPackageReorder = this.handleAssignedPackageReorder.bind(this);
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
        const name = event.currentTarget.name,
            value = event.currentTarget.type === 'checkbox' ?
                event.currentTarget.checked : event.currentTarget.value;

        handleFieldChange(name, value);
    }

    handleNarrativeChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
        const { handleNarrativeChange } = this.props;
        const value = event.currentTarget.value;

        if (handleNarrativeChange && typeof handleNarrativeChange === 'function') {
            handleNarrativeChange(value);
        }
    }

    handleAssignedPackageAdd(assignedPackage: AssignedPackageModel) {
        const { dispatch, model, handleFieldChange, handleWarning } = this.props;
        const { pkgId, description, narrative, repeatable, superPkgId } = assignedPackage;

        if (!repeatable) {
            // if the added package cannot be repeated and is already in the assigned packages array, emit warning
            const canAdd = model.subPackages.every((pkg) => {
                return pkg.pkgId !== pkgId;
            });

            if (!canAdd) {
                return handleWarning(['Package', pkgId, 'is not repeatable.'].join(' '));
            }
        }

        // create a new AssignedPackageModel object as the SuperPkgId needs to be undefined as it will be set on save/submit
        let newAssignedPackage = new AssignedPackageModel({
            pkgId,
            description,
            narrative,
            repeatable,
            superPkgId,
            active: false,
            showActive: false,
            required: false,
            sortOrder: model.subPackages.length
        });
        newAssignedPackage.loadingSubpackages = true;

        handleFieldChange('subPackages', model.subPackages.concat([newAssignedPackage]));

        dispatch(querySubPackageDetails(pkgId, model.pkgId));
    }

    handleAssignedPackageRemove(assignedPackage: AssignedPackageModel) {
        const { handleFieldChange } = this.props;
        handleFieldChange('subPackages', this.getNonmatchingSubpackages(assignedPackage));
    }

    handleAssignedPackageRequired(assignedPackage: AssignedPackageModel) {
        const { handleFieldChange } = this.props;
        handleFieldChange('subPackages', this.getUpdatedRequiredSubpackages(assignedPackage));
    }

    handleAssignedPackageReorder(assignedPackage: AssignedPackageModel, moveUp: boolean) {
        const { handleFieldChange } = this.props;

        let index = this.getSubpackageIndexOf(assignedPackage);
        if (!moveUp)
            index++;
        else if (index > 0)
            index--;

        let newSubPackageArr = this.getNonmatchingSubpackages(assignedPackage);
        newSubPackageArr.splice(index, 0, assignedPackage);

        handleFieldChange('subPackages', newSubPackageArr);
    }

    getUpdatedRequiredSubpackages(assignedPackage: AssignedPackageModel) {
        const { model } = this.props;
        let updatedSubpackages = [];

        model.subPackages.map((subPackage) => {
            let newSubPackage = new AssignedPackageModel({
                pkgId: subPackage.pkgId,
                description: subPackage.description,
                narrative: subPackage.narrative,
                repeatable: subPackage.repeatable,
                superPkgId: subPackage.superPkgId,
                active: subPackage.active,
                showActive: subPackage.showActive,
                required: subPackage.required,
                sortOrder: subPackage.sortOrder,
                subPackages: subPackage.subPackages
            });
            if (subPackage.superPkgId === assignedPackage.superPkgId) {
                newSubPackage.required = !newSubPackage.required;
            }
            updatedSubpackages.push(newSubPackage);
            return subPackage;
        });

        return updatedSubpackages;
    }

    getSubpackageIndexOf(assignedPackage: AssignedPackageModel) {
        const { model } = this.props;
        for (let i = 0; i < model.subPackages.length; i++) {
            const subPackage = model.subPackages[i];
            const idProp = assignedPackage.superPkgId != undefined ? 'superPkgId' : 'altId';
            if (subPackage[idProp] == assignedPackage[idProp]) {
                return i;
            }
        }
        return -1;
    }

    getNonmatchingSubpackages(assignedPackage: AssignedPackageModel) {
        const { model } = this.props;

        // use the generated altId to match as that will be unique for
        // both previously existing and newly added assigned packages
        return model.subPackages.filter((subPackage) => {
            return subPackage.altId != assignedPackage.altId;
        });
    }



    renderAttributes() {
        const { model, view } = this.props;
        if (model) {
            const { attributes, attributeLookups, hasEvent, hasProject, narrative } = model;
            const isReadOnly = view === VIEW_TYPES.PACKAGE_VIEW ||
                (view === VIEW_TYPES.PACKAGE_EDIT && (hasEvent));
            return <Attributes
                attributes={attributes}
                attributeLookups={attributeLookups}
                handleFieldChange={this.handleFieldChange}
                narrative={narrative}
                readOnly={isReadOnly}/>
        }

        return null;
    }

    renderButtons() {
        const { isValid, view } = this.props;

        if (view !== VIEW_TYPES.PACKAGE_VIEW) {
            return (
                <div className="btn-group pull-right">
                    <Button
                        id='cancelButton'
                        onClick={() => this.handleButtonAction('cancel')}>
                        Cancel
                    </Button>
                    {buttons.map((button: ButtonListProps, i: number) => {
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

    renderCategories() {
        const { handleFieldChange, model, view } = this.props;
        const disabled = view === VIEW_TYPES.PACKAGE_VIEW;

        return (
            <QuerySearch
                id='categoriesSelect'
                modelProps={{requiredColumns: REQUIRED_COLUMNS.CATS}}
                schemaQuery={CAT_SQ}>
                <CategoriesSelect
                    disabled={disabled}
                    handleChange={handleFieldChange}
                    values={model.categories}/>
            </QuerySearch>
        )
    }

    renderExtraFields(perRow: number, index: number, displayCols: number) {
        const { model, view } = this.props;
        const disabled = view === VIEW_TYPES.PACKAGE_VIEW;
        if (model) {
            const { extraFields } = model;
            return <ExtraFields
                key={"extra_fields_" + index}
                extraFields={extraFields}
                disabled={disabled}
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
        const disabled = view === VIEW_TYPES.PACKAGE_VIEW ||
            (view === VIEW_TYPES.PACKAGE_EDIT && (model.hasEvent));

        return (
            <div>
                <form>
                    <div className="row clearfix">
                        <div className="col-xs-8" style={{height: '190px'}}>
                            <div className="row clearfix">
                                <div className="col-xs-2">
                                    <ControlLabel htmlFor='pkgId'>Package Id</ControlLabel>
                                </div>
                                <div className="col-xs-10">
                                    <ControlLabel htmlFor='description'>Description *</ControlLabel>
                                </div>
                            </div>
                            <div className="row clearfix">
                                <div className="col-xs-2">
                                    <IdInput
                                        name='pkgId'
                                        onChange={handleFieldChange}
                                        value={model.pkgId}
                                        view={view}/>
                                </div>
                                <div className="col-xs-10">
                                    <TextInput
                                        disabled={disabled}
                                        name='description'
                                        onChange={this.handleFieldChange}
                                        required
                                        value={model.description}/>
                                </div>
                            </div>
                            <div className="row clearfix margin-top">
                                <div className="col-xs-12">
                                    <ControlLabel htmlFor='narrative'>Narrative *</ControlLabel>
                                </div>
                            </div>
                            <div className="row clearfix">
                                <div className="col-xs-12">
                                    <TextArea
                                        disabled={disabled}
                                        name='narrative'
                                        onChange={this.handleNarrativeChange}
                                        required={true}
                                        rows={6}
                                        value={model.narrative}/>
                                </div>
                            </div>
                        </div>
                        <div className="col-xs-4">
                            <div className="col-xs-12 extra-col-row">
                                {this.renderExtraFields(2, 0, 6)}
                            </div>
                            {this.renderCategories()}
                        </div>
                    </div>
                    <div className=" extra-col-row clearfix col-xs-12" >
                        {this.renderOverflowExtraFields(2)}
                    </div>

                    <div className="row clearfix">
                        <div className="col-xs-12" style={{marginTop:'20px'}}>
                            <strong>Attributes</strong>&nbsp;
                            <Button onClick={this.props.parseAttributes} className="attributes__parse">
                                <i className="fa fa-refresh attributes__parse-button"/>
                                &nbsp;<small>Parse Attributes</small>
                            </Button>
                        </div>
                        <div className="col-xs-12 margin-top">
                            {this.renderAttributes()}
                        </div>
                        <div className="col-xs-12 margin-bottom">
                            <CheckboxInput
                                disabled={disabled}
                                name='repeatable'
                                onChange={this.handleFieldChange}
                                value={model.repeatable}/>
                            Allow multiple instances of this package in one super package
                        </div>
                    </div>
                    <div style={{borderBottom: '1px solid black'}}/>

                    <SuperPackageForm
                        model={model}
                        view={view}
                        handleFieldChange={handleFieldChange}
                        handleWarning={handleWarning}
                        handleAssignedPackageAdd={this.handleAssignedPackageAdd}
                        handleAssignedPackageRemove={this.handleAssignedPackageRemove}
                        handleAssignedPackageReorder={this.handleAssignedPackageReorder}
                        handleAssignedPackageRequired={this.handleAssignedPackageRequired}
                        handleFullNarrative={handleFullNarrative}
                        showActive={false}
                        showRequired={true}
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

export const PackageForm: any = connect()(PackageFormImpl as any); // fix typing