package org.labkey.ehr.table;

import org.apache.commons.lang3.time.DurationFormatUtils;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.RenderContext;
import org.labkey.api.ehr.table.DurationColumn;

import java.util.Calendar;
import java.util.Date;

public class AgeYearsMonthsDaysDisplayColumn extends DurationColumn
{
    public AgeYearsMonthsDaysDisplayColumn(ColumnInfo col)
    {
        super(col, "birth", "death");
    }

    @Override
    public Object getDisplayValue(RenderContext ctx)
    {
        return AgeYearsMonthsDaysDisplayColumn.getFormattedAge((Date)ctx.get(getMappedFieldKey(getStartDateColumn())), (Date)ctx.get(getMappedFieldKey(getEndDateColumn())));
    }

    private static String getFormattedAge(Date birth, Date death)
    {
        if (birth == null)
            return null;

        Calendar birthCal = Calendar.getInstance();
        birthCal.setTime(birth);

        Calendar deathCal = Calendar.getInstance();
        deathCal.setTime(death == null ? new Date() : death);

        String formattedAge;
        try
        {
            formattedAge = DurationFormatUtils.formatPeriod(birthCal.getTimeInMillis(), deathCal.getTimeInMillis(), "yy:MM:dd");
        }
        catch (IllegalArgumentException iae)
        {
            return "Error";
        }

        return formattedAge;
    }
}
