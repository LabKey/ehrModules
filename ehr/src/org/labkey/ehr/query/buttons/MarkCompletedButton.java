/*
 * Copyright (c) 2013 LabKey Corporation
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
package org.labkey.ehr.query.buttons;

import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.ldk.table.SimpleButtonConfigFactory;
import org.labkey.api.module.Module;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.api.ehr.security.EHRCompletedUpdatePermission;

/**
 * User: bimber
 * Date: 7/14/13
 * Time: 4:05 PM
 */
public class MarkCompletedButton extends SimpleButtonConfigFactory
{
    protected String _schemaName;
    protected String _queryName;

    public MarkCompletedButton(Module owner, String schemaName, String queryName)
    {
        super(owner, "Mark Completed", "");
        setClientDependencies(ClientDependency.fromModuleName("ehr"));
        _schemaName = schemaName;
        _queryName = queryName;
    }

    public boolean isAvailable(TableInfo ti)
    {
        if (!super.isAvailable(ti))
            return false;

        if (ti.getUserSchema().getName().equalsIgnoreCase(_schemaName) && ti.getPublicName().equalsIgnoreCase(_queryName))
            return EHRService.get().hasPermission(ti, EHRCompletedUpdatePermission.class);

        return EHRService.get().hasPermission(_schemaName, _queryName, ti.getUserSchema().getContainer(), ti.getUserSchema().getUser(), EHRCompletedUpdatePermission.class);
    }

    @Override
    protected String getJsHandler(TableInfo ti)
    {
        ColumnInfo col = ti.getColumn("enddate");
        String xtype = "datefield";
        if (col.getFormat().contains("HH"))
            xtype = "xdatetime";

        return "EHR.DatasetButtons.markCompletedButtonHandler(dataRegionName, " + PageFlowUtil.jsString(_schemaName) + ", " + PageFlowUtil.jsString(_queryName) + ", " + PageFlowUtil.jsString(xtype) + ");";
    }
}
