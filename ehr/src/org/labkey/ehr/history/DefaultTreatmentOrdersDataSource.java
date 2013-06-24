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
import java.util.Date;
import java.util.Set;

/**
 * User: bimber
 * Date: 2/17/13
 * Time: 4:52 PM
 */
public class DefaultTreatmentOrdersDataSource extends AbstractDataSource
{
    public DefaultTreatmentOrdersDataSource()
    {
        super("study", "Treatment Orders", "Medication Ordered", "Clinical");
    }

    @Override
    protected String getHtml(Results rs, boolean redacted) throws SQLException
    {
        StringBuilder sb = new StringBuilder();
        sb.append(snomedToString(rs, FieldKey.fromString("code"), FieldKey.fromString("code/meaning")));
        sb.append(safeAppend(rs, "Frequency", "frequency/meaning"));
        sb.append(safeAppend(rs, "Reason", "reason"));
        sb.append(safeAppend(rs, "Route", "route"));

        //TODO: conditional based on whether it has ended or not?  maybe a note for 'ending in X days?'

        if (rs.hasColumn(FieldKey.fromString("duration")) && rs.getObject("duration") != null)
        {
            int duration = rs.getInt("duration");

            //for single day treatments, we will have the record of the order, plus a medication given, so we skip the treatment in the list
            if (duration >= 1)
                return null;

            sb.append("Duration: ").append(duration == 0 ? 1 : duration).append(" days").append("\n");
        }

        if (rs.hasColumn(FieldKey.fromString("concentration")) && rs.getObject("concentration") != null)
        {
            sb.append("Concentration: " + rs.getString("concentration"));

            if (rs.hasColumn(FieldKey.fromString("conc_units")) && rs.getObject("conc_units") != null)
            {
                sb.append(" " + rs.getString("conc_units"));
            }

            sb.append("\n");
        }

        if (rs.hasColumn(FieldKey.fromString("dosage")) && rs.getObject("dosage") != null)
        {
            sb.append("Dosage: " + rs.getString("dosage"));

            if (rs.hasColumn(FieldKey.fromString("dosage_units")) && rs.getObject("dosage_units") != null)
                sb.append(" " + rs.getString("dosage_units"));

            sb.append("\n");
        }

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
    protected String getCategoryText(Results rs) throws SQLException
    {
        String category = rs.getString("category");
        return category == null ?  "Medication Ordered" : category + " Medication Ordered";
    }

    @Override
    protected HistoryRowImpl createHistoryRow(Results results, String categoryText, String categoryGroup, String subjectId, Date date, String html) throws SQLException
    {
        HistoryRowImpl row = (HistoryRowImpl)super.createHistoryRow(results, categoryText, categoryGroup, subjectId, date, html);
        if (row != null)
            row.setShowTime(true);

        return row;
    }

    @Override
    protected String getCategoryGroup(Results rs) throws SQLException
    {
        String category = rs.getString("category");
        return category == null ?  "Clinical" : category;
    }

    @Override
    protected Set<String> getColumnNames()
    {
        return PageFlowUtil.set("Id", "date", "enddate", "route", "volume", "vol_units", "amount", "amount_units", "code", "code/meaning", "duration", "frequency/meaning", "category");
    }
}
