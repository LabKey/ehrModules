/*
 * Copyright (c) 2016-2019 LabKey Corporation
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

import org.labkey.api.data.Container;
import org.labkey.api.data.Results;
import org.labkey.api.query.FieldKey;
import org.labkey.api.util.DateUtil;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.module.Module;

import java.sql.SQLException;
import java.util.Set;

/**
 * User: bimber
 * Date: 2/17/13
 * Time: 4:52 PM
 */
public class DefaultCasesDataSource extends AbstractDataSource
{
    public DefaultCasesDataSource(Module module)
    {
        super("study", "Cases", "Case Opened", "Clinical", module);
    }

    @Override
    protected String getHtml(Container c, Results rs, boolean redacted) throws SQLException
    {
        StringBuilder sb = new StringBuilder();
        sb.append(safeAppend(rs, "Category", "category"));
        sb.append(safeAppend(rs, "Case #", "caseno"));

        if (!redacted)
        {
            sb.append(safeAppend(rs, "Opened By", "performedby"));
        }

        if (rs.getObject(FieldKey.fromString("enddate")) != null)
        {
            sb.append("Closed On: ").append(DateUtil.formatDate(c, rs.getDate(FieldKey.fromString("enddate"))));
        }

        return sb.toString();
    }

    @Override
    protected Set<String> getColumnNames()
    {
        return PageFlowUtil.set("Id", "date", "enddate", "caseno", "objectid", "performedby", "category");
    }
}
