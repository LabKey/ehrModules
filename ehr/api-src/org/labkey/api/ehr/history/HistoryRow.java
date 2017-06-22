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
package org.labkey.api.ehr.history;

import org.json.JSONObject;

/**
 * An individual item within a Clinical History, as created by a {@link HistoryDataSource}
 * User: bimber
 * Date: 3/3/13
 */
public interface HistoryRow
{
    String getSubjectId();

    JSONObject toJSON();

    void setShowTime(Boolean showTime);

    String getSortDateString();
}
