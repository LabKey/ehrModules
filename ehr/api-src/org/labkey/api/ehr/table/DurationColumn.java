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

public class DurationColumn extends DataColumn
{

    String _startDateColumn;
    String _endDateColumn;

    public DurationColumn(ColumnInfo col, String startDateColumn, String endDateColumn)
    {
        super(col);
        _startDateColumn = startDateColumn;
        _endDateColumn = endDateColumn;
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
        return DurationColumn.getFormattedDuration((Date)ctx.get(getMappedFieldKey(_startDateColumn)), (Date)ctx.get(getMappedFieldKey(_endDateColumn)));
    }

    private static String getFormattedDuration(Date startDate, Date endDate)
    {
        if (startDate == null)
            return null;

        Calendar birthCal = Calendar.getInstance();
        birthCal.setTime(startDate);

        Calendar deathCal = Calendar.getInstance();
        deathCal.setTime(endDate == null ? new Date() : endDate);

        String dayPartFromUtil;
        try
        {
            dayPartFromUtil = DurationFormatUtils.formatPeriod(birthCal.getTimeInMillis(), deathCal.getTimeInMillis(), "yy:MM:dd");
        }
        catch (IllegalArgumentException iae)
        {
            return "Error";
        }

        return dayPartFromUtil;
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
