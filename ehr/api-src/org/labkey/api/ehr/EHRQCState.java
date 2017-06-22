/*
 * Copyright (c) 2013-2017 LabKey Corporation
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
package org.labkey.api.ehr;

import org.json.JSONObject;
import org.labkey.api.data.Container;

/**
 * Augments the study module's QC state with additional metadata reflecting a record's progression from draft to
 * needing to reviewed to finalized.
 * User: bimber
 * Date: 10/29/13
 */
public interface EHRQCState
{
    int getRowId();

    String getLabel();

    Container getContainer();

    String getDescription();

    /** @return if data is considered "complete" and should be included in most views and reports */
    Boolean isPublicData();

    /** @return if data is still in the process of being entered. Still visible to other EHR users, but filtered out from many views */
    Boolean isDraftData();

    Boolean isDeleted();

    /** @return if this is a request for a service, which will eventually be marked as complete by entering data in the associated record and flipping the QCState to complete or similar */
    Boolean isRequest();

    /** @return if this QCState is associated with records that can be entered with a future date (like a forward-looking request) */
    Boolean isAllowFutureDates();

    JSONObject toJson();

}
