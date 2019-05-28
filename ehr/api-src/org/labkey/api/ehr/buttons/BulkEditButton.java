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
package org.labkey.api.ehr.buttons;

import org.labkey.api.data.TableInfo;
import org.labkey.api.ehr.security.EHRVeterinarianPermission;
import org.labkey.api.ldk.table.SimpleButtonConfigFactory;
import org.labkey.api.module.Module;

public class BulkEditButton extends SimpleButtonConfigFactory
{
    public BulkEditButton(Module owner)
    {
        super(owner, "Bulk Edit", "EHR.DatasetButtons.addBulkEditHandler(dataRegionName);");
        setInsertPosition(-1);
    }

    public boolean isAvailable(TableInfo ti)
    {
        return super.isAvailable(ti) && ti.getUserSchema().getContainer().hasPermission(ti.getUserSchema().getUser(), EHRVeterinarianPermission.class);
    }
}