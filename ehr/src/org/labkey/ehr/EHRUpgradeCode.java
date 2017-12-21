/*
 * Copyright (c) 2016 LabKey Corporation
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

import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.PropertyManager;
import org.labkey.api.data.SqlExecutor;
import org.labkey.api.data.Table;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.UpgradeCode;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleContext;
import org.labkey.api.module.ModuleLoader;
import org.labkey.ehr.query.EHRLookupsUserSchema;

import java.util.Arrays;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class EHRUpgradeCode implements UpgradeCode
{
    /**
     * called at 16.20-16.30
     */
    @SuppressWarnings({"UnusedDeclaration"})
    public void populateCalendar(final ModuleContext moduleContext)
    {
        GregorianCalendar cal = new GregorianCalendar(1950, Calendar.JANUARY, 1, 0, 0, 0);
        cal.set(Calendar.MILLISECOND, 0);

        // Insert rows from January 1, 1950 to December 31, 2029
        while (cal.get(Calendar.YEAR) < 2030)
        {
            Map<String, Object> row = new HashMap<>();
            row.put("TargetDateTime", cal.getTime());
            row.put("TargetDate", cal.getTime());
            row.put("Year", cal.get(Calendar.YEAR));
            // java.util.Calendar months are 0-based
            row.put("Month", cal.get(Calendar.MONTH) + 1);
            row.put("Day", cal.get(Calendar.DAY_OF_MONTH));

            cal.add(Calendar.DATE, 1);
            row.put("DayAfter", cal.getTime());

            Table.insert(null, EHRSchema.getInstance().getEHRLookupsSchema().getTable("Calendar"), row);
        }
    }
    /**
     * called at 17.32-17.33
     */
    @SuppressWarnings({"UnusedDeclaration"})
    public void setEhrLookupsContainer(final ModuleContext moduleContext)
    {
        if (moduleContext.isNewInstall())
            return;

        Module module = ModuleLoader.getInstance().getModule(moduleContext.getName());
        String category = "moduleProperties." + module.getName();
        String ehrStudyContainerPath = PropertyManager.getCoalecedProperty(PropertyManager.SHARED_USER, ContainerManager.getRoot(), category, EHRManager.EHRStudyContainerPropName);
        if (ehrStudyContainerPath != null)
        {
            Container ehrStudyContainer = ContainerManager.getForPath(ehrStudyContainerPath);
            if (ehrStudyContainer != null)
            {
                List<String> tableNames = Arrays.asList(
                    EHRLookupsUserSchema.TABLE_GEOGRAPHIC_ORIGINS,
                    EHRLookupsUserSchema.TABLE_ROOMS,
                    EHRLookupsUserSchema.TABLE_BUILDINGS,
                    EHRLookupsUserSchema.TABLE_TREATMENT_CODES
                );

                DbSchema schema = EHRSchema.getInstance().getEHRLookupsSchema();
                for (String tableName : tableNames)
                {
                    TableInfo table = schema.getTable(tableName);
                    new SqlExecutor(schema).execute("UPDATE " + table + " SET Container = ? WHERE Container IS NULL", ehrStudyContainer);
                }
            }
        }
    }
}