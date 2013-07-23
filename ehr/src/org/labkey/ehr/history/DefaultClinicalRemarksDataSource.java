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
import org.labkey.api.ehr.history.AbstractDataSource;
import org.labkey.api.query.FieldKey;
import org.labkey.api.util.PageFlowUtil;

import java.sql.SQLException;
import java.util.Set;

/**
 * User: bimber
 * Date: 2/17/13
 * Time: 4:52 PM
 */
public class DefaultClinicalRemarksDataSource extends AbstractDataSource
{
    public DefaultClinicalRemarksDataSource()
    {
        super("study", "Clinical Remarks", "Clinical Remark", "Clinical");
    }

    @Override
    protected String getCategoryText(Results rs) throws SQLException
    {
        String category = rs.getString("category");
        return (category == null ?  "Clinical" : category) + " Remark";
    }

//    @Override
//    public Set<String> getAllowableCategoryGroups(Container c, User u)
//    {
//        Date start = new Date();
//
//        TableInfo ti = QueryService.get().getUserSchema(u, c, EHRSchema.EHR_LOOKUPS).getTable("clinremarks_category");
//        TableSelector ts = new TableSelector(ti, Collections.singleton("value"), null, null);
//        String[] values = ts.getArray(String.class);
//
//        long duration = (new Date().getTime()) - start.getTime();
//        if (duration > 6000)
//        {
//            _log.error("Found distinct categories for " + getName() + " in " + duration/1000 + " seconds");
//        }
//
//        return PageFlowUtil.set(values);
//    }

    @Override
    protected String getCategoryGroup(Results rs) throws SQLException
    {
        String category = rs.getString("category");
        return (category == null ?  "Clinical" : category);
    }

    @Override
    protected String getHtml(Results rs, boolean redacted) throws SQLException
    {
        StringBuilder sb = new StringBuilder();
        sb.append("<table>");

        if (!redacted)
        {
            appendNote(rs, "performedby", "<span style='white-space:nowrap'>Entered By</span>", sb);
        }

        appendNote(rs, "hx", "Hx", sb);
        appendNote(rs, "so", "S/O", sb);
        appendNote(rs, "s", "S", sb);
        appendNote(rs, "o", "O", sb);
        appendNote(rs, "a", "A", sb);
        appendNote(rs, "p", "P", sb);
        appendNote(rs, "p2", "P2", sb);
        appendNote(rs, "remark", "Other Remark", sb);

        sb.append("</table>");

        return sb.toString();
    }

    @Override
    protected Set<String> getColumnNames()
    {
        return PageFlowUtil.set("Id", "date", "enddate", "category", "hx", "so", "s", "o", "a", "p", "p2", "remark", "performedby");
    }

    private void appendNote(Results rs, String field, String label, StringBuilder sb) throws SQLException
    {
        if (rs.hasColumn(FieldKey.fromString(field)) && rs.getObject(FieldKey.fromString(field)) != null)
        {
            sb.append("<tr style='vertical-align:top;margin-bottom: 5px;'><td style='padding-right: 5px;'>" + label + ":</td><td>");
            sb.append(rs.getString(FieldKey.fromString(field)));
            sb.append("</td></tr>");
        }
    }
}
