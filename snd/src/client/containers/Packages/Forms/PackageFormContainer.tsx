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
import { Button, Modal, Panel } from 'react-bootstrap'
import { RouteComponentProps } from 'react-router-dom'

import { connect } from 'react-redux';
import { push } from 'react-router-redux'
import { Dispatch } from 'redux';

import * as actions from '../../Wizards/Packages/actions'
import { PackageWizardModel } from '../../Wizards/Packages/model'

import { PackageForm } from './PackageForm'
import { PKG_WIZARD_TYPES } from '../../Wizards/Packages/constants'
import {AssignedPackageModel} from "../../SuperPackages/model";
import {queryPackageFullNarrative} from "../../Wizards/SuperPackages/actions";
import NarrativeRow from "../../SuperPackages/Forms/NarrativeRow";
import {VIEW_TYPES} from "../../App/constants";
import {clearAllErrors} from "../../App/actions";


interface PackageFormContainerOwnProps extends RouteComponentProps<{id: string}> {}

interface PackageFormContainerState {
    dispatch?: Dispatch<any>

    id: string
    model?: PackageWizardModel
    view?: string
}

interface PackageFormContainerStateProps {}

type PackageFormContainerProps = PackageFormContainerOwnProps & PackageFormContainerState;



function mapStateToProps(state: APP_STATE_PROPS, ownProps: PackageFormContainerOwnProps) {
    const { id } = ownProps.match.params;
    const { path } = ownProps.match;

    const parts = path.split('/');
    let view;
    if (parts && parts[2]) {
        view = parts[2];
    }

    let pkgId;
    if (id) {
        pkgId = id;
    }
    else {
        pkgId = -1;
    }

    return {
        id: pkgId,
        model: state.wizards.packages.packageData[pkgId],
        view
    };
}

export class PackageFormContainerImpl extends React.Component<PackageFormContainerProps, PackageFormContainerStateProps> {

    private panelHeader: React.ReactNode = null;
    private view: VIEW_TYPES;

    constructor(props?: PackageFormContainerProps) {
        super(props);

        const { id, view } = props;

        switch (view) {
            case 'view':
                this.view = VIEW_TYPES.PACKAGE_VIEW;
                break;

            case 'edit':
                this.view = VIEW_TYPES.PACKAGE_EDIT;
                break;

            case 'clone':
                this.view = VIEW_TYPES.PACKAGE_CLONE;
                break;

            case 'new':
                this.view = VIEW_TYPES.PACKAGE_NEW;
                break;
        }


        this.panelHeader = resolvePackageHeader(this.view, id);

        this.closeFullNarrative = this.closeFullNarrative.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.handleNarrativeChange = this.handleNarrativeChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.parseAttributes = this.parseAttributes.bind(this);
        this.renderNarrative = this.renderNarrative.bind(this);
        this.setModelWarning = this.setModelWarning.bind(this);
        this.showFullNarrative = this.showFullNarrative.bind(this);
    }

    componentDidMount() {
        this.initModel(this.props);
    }

    componentWillReceiveProps(nextProps?: PackageFormContainerProps) {
        this.initModel(nextProps);
    }

    componentWillUnmount() {
        const { dispatch, model } = this.props;

        dispatch(clearAllErrors());
        if (model) {
            dispatch(model.invalidate());
        }
    }

    initModel(props: PackageFormContainerProps) {
        const { dispatch, id, view } = props;
        dispatch(actions.init(id, VIEW_TYPES["PACKAGE_" + view.toUpperCase()]));
    }

    handleCancel() {
        const { dispatch } = this.props;
        dispatch(push('/packages'))
    }

    handleAttributeChange(name, value) {
        const { dispatch, model } = this.props;
        const parts = name.split('_');
        const index = parts[1];

        if (parts[2] && parts[2] === "lookupKey") {
            if (value === "") {
                model.data.attributes[index].lookupValues = null;
                model.data.attributes[index].defaultValue = null;

                const updatedModel = new PackageWizardModel(Object.assign({}, model, {
                    model
                }));

                dispatch(updatedModel.saveField(name, value));
            }
            else {
                actions.fetchDefaultLookups(model, name, value, dispatch);
            }
        } else {
            dispatch(model.saveField(name, value));
        }
    }

    handleFieldChange(name, value) {
        const { dispatch, model } = this.props;

        if (name.indexOf("attributes") != -1) {
            this.handleAttributeChange(name, value);
        } else {
            dispatch(model.saveField(name, value));
        }
    }

    handleSubmit(active: boolean) {
        const { dispatch, model } = this.props;
        dispatch(model.submitForm(active));
    }

    handleNarrativeChange(value) {
        const { dispatch, model } = this.props;
        if (model) {
            dispatch(model.saveNarrative(value));
        }
    }

    parseAttributes() {
        const { dispatch, model } = this.props;
        dispatch(model.parseAttribtues());
    }

    showFullNarrative(pkg: AssignedPackageModel, shouldQuery: boolean) {
        const { dispatch, model } = this.props;

        if (shouldQuery) {
            dispatch(queryPackageFullNarrative(pkg.pkgId, model, PKG_WIZARD_TYPES.PACKAGE_FULL_NARRATIVE));
        }
        else {
            dispatch({
                type: PKG_WIZARD_TYPES.PACKAGE_FULL_NARRATIVE,
                model,
                narrativePkg: pkg
            });
        }
    }

    closeFullNarrative() {
        const { dispatch, model } = this.props;

        dispatch({
            type: PKG_WIZARD_TYPES.PACKAGE_CLOSE_FULL_NARRATIVE,
            model
        });
    }

    renderNarrative(narrativePkg: AssignedPackageModel, level: number) {
        const { subPackages } = narrativePkg;
        const key = "narrative-row-" + (narrativePkg.superPkgId || narrativePkg.altId);

        return (
            <div key={key}>
                <NarrativeRow model={narrativePkg} level={level} />
                {subPackages.map((subPackage) =>
                    this.renderNarrative(subPackage, level + 1)
                )}
            </div>
        );
    }

    renderBody() {
        const { model } = this.props;

        if (model && model.packageLoaded && !model.isError) {
            return <PackageForm
                        handleCancel={this.handleCancel}
                        handleFieldChange={this.handleFieldChange}
                        handleFormSubmit={this.handleSubmit}
                        handleNarrativeChange={this.handleNarrativeChange}
                        handleFullNarrative={this.showFullNarrative}
                        handleWarning={this.setModelWarning}
                        isValid={model.isValid && !model.isSubmitting}
                        model={model.data}
                        parseAttributes={this.parseAttributes}
                        view={model.formView}/>;
        }
        else if (model && model.isError) {
            return <div className='alert alert-danger package-wizard-model__error'>{model.message ? model.message : ''}</div>;
        }

        return <div><i className="fa fa-spinner fa-spin fa-fw"/> Loading...</div>;
    }

    renderModal() {
        const { model } = this.props;

        if (model) {
            if (model.isWarning && model.message) {
                return (
                    <div className="static-modal">
                        <Modal onHide={() => this.setModelWarning()} show={model.isWarning}>
                            <Modal.Body>
                                {model.message}
                            </Modal.Body>
                            <Modal.Footer>
                                <div className="btn-group">
                                    <Button onClick={() => this.setModelWarning()}>Confirm</Button>
                                </div>
                            </Modal.Footer>
                        </Modal>
                    </div>
                )
            }
            if (model.isSubmitting) {
                return (
                    <div className="static-modal">
                        <Modal onHide={() => null} show={model.isSubmitting}>
                            <Modal.Body>
                                <i className="fa fa-spinner fa-spin fa-fw"/> Submitting Package
                            </Modal.Body>
                        </Modal>
                    </div>
                )
            }
            if (model.narrativePkg != null) {
                return (
                    <div className="static-modal">
                        <Modal onHide={this.closeFullNarrative} show={model.narrativePkg != null}>
                            <Modal.Header closeButton>
                                <Modal.Title>Full Narrative for Package {model.narrativePkg.pkgId}</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                {this.renderNarrative(model.narrativePkg, 0)}
                            </Modal.Body>
                            <Modal.Footer>
                                <Button onClick={this.closeFullNarrative}>Close</Button>
                            </Modal.Footer>
                        </Modal>
                    </div>
                )
            }
        }
    }

    setModelWarning(warning?: string) {
        const { dispatch, model } = this.props;
        // if no warning is provided, warning will be toggled off and message removed
        dispatch(model.setWarning(warning));
    }

    render() {
        return (
            <Panel header={this.panelHeader}>
                {this.renderModal()}
                {this.renderBody()}
            </Panel>
        )
    }
}

export const PackageFormContainer = connect<any, any, PackageFormContainerProps>(mapStateToProps)(PackageFormContainerImpl);

function resolvePackageHeader(view: VIEW_TYPES, id) {

    let text = '';
    switch (view) {
        case VIEW_TYPES.PACKAGE_VIEW:
            text = 'View Package - ' + id;
            break;

        case VIEW_TYPES.PACKAGE_EDIT:
            text = 'Edit Package - ' + id;
            break;

        case VIEW_TYPES.PACKAGE_CLONE:
            text = 'New Package - Clone of ' + id;
            break;

        case VIEW_TYPES.PACKAGE_NEW:
            text = 'New Package';
            break;

        default:
    }

    return (
        <div className="header--border__bottom">
            <h4>{text}</h4>
        </div>
    );
}