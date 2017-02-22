package org.labkey.ehr.table;

import org.apache.commons.lang3.time.DurationFormatUtils;
import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.DataColumn;
import org.labkey.api.data.RenderContext;
import org.labkey.api.query.FieldKey;

import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.Set;

public class AgeYearsMonthsDaysDisplayColumn extends DataColumn
{

    public AgeYearsMonthsDaysDisplayColumn(ColumnInfo col)
    {
        super(col);
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
        return getFormattedAge((Date)ctx.get(getMappedFieldKey("birth")), (Date)ctx.get(getMappedFieldKey("death")));
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

        keys.add(getMappedFieldKey("birth"));
        keys.add(getMappedFieldKey("death"));
    }

    @Override
    public boolean isFilterable()
    {
        return false;
    }

    private FieldKey getMappedFieldKey(String colName)
    {
        return new FieldKey(getBoundColumn().getFieldKey().getParent(), colName);
    }

    private String getFormattedAge(Date birth, Date death)
    {
        if (birth == null)
            return null;

        Calendar birthCal = Calendar.getInstance();
        birthCal.setTime(birth);

        Calendar deathCal = new GregorianCalendar();
        deathCal.setTime(death == null ? new Date() : death);

        String dayPartFromUtil = DurationFormatUtils.formatPeriod(birthCal.getTimeInMillis(),deathCal.getTimeInMillis(),  "yy:MM:dd");

        return dayPartFromUtil;
    }
}
