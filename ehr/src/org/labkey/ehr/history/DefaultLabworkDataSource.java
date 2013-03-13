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

import org.apache.commons.lang3.StringUtils;
import org.labkey.api.data.Container;
import org.labkey.api.data.Results;
import org.labkey.api.ehr.HistoryRow;
import org.labkey.api.query.FieldKey;
import org.labkey.api.security.User;
import org.labkey.api.util.PageFlowUtil;

import java.sql.SQLException;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 2/17/13
 * Time: 4:52 PM
 */
public class DefaultLabworkDataSource extends AbstractDataSource
{
    private Map<String, List<String>> _results;

    public DefaultLabworkDataSource()
    {
        super("study", "Clinpath Runs", "Labwork");
    }

    @Override
    protected String getHtml(Results rs) throws SQLException
    {
        StringBuilder sb = new StringBuilder();

        sb.append(safeAppend(rs, "Type", "type"));
        sb.append(safeAppend(rs, "Sample Type", "sampletype"));
        sb.append(safeAppend(rs, "Collection Method", "collectionMethod"));

        String runId = rs.getString("objectid");
        if (runId != null)
        {
            List<String> results = _results.get(runId);
            if (results != null)
            {
                sb.append("Results:\n");
                sb.append("<div style='margin-top:3px;'>");
                sb.append(StringUtils.join(results, "\n"));
                sb.append("</div>");
            }
        }

        return sb.toString();
    }

    @Override
    protected Set<String> getColumnNames()
    {
        return PageFlowUtil.set("Id", "date", "enddate", "objectid", "type", "sampletype", "collectionmethod");
    }

    @Override
    public List<HistoryRow> getRows(Container c, User u, final String subjectId, Date minDate, Date maxDate)
    {
        Date start = new Date();

        long duration = ((new Date()).getTime() - start.getTime()) / 1000;
        if (duration > 3)
            _log.error("Loaded lab results for: " + subjectId + " in " + duration + " seconds");

        _results = LabworkManager.get().getResults(c, u, subjectId, minDate, maxDate);

        return super.getRows(c, u, subjectId, minDate, maxDate);

    }
}
