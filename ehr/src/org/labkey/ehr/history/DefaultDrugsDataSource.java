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
package org.labkey.ehr.history;

import org.labkey.api.data.Results;
import org.labkey.api.query.FieldKey;
import org.labkey.api.util.PageFlowUtil;

import java.sql.SQLException;
import java.util.Arrays;
import java.util.List;
import java.util.Set;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 2/17/13
 * Time: 4:52 PM
 */
public class DefaultDrugsDataSource extends AbstractDataSource
{
    public DefaultDrugsDataSource()
    {
        super("study", "Drug Administration", "Medication Given");
    }

    @Override
    protected String getHtml(Results rs) throws SQLException
    {
        StringBuilder sb = new StringBuilder();
        safeAppend(rs, "Category", "category");
        safeAppend(rs, "Case", "caseid");
        safeAppend(rs, "Category", "parentId/caseid/category");

        if (rs.hasColumn(FieldKey.fromString("code")) && rs.getObject("code") != null)
            sb.append(snomedToString(rs, FieldKey.fromString("code"), FieldKey.fromString("code/meaning")));

        if (rs.hasColumn(FieldKey.fromString("route")) && rs.getObject("route") != null)
            sb.append("Route: " + rs.getString("route")).append("\n");

        if (rs.hasColumn(FieldKey.fromString("volume")) && rs.getObject("volume") != null)
        {
            sb.append("Volume: " + rs.getString("volume"));

            if (rs.hasColumn(FieldKey.fromString("vol_units")) && rs.getObject("vol_units") != null)
                sb.append(" " + rs.getString("vol_units"));

            sb.append("\n");
        }

        if (rs.hasColumn(FieldKey.fromString("amount")) && rs.getObject("amount") != null)
        {
            sb.append("Amount: " + rs.getString("amount"));

            if (rs.hasColumn(FieldKey.fromString("amount_units")) && rs.getObject("amount_units") != null)
                sb.append(" " + rs.getString("amount_units"));

            sb.append("\n");
        }

        return sb.toString();
    }

    @Override
    protected Set<String> getColumnNames()
    {
        return PageFlowUtil.set("Id", "date", "enddate", "route", "volume", "vol_units", "amount", "amount_units", "code", "code/meaning", "category", "caseid", "parentId/caseid/category");
    }
}
