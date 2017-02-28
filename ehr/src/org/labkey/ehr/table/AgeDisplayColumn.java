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
package org.labkey.ehr.table;

import org.apache.commons.lang3.time.DurationFormatUtils;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.RenderContext;
import org.labkey.api.ehr.table.DurationColumn;

import java.util.Calendar;
import java.util.Date;

/**
 * User: bimber
 * Date: 10/23/13
 * Time: 3:49 PM
 */
public class AgeDisplayColumn extends DurationColumn
{
    public AgeDisplayColumn(ColumnInfo col)
    {
        super(col, "birth", "death");
    }

    @Override
    public Object getDisplayValue(RenderContext ctx)
    {
        return AgeDisplayColumn.getFormattedDuration((Date)ctx.get(getMappedFieldKey(getStartDateColumn())), (Date)ctx.get(getMappedFieldKey(getEndDateColumn())));
    }

    public static String getFormattedAge(Date birth, Date death)
    {
        return AgeDisplayColumn.getFormattedDuration(birth, death);
    }

    private static String getFormattedDuration(Date startDate, Date endDate)
    {
        if (startDate == null)
            return null;

        Calendar birthCal = Calendar.getInstance();
        birthCal.setTime(startDate);

        Calendar deathCal = Calendar.getInstance();
        deathCal.setTime(endDate == null ? new Date() : endDate);

        String yearMonthPartFromUtil;
        String yearDayPartFromUtil;
        try
        {
            // formatPeriod can sometimes add a year erroneously when an "M" format component is not present (!), so add an "M" and remove it later
            yearMonthPartFromUtil = DurationFormatUtils.formatPeriod(birthCal.getTimeInMillis(), deathCal.getTimeInMillis(), "y:M");
            // need to grab day part separately to be mod 366, and not mod 12 (which it would be in the previous line)
            yearDayPartFromUtil = DurationFormatUtils.formatPeriod(birthCal.getTimeInMillis(), deathCal.getTimeInMillis(), "y:d");
        }
        catch (IllegalArgumentException iae)
        {
            return "Error";
        }
        String yearPart = yearMonthPartFromUtil.split(":")[0];
        String dayPart = yearDayPartFromUtil.split(":")[1];

        return yearPart + " year" + (yearPart.equals("1") ? "" : "s") + ", " + dayPart + " day" + (dayPart.equals("1") ? "" : "s");
    }
}
