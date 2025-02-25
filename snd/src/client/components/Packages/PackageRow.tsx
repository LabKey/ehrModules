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
import { Link } from 'react-router-dom'
import { OverlayTrigger, Tooltip, TooltipProps } from 'react-bootstrap'
import { QueryPackageModel } from '../../containers/Packages/model'

interface PackageRowProps {
    data: QueryPackageModel
    dataId: number
    handleDelete?: (rowId) => any
}

interface PackageRowStateProps {
    isHover: boolean
}

export class PackageRow extends React.Component<PackageRowProps, PackageRowStateProps> {

    static generateToolTip(tooltip: string, id: string): React.ReactElement<TooltipProps> {
        return <Tooltip id={id}>{tooltip}</Tooltip>;
    }

    constructor(props: PackageRowProps) {
        super(props);

        this.state = {
            isHover: false
        };

        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
    }

    handleMouseEnter() {
        this.setState({isHover: true});
    }

    handleMouseLeave() {
        this.setState({isHover: false});
    }

    render() {
        const { handleDelete } = this.props;
        const { Description, HasEvent, HasProject, PkgId } = this.props.data;
        const { isHover } = this.state;

        // HasEvent and HasProject are string booleans
        const canDelete = (HasEvent.value !== 'true');

        // todo: URLs should be more resilient
        return (
            <div
                className="package_viewer__result clearfix package-row"
                data-packageId={PkgId.value}
                onMouseEnter={this.handleMouseEnter}
                onMouseLeave={this.handleMouseLeave}>
                <div className="result-icons pull-left">
                    <OverlayTrigger overlay={PackageRow.generateToolTip('View', PkgId.value)} placement="top">
                        <Link to={'/packages/view/' + PkgId.value} className="package-row_icon">
                            <i className={"fa fa-eye"}/>
                        </Link>
                    </OverlayTrigger>
                    <OverlayTrigger overlay={PackageRow.generateToolTip('Edit', PkgId.value)} placement="top">
                        <Link to={'/packages/edit/' + PkgId.value} className="package-row_icon">
                            <i className="fa fa-pencil"/>
                        </Link>
                    </OverlayTrigger>
                    <OverlayTrigger overlay={PackageRow.generateToolTip('Clone', PkgId.value)} placement="top">
                        <Link to={'/packages/clone/' + PkgId.value} className="package-row_icon">
                            <i className="fa fa-files-o"/>
                        </Link>
                    </OverlayTrigger>
                </div>
                <div className="pull-left " style={{marginLeft: '10px'}}>
                    {[PkgId.value, Description.value].join(' - ')}
                </div>
                {isHover && canDelete ?
                    <div className="pull-right" style={{cursor: 'pointer'}}>
                        <i className="fa fa-times" onClick={() => handleDelete(PkgId.value)}/>
                    </div>
                : null}

            </div>
        )
    }
}
