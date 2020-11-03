/*
 * Copyright (c) 2017-2019 LabKey Corporation
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
import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.DataColumn;
import org.labkey.api.data.RenderContext;
import org.labkey.api.query.FieldKey;
import org.labkey.api.util.HtmlString;

import java.util.Calendar;
import java.util.Date;
import java.util.Set;

/**
 * Uses separate start and end date columns to determine the difference between the dates and renders in a requested format.
 */
public class DurationColumn extends DataColumn
{

    protected final String _startDateColumn;
    protected final String _endDateColumn;
    private final String _durationFormat;

    private boolean _dropTime;

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

    /** Treat all times as if they were at midnight of the same day */
    public void setDropTime(boolean dropTime)
    {
        _dropTime = dropTime;
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
        Date startDate = (Date)ctx.get(getMappedFieldKey(_startDateColumn));
        Date endDate = (Date)ctx.get(getMappedFieldKey(_endDateColumn));

        return getFormattedDuration(startDate, endDate);
    }

    private void dropTime(@NotNull Calendar cal)
    {
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
    }

    /** Convert from dates to calendars, dealing with nulls */
    public final String getFormattedDuration(@Nullable Date startDate, @Nullable Date endDate)
    {
        if (startDate == null)
            return null;

        Calendar startCal = Calendar.getInstance();
        startCal.setTime(startDate);

        Calendar endCal = Calendar.getInstance();
        endCal.setTime(endDate == null ? new Date() : endDate);

        if (_dropTime)
        {
            // Snap to midnight so that days work based on calendar day instead of 24-hour periods
            dropTime(startCal);
            dropTime(endCal);
        }
        return getFormattedDuration(startCal, endCal);
    }

    protected String getFormattedDuration(@NotNull Calendar startCal, @NotNull Calendar endCal)
    {
        if (_durationFormat == null)
            return null;

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
    public HtmlString getFormattedHtml(RenderContext ctx)
    {
        Object val = getDisplayValue(ctx);
        return val == null ? HtmlString.EMPTY_STRING : HtmlString.of(val.toString());
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
}
