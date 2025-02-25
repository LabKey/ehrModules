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
import { Button, DropdownButton, MenuItem } from 'react-bootstrap'
import { Link } from 'react-router-dom'

import { SearchInput } from "../Search/SearchInput";

interface ProjectSearchInputProps {
    changeLocation?: (loc: string) => any
    handleClear: () => any
    handleInputChange?: (input) => any
    input?: string
    inputRef: any
    showDrafts: boolean
    showNotActive: boolean
    toggleDrafts: () => any
    toggleNotActive: () => any
}

export class ProjectSearchInput extends React.Component<ProjectSearchInputProps, {}> {

    render() {
        const {
            changeLocation,
            handleClear,
            handleInputChange,
            input,
            inputRef,
            showDrafts,
            toggleDrafts,
            showNotActive,
            toggleNotActive
        } = this.props;

        return(
            <div>
                <div className="project-viewer__header clearfix" style={{paddingBottom: '20px', paddingTop: '10px'}}>
                    <div className={"col-xs-12"}>
                        <div className={"col-xs-2 projects-button"}>
                            <Link to="/projects/new">
                                <Button className="projects-new_project_btn">New Project</Button>
                            </Link>
                        </div>
                        <div className={"col-xs-1"} />
                        <SearchInput
                            inputRef={inputRef}
                            input={input}
                            handleInputChange={handleInputChange}
                            handleClear={handleClear}
                            name="projectSearch"
                            wrapperClassName={"col-xs-6"}/>
                        <div className={"col-xs-3"}></div>
                    </div>
                    <div className="col-xs-12 row clearfix">
                        <div className="col-xs-2 projects-show_drafts" onClick={toggleDrafts}>
                            <input type="checkbox" checked={showDrafts}/> Show Drafts
                        </div>
                        <div className="col-xs-9 projects-show_not_active" onClick={toggleNotActive}>
                            <input type="checkbox" checked={showNotActive}/> Show Not Active
                        </div>
                    </div>
                </div>
                <div style={{borderBottom: '1px solid black', margin: '0 15px'}}/>
            </div>
        )
    }
}