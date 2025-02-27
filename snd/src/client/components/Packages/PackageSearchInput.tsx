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
import { Button, DropdownButton, MenuItem } from 'react-bootstrap'
import { Link } from 'react-router-dom'

import { SearchInput } from "../Search/SearchInput";

interface PackageSearchInputProps {
    changeLocation?: (loc: string) => any
    handleClear: () => any
    handleInputChange?: (input) => any
    input?: string
    inputRef: any
    showDrafts: boolean
    toggleDrafts: () => any
}

export class PackageSearchInput extends React.Component<PackageSearchInputProps, {}> {

    render() {
        const {
            changeLocation,
            handleClear,
            handleInputChange,
            input,
            inputRef,
            showDrafts,
            toggleDrafts
        } = this.props;

        return(
            <div>
                <div className="package-viewer__header clearfix" style={{paddingBottom: '20px', paddingTop: '10px'}}>
                    <div className={"col-xs-12"}>
                        <div className={"col-xs-3 packages-button"}>
                            <Link to="/packages/new">
                                <Button className="packages-new_pkg_btn">New Package</Button>
                            </Link>
                        </div>
                        <SearchInput
                            inputRef={inputRef}
                            input={input}
                            handleInputChange={handleInputChange}
                            handleClear={handleClear}
                            name="packageSearch"
                            wrapperClassName={"col-xs-6"}/>
                        <div className={"col-xs-3 packages-button"}>
                            <div className="packages-options">
                                <DropdownButton id="package-actions" title="Options" pullRight style={{width: '105px'}}>
                                    <MenuItem onClick={() => changeLocation('/categories')}>
                                        Edit Categories
                                    </MenuItem>
                                    <MenuItem disabled>Edit Projects</MenuItem>
                                </DropdownButton>
                            </div>
                        </div>
                    </div>
                    <div className="col-xs-12 packages-show_drafts" onClick={toggleDrafts}>
                        <div className="col-xs-6">
                            <input type="checkbox" checked={showDrafts}/> Show drafts
                        </div>
                        <div className="col-xs-6"></div>
                    </div>
                </div>
                <div style={{borderBottom: '1px solid black', margin: '0 15px'}}/>
            </div>
        )
    }
}