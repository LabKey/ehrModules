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
import { Button, Modal } from 'react-bootstrap'
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { History } from 'history'

import { ProjectSearchInput } from '../../../components/Projects/ProjectSearchInput'
import { ProjectSearchResults } from '../../../components/Projects/ProjectSearchResults'
import * as actions from '../actions'
import { ProjectsModel } from '../model'

import { QueryModel } from '../../../query/model'
import {clearAllErrors} from "../../App/actions";


interface ProjectViewerOwnProps {
    history?: History
    model?: QueryModel
}

interface ProjectViewerState {
    dispatch?: Dispatch<any>

    projectsModel?: ProjectsModel
}

interface ProjectViewerStateProps {
    toRemoveId?: number,
    toRemoveRev?: number,
    toRemoveObjId?: number
}

type ProjectViewerProps = ProjectViewerOwnProps & ProjectViewerState;

function mapStateToProps(state: APP_STATE_PROPS) {

    return {
        projectsModel: state.projects
    };
}

export class ProjectViewerImpl extends React.Component<ProjectViewerProps, ProjectViewerStateProps> {

    private inputRef: HTMLInputElement;

    constructor(props: ProjectViewerProps) {
        super(props);

        this.state = {
            toRemoveId: undefined,
            toRemoveRev: undefined,
            toRemoveObjId: undefined
        };

        this.changeLocation = this.changeLocation.bind(this);
        this.deleteProject = this.deleteProject.bind(this);
        this.handleClear = this.handleClear.bind(this);
        this.handleDeleteRequest = this.handleDeleteRequest.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.hideModal = this.hideModal.bind(this);
        this.toggleDrafts = this.toggleDrafts.bind(this);
        this.toggleNotActive = this.toggleNotActive.bind(this);
    }

    componentDidMount() {
        const { dispatch, model, projectsModel } = this.props;
        // make a should load/init function
        if (model && model.isLoaded && !projectsModel || projectsModel && !projectsModel.isInit) {
            dispatch(projectsModel.init(model));
        }
    }

    componentWillReceiveProps(nextProps?: ProjectViewerProps) {
        const { dispatch, model, projectsModel } = nextProps;
        const dataExists = (model && model.isLoaded);
        const modelExists = (projectsModel && projectsModel.isInit);

        if (dataExists && !modelExists) {
            dispatch(projectsModel.init(model));
        }
    }

    componentWillUnmount() {
        const { dispatch } = this.props;
        dispatch(actions.resetProjectFilter());
        dispatch(clearAllErrors());
    }

    changeLocation(loc: string) {
        const { history } = this.props;
        history.push(loc);
    }

    deleteProject() {
        const { dispatch } = this.props;
        const { toRemoveId, toRemoveRev, toRemoveObjId } = this.state;
        dispatch(actions.deleteProject(toRemoveId, toRemoveRev, toRemoveObjId));
    }

    handleClear() {
        const { dispatch } = this.props;

        this.inputRef.focus();
        dispatch(actions.filterProjects(''));
    }

    handleDeleteRequest(id, rev, objId) {
        const { dispatch } = this.props;

        this.setState({
            toRemoveId: id,
            toRemoveRev: rev,
            toRemoveObjId: objId
        });

        dispatch(actions.projectsWarning())
    }

    hideModal() {
        const { dispatch } = this.props;

        dispatch(actions.projectsResetWarning())
    }

    handleInputChange(evt: React.ChangeEvent<HTMLInputElement>) {
        const { dispatch } = this.props;
        const input = evt.currentTarget.value;
        dispatch(actions.filterProjects(input));
    }

    toggleDrafts() {
        const { dispatch, projectsModel } = this.props;
        dispatch(projectsModel.toggleDrafts())
    }

    toggleNotActive() {
        const { dispatch, projectsModel } = this.props;
        dispatch(projectsModel.toggleNotActive())
    }

    renderWarning() {
        const { isWarning } = this.props.projectsModel;
        const { toRemoveId, toRemoveRev } = this.state;

        if (isWarning) {
            return (
                <div className="static-modal">
                    <Modal onHide={this.hideModal} show={isWarning}>
                        <Modal.Body>
                            Are you sure you want to remove project {toRemoveId}, revision {toRemoveRev}?
                        </Modal.Body>
                        <Modal.Footer>
                            <Button onClick={this.hideModal}>Cancel</Button>
                            <Button bsStyle='primary' onClick={this.deleteProject}>Delete Project</Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            )
        }
    }

    render() {

        if (this.props.projectsModel) {
            const { data, filteredActive, filteredNotActive, filteredDrafts, input, isInit, showDrafts, showNotActive } = this.props.projectsModel;

            return (
                <div className="row" style={{padding: '20px 0'}}>
                    {this.renderWarning()}
                    <ProjectSearchInput
                        changeLocation={this.changeLocation}
                        handleClear={this.handleClear}
                        handleInputChange={this.handleInputChange}
                        input={input}
                        inputRef={(el) => this.inputRef = el}
                        showDrafts={showDrafts}
                        showNotActive={showNotActive}
                        toggleDrafts={this.toggleDrafts}
                        toggleNotActive={this.toggleNotActive}
                    />

                    <div className="col-xs-12 project-viewer__results" style={{margin: '0 0 0 2%'}}>
                        {showDrafts ?
                            <div className="project_viewer__results--drafts">
                                <h4>Drafts</h4>
                                <div className="project_viewer__results-container">
                                    <ProjectSearchResults
                                        data={data}
                                        dataIds={filteredDrafts}
                                        isLoaded={isInit}
                                        handleDelete={this.handleDeleteRequest}/>
                                </div>
                            </div>
                            : null}

                        <div className="project_viewer__results--active clearfix">
                            <h4>Active</h4>
                            <div className="project_viewer__results-container">
                                <ProjectSearchResults
                                    data={data}
                                    dataIds={filteredActive}
                                    isLoaded={isInit}
                                    handleDelete={this.handleDeleteRequest}/>
                            </div>
                        </div>

                        {showNotActive ?
                            <div className="project_viewer__results--drafts">
                                <h4>Not Active</h4>
                                <div className="project_viewer__results-container">
                                    <ProjectSearchResults
                                        data={data}
                                        dataIds={filteredNotActive}
                                        isLoaded={isInit}
                                        handleDelete={this.handleDeleteRequest}/>
                                </div>
                            </div>
                            : null}
                    </div>
                </div>
            )
        }

        return <div><i className="fa fa-spinner fa-spin fa-fw"/> Loading...</div>;
    }
}

export const ProjectViewer = connect<any, any, ProjectViewerProps>(mapStateToProps)(ProjectViewerImpl);