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
import {AssignedPackageModel} from "../../SuperPackages/model";

interface NarrativeRowOwnProps {
    model: AssignedPackageModel
    level: number
}
type NarrativeRowViewerProps = NarrativeRowOwnProps;

export default class NarrativeRow extends React.Component<NarrativeRowViewerProps, any> {

    render() {
        const { model, level } = this.props;
        const { narrative } = model;
        const indentPx = (level + 1) * 20;

        return (
            <div style={{paddingLeft: indentPx + 'px'}} className="narrative_row">
                - {narrative}
            </div>
        )
    }
}