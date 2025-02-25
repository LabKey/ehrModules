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

import { handleActions } from 'redux-actions';

import { PROJECT_TYPES } from './constants'
import { QueryProjectModel, ProjectsModel } from './model'

export const projects = handleActions({

    [PROJECT_TYPES.PROJECTS_INIT]: (state: ProjectsModel, action: any) => {
        const { dataResponse } = action;
        const { data, dataCount, dataIds } = dataResponse;


        let active = [],
            ids = [],
            drafts = [],
            notActive = [],
            latest = {};
        for (let i=0; i<dataIds.length; i++) {
            const projectData = data[dataIds[i]];
            if (latest[projectData.ProjectId.value] === undefined) {
                latest[projectData.ProjectId.value] = projectData.RevisionNum.value;
            } else if (projectData.RevisionNum.value > latest[projectData.ProjectId.value]) {
                latest[projectData.ProjectId.value] = projectData.RevisionNum.value;
            }
        }
        const projectsData = dataIds.reduce((prev, next: number) => {
            const projectData = data[next];
            const id = [projectData.ProjectId.value, projectData.RevisionNum.value].join('|');
            ids.push(id);
            let isLatest = false;
            if (latest[projectData.ProjectId.value] === projectData.RevisionNum.value) {
                isLatest = true;
            }
            prev[id] = new QueryProjectModel(Object.assign({}, projectData, {
                Latest: isLatest
            }));
            if (projectData.Active.value === false) {
                drafts.push(id);
            }
            else {
                let startParts = projectData.StartDate.value.split(/\D/);
                let startDate = new Date(startParts[0], startParts[1] - 1, startParts[2]);
                let today = new Date();
                if (today === startDate) {
                    active.push(id);
                }
                else if (today > startDate) {
                    if (projectData.EndDate.value == null) {
                        active.push(id);
                    }
                    else {
                        let endParts = projectData.EndDate.value.split(/\D/);
                        let endDate = new Date(endParts[0], endParts[1] - 1, endParts[2]);
                        if (today <= endDate) {
                            active.push(id);
                        }
                        else {
                            notActive.push(id);
                        }
                    }
                }
                else {
                    notActive.push(id);
                }
            }

            return prev;
        }, {});

        return new ProjectsModel(Object.assign({}, state, {
            active,
            notActive,
            data: projectsData,
            dataIds: ids,
            drafts,
            isInit: true,
            filteredActive: active,
            filteredNotActive: notActive,
            filteredDrafts: drafts,
            projectCount: dataCount
        }));
    },

    [PROJECT_TYPES.PROJECTS_INVALIDATE]: () => {
        return new ProjectsModel();
    },

    [PROJECT_TYPES.PROJECTS_RESET_FILTER]: (state: ProjectsModel) => {
        const { active, notActive, drafts } = state;

        return new ProjectsModel(Object.assign({}, state, {
            filteredActive: active,
            filteredNotActive: notActive,
            filteredDrafts: drafts
        }));
    },

    [PROJECT_TYPES.PROJECTS_RESET_WARNING]: (state: ProjectsModel) => {
        return new ProjectsModel(Object.assign({}, state, {
            isWarning: false,
            message: undefined
        }));
    },

    [PROJECT_TYPES.PROJECTS_SEARCH_FILTER]: (state: ProjectsModel, action: any) => {
        const { active, notActive, data, dataIds, drafts } = state;
        const { input } = action;

        let filteredActive = active,
            filteredNotActive = notActive,
            filteredDrafts = drafts;

        if (input && input !== '') {
            const filtered = filterProjects(input, dataIds, data);
            filteredActive = filtered.filter((id) => {
                return active.indexOf(id) !== -1;
            });

            filteredNotActive = filtered.filter((id) => {
                return notActive.indexOf(id) !== -1;
            });

            filteredDrafts = filtered.filter((id) => {
                return drafts.indexOf(id) !== -1;
            });
        }

        return new ProjectsModel(Object.assign({}, state, {
            filteredActive,
            filteredNotActive,
            filteredDrafts,
            input
        }));
    },

    [PROJECT_TYPES.PROJECTS_TOGGLE_DRAFTS]: (state: ProjectsModel, action: any) => {
        const { toggled } = action;

        const showDrafts = typeof toggled === 'boolean' ? toggled : !state.showDrafts;

        return new ProjectsModel(Object.assign({}, state, {
            showDrafts
        }));
    },

    [PROJECT_TYPES.PROJECTS_TOGGLE_NOT_ACTIVE]: (state: ProjectsModel, action: any) => {
        const { toggled } = action;

        const showNotActive = typeof toggled === 'boolean' ? toggled : !state.showNotActive;

        return new ProjectsModel(Object.assign({}, state, {
            showNotActive
        }));
    },

    [PROJECT_TYPES.PROJECTS_WARNING]: (state: ProjectsModel, action: any) => {
        const { message } = action;

        return new ProjectsModel(Object.assign({}, state, {
            isWarning: true,
            message
        }));
    },

}, new ProjectsModel());

function filterProjects(input: string, dataIds: Array<number> , data: {[key: string]: any}) {

    return dataIds.filter((id: number) => {
        const project: QueryProjectModel = data[id];

        if (project) {
            return (
                project.Description &&
                project.Description.value.toLowerCase().indexOf(input.toLowerCase()) !== -1
            ) || (
                project.ProjectId &&
                project.ProjectId.value.toString().indexOf(input) !== -1
            )
        }

        return false;
    });

}