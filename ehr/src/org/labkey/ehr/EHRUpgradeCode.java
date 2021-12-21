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
package org.labkey.ehr;

import org.labkey.api.data.DbScope;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.UpgradeCode;
import org.labkey.api.module.ModuleContext;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.Calendar;
import java.util.GregorianCalendar;

public class EHRUpgradeCode implements UpgradeCode
{
    /**
     * called at every bootstrap to initialize the calendar
     */
    @SuppressWarnings({"UnusedDeclaration"})
    public void populateCalendar(final ModuleContext moduleContext) throws SQLException
    {
        GregorianCalendar cal = new GregorianCalendar(1950, Calendar.JANUARY, 1, 0, 0, 0);
        cal.set(Calendar.MILLISECOND, 0);

        // Insert rows from January 1, 1950 to December 31, 2029
        TableInfo calendar = EHRSchema.getInstance().getEHRLookupsSchema().getTable("Calendar");

        try (DbScope.Transaction transaction = calendar.getSchema().getScope().ensureTransaction();
             PreparedStatement stmt = transaction.getConnection().prepareStatement(
                "INSERT INTO ehr_lookups.calendar\n" +
                        "\t(TargetDateTime, TargetDate, Year, Month, Day, DayAfter)\n" +
                        "\tVALUES (?, ?, ?, ?, ?, ?)");)
        {
            while (cal.get(Calendar.YEAR) < 2030)
            {
                stmt.setDate(1, new Date(cal.getTime().getTime()));
                stmt.setDate(2, new Date(cal.getTime().getTime()));
                stmt.setInt(3, cal.get(Calendar.YEAR));
                // java.util.Calendar months are 0-based
                stmt.setInt(4, cal.get(Calendar.MONTH) + 1);
                stmt.setInt(5, cal.get(Calendar.DAY_OF_MONTH));

                cal.add(Calendar.DATE, 1);
                stmt.setDate(6, new Date(cal.getTime().getTime()));

                stmt.addBatch();
            }
            stmt.executeBatch();
            transaction.commit();
        }
    }
}