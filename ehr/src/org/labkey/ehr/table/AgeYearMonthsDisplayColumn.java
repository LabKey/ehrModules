/*
 * Copyright (c) 2016-2019 LabKey Corporation
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

public class AgeYearMonthsDisplayColumn extends AbstractAgeDisplayColumn
{
    public AgeYearMonthsDisplayColumn(ColumnInfo col)
    {
        super(col);
    }

    @Override
    protected String getFormattedDuration(@NotNull Calendar birthCal, @NotNull Calendar deathCal)
    {
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
