/*
 * Copyright (c) 2015-2017 LabKey Corporation
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
import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.ColumnInfo;

import java.util.Calendar;
import java.util.Date;

/**
 * User: bimber
 * Date: 10/23/13
 * Time: 3:49 PM
 */
public class AgeMonthsDisplayColumn extends AbstractAgeDisplayColumn
{
    public AgeMonthsDisplayColumn(ColumnInfo col)
    {
        super(col);
    }

    @Override
    protected String getFormattedDuration(@NotNull Calendar startDate, @NotNull Calendar endDate)
    {
        String monthDayPartFromUtil;
        try
        {
            monthDayPartFromUtil = DurationFormatUtils.formatPeriod(startDate.getTimeInMillis(), endDate.getTimeInMillis(), "M:d");
        }
        catch (IllegalArgumentException iae)
        {
            return "Error";
        }
        String[] monthDayParts = monthDayPartFromUtil.split(":");
        String monthPart = monthDayParts[0];
        String dayPart = monthDayParts[1];

        return monthPart + " month" + (monthPart.equals("1") ? "" : "s") + ", " + dayPart + " day" + (dayPart.equals("1") ? "" : "s");
    }
}
