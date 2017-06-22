/*
 * Copyright (c) 2017 LabKey Corporation
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
package org.labkey.api.ehr.table;

import org.apache.commons.lang3.time.DurationFormatUtils;
import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.DataColumn;
import org.labkey.api.data.RenderContext;
import org.labkey.api.query.FieldKey;

import java.util.Calendar;
import java.util.Date;
import java.util.Set;

/**
 * Uses separate start and end date columns to determine the difference between the dates and renders in a requested format.
 */
public class DurationColumn extends DataColumn
{

    String _startDateColumn;
    String _endDateColumn;
    private String _durationFormat;

    public DurationColumn(ColumnInfo col, String startDateColumn, String endDateColumn)
    {
        this(col, startDateColumn, endDateColumn, null);
    }

    public DurationColumn(ColumnInfo col, String startDateColumn, String endDateColumn, String durationFormat)
    {
        super(col);
        _startDateColumn = startDateColumn;
        _endDateColumn = endDateColumn;
        _durationFormat = durationFormat;
    }

    @Override
    public Class getDisplayValueClass()
    {
        //NOTE: this is required in order to get excel to output correctly
        //the raw value is numeric, but the displayValue is text
        return String.class;
    }

    @Override
    public Object getDisplayValue(RenderContext ctx)
    {
        return getFormattedDuration((Date)ctx.get(getMappedFieldKey(_startDateColumn)), (Date)ctx.get(getMappedFieldKey(_endDateColumn)));
    }

    protected String getFormattedDuration(Date startDate, Date endDate)
    {
        if (startDate == null || _durationFormat == null)
            return null;

        Calendar startCal = Calendar.getInstance();
        startCal.setTime(startDate);

        Calendar endCal = Calendar.getInstance();
        endCal.setTime(endDate == null ? new Date() : endDate);

        String formattedDuration;
        try
        {
            formattedDuration = DurationFormatUtils.formatPeriod(startCal.getTimeInMillis(), endCal.getTimeInMillis(), _durationFormat);
        }
        catch (IllegalArgumentException iae)
        {
            return "Error";
        }

        return formattedDuration;
    }

    @Override @NotNull
    public String getFormattedValue(RenderContext ctx)
    {
        Object val = getDisplayValue(ctx);
        return val == null ? "" : val.toString();
    }

    @Override
    public void addQueryFieldKeys(Set<FieldKey> keys)
    {
        super.addQueryFieldKeys(keys);

        keys.add(getMappedFieldKey(_startDateColumn));
        keys.add(getMappedFieldKey(_endDateColumn));
    }

    @Override
    public boolean isFilterable()
    {
        return false;
    }

    protected FieldKey getMappedFieldKey(String colName)
    {
        return new FieldKey(getBoundColumn().getFieldKey().getParent(), colName);
    }

    public String getStartDateColumn()
    {
        return _startDateColumn;
    }

    public void setStartDateColumn(String startDateColumn)
    {
        _startDateColumn = startDateColumn;
    }

    public String getEndDateColumn()
    {
        return _endDateColumn;
    }

    public void setEndDateColumn(String endDateColumn)
    {
        _endDateColumn = endDateColumn;
    }
}
