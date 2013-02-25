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

import org.labkey.api.data.CompareType;
import org.labkey.api.data.Results;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.query.FieldKey;

import java.sql.SQLException;
import java.util.Date;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 2/17/13
 * Time: 4:52 PM
 */
public class DefaultProblemListCloseDataSource extends AbstractDataSource
{
    public DefaultProblemListCloseDataSource()
    {
        super("study", "Problem List", "Problem Closed");
    }

    @Override
    protected String getHtml(Results rs) throws SQLException
    {
        StringBuilder sb = new StringBuilder();

        sb.append(safeAppend(rs, "Category", "category"));

        return sb.toString();
    }

    @Override
    protected String getDateField()
    {
        return "enddate";
    }

    @Override
    protected SimpleFilter getFilter(String subjectId, Date minDate, Date maxDate)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("id"), subjectId);

        if (minDate != null)
            filter.addCondition(FieldKey.fromString(getDateField()), minDate, CompareType.DATE_GTE);

        if (maxDate != null)
            filter.addCondition(FieldKey.fromString(getDateField()), maxDate, CompareType.DATE_LTE);

        filter.addCondition(FieldKey.fromString(getDateField()), null, CompareType.NONBLANK);

        return filter;
    }
}

