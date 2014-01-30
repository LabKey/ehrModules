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

import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.Results;
import org.labkey.api.data.ResultsImpl;
import org.labkey.api.data.Selector;
import org.labkey.api.data.TableSelector;
import org.labkey.api.ehr.history.AbstractDataSource;
import org.labkey.api.ehr.history.HistoryRow;
import org.labkey.api.ehr.history.HistoryRowImpl;
import org.labkey.api.gwt.client.util.StringUtils;
import org.labkey.api.query.FieldKey;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.ehr.EHRManager;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * User: bimber
 * Date: 2/17/13
 * Time: 4:52 PM
 */
public class DefaultObservationsDataSource extends AbstractDataSource
{
    public DefaultObservationsDataSource()
    {
        super("study", "clinical_observations", "Observations", "Clinical");
    }

    @Override
    protected List<HistoryRow> processRows(TableSelector ts, final boolean redacted, final Collection<ColumnInfo> cols)
    {
        final Map<String, List<Map<String, Object>>> idMap = new HashMap<>();
        ts.forEach(new Selector.ForEachBlock<ResultSet>()
        {
            @Override
            public void exec(ResultSet rs) throws SQLException
            {
                Results results = new ResultsImpl(rs, cols);

                String html = getObservationLine(results, redacted);
                if (!StringUtils.isEmpty(html))
                {
                    Map<String, Object> rowMap = new CaseInsensitiveHashMap<>();

                    rowMap.put("date", results.getTimestamp(getDateField()));
                    rowMap.put("categoryText", getCategoryText(results));
                    rowMap.put("categoryGroup", getPrimaryGroup(results));
                    rowMap.put("performedBy", results.getString(FieldKey.fromString("performedby")));
                    rowMap.put("qcStateLabel", results.getString(FieldKey.fromString("qcState/Label")));
                    rowMap.put("publicData", results.getBoolean(FieldKey.fromString("qcState/PublicData")));
                    rowMap.put("subjectId", results.getString(FieldKey.fromString(_subjectIdField)));
                    rowMap.put("html", html);

                    String key = results.getString(FieldKey.fromString("taskid")) + "||" + rowMap.get("Id") + "||" + rowMap.get("categoryText") + "||" + rowMap.get("categoryGroup") + "||" + rowMap.get("date").toString();
                    List<Map<String, Object>> obsRows = idMap.get(key);
                    if (obsRows == null)
                        obsRows = new ArrayList<>();

                    obsRows.add(rowMap);
                    idMap.put(key, obsRows);
                }
            }
        });

        List<HistoryRow> rows = new ArrayList<HistoryRow>();
        for (String key : idMap.keySet())
        {
            List<Map<String, Object>> toAdd = idMap.get(key);

            Date date = null;
            String subjectId = null;
            String categoryGroup = null;
            String categoryText = null;
            String performedBy = null;
            String qcStateLabel = null;
            Boolean publicData = null;
            StringBuilder html = new StringBuilder();

            for (Map<String, Object> rowMap : toAdd)
            {
                date = (Date)rowMap.get("date");
                subjectId = (String)rowMap.get("subjectId");
                performedBy = (String)rowMap.get("performedBy");
                categoryText = (String)rowMap.get("categoryText");
                categoryGroup = (String)rowMap.get("categoryGroup");
                qcStateLabel = (String)rowMap.get("qcStateLabel");
                publicData = (Boolean)rowMap.get("publicData");

                html.append(rowMap.get("html"));
            }

            if (performedBy != null && !redacted)
            {
                html.append("Performed By: ").append(performedBy).append("\n");
            }

            HistoryRow row = new HistoryRowImpl(categoryText, categoryGroup, subjectId, date, html.toString(), qcStateLabel, publicData);
            if (row != null)
                rows.add(row);
        }

        return rows;
    }

    private String getObservationLine(Results rs, boolean redacted) throws SQLException
    {
        StringBuilder sb = new StringBuilder();

        String category = rs.getString(FieldKey.fromString("category"));
        if (category == null || EHRManager.OBS_REVIEWED.equals(category) || EHRManager.VET_ATTENTION.equals(category))
        {
            return null;
        }

        //note: the following is added as 1 line
        sb.append(category).append(": ");

        String area = rs.getString(FieldKey.fromString("area"));
        if (area != null && !"N/A".equalsIgnoreCase(area))
        {
            sb.append(area).append(", ");
        }

        if (rs.getString(FieldKey.fromString("observation")) != null)
            sb.append(rs.getString(FieldKey.fromString("observation")));

        if (rs.getString(FieldKey.fromString("remark")) != null)
        {
            if (sb.length() > 0)
                sb.append(".  ");
            sb.append(rs.getString(FieldKey.fromString("remark")));
        }

        if (sb.length() > 0)
            sb.append("\n");

        return sb.toString();
    }

    @Override
    protected String getHtml(Results rs, boolean redacted) throws SQLException
    {
        throw new UnsupportedOperationException("This should not be called");
    }

    @Override
    protected Set<String> getColumnNames()
    {
        return PageFlowUtil.set("Id", "date", "category", "area", "observation", "remark", "performedby", "objectid");
    }
}
