package org.labkey.ehr.table;

import org.apache.commons.lang3.time.DurationFormatUtils;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.ehr.table.DurationColumn;

import java.util.Calendar;
import java.util.Date;

public class AgeYearMonthsDisplayColumn extends DurationColumn
{
    public AgeYearMonthsDisplayColumn(ColumnInfo col)
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

        String yearMonthPartFromUtil;
        try
        {
            yearMonthPartFromUtil = DurationFormatUtils.formatPeriod(birthCal.getTimeInMillis(), deathCal.getTimeInMillis(), "y:M");
        }
        catch (IllegalArgumentException iae)
        {
            return "Error";
        }
        String[] yearMonthParts = yearMonthPartFromUtil.split(":");
        String yearPart = yearMonthParts[0];
        String monthPart = yearMonthParts[1];

        return yearPart + " year" + (yearPart.equals("1") ? "" : "s") + ", " + monthPart + " month" + (monthPart.equals("1") ? "" : "s");
    }
}
