package org.labkey.ehr.table;

import org.apache.commons.lang3.time.DurationFormatUtils;
import org.labkey.api.data.ColumnInfo;
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
    protected String getFormattedDuration(Date startDate, Date endDate)
    {
        if (startDate == null)
            return null;

        Calendar birthCal = Calendar.getInstance();
        birthCal.setTime(startDate);

        Calendar deathCal = Calendar.getInstance();
        deathCal.setTime(endDate == null ? new Date() : endDate);

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
