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

// CONSIDER
//        PreparedStatement stmt = schema.getScope().getConnection().prepareStatement(
//                "INSERT INTO ehr_lookups.calendar\n" +
//                        "\t(TargetDateTime, TargetDate, Year, Month, Day, DayAfter)\n" +
//                        "\tVALUES (?, ?, ?, ?, ?, ?)");
//        stmt.addBatch();

        // Insert rows from January 1, 1950 to December 31, 2029
        TableInfo calendar = EHRSchema.getInstance().getEHRLookupsSchema().getTable("Calendar");
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

            Table.insert(null, calendar, row);
        }
    }

    private void setContainerColumn(ModuleContext moduleContext, List<String> tableNames, DbSchema schema)
    {
        if (moduleContext.isNewInstall())
            return;

        Module module = ModuleLoader.getInstance().getModule(moduleContext.getName());
        String category = "moduleProperties." + module.getName();
        String ehrStudyContainerPath = PropertyManager.getCoalescedProperty(PropertyManager.SHARED_USER, ContainerManager.getRoot(), category, EHRManager.EHRStudyContainerPropName);

        if (ehrStudyContainerPath != null)
        {
            Container ehrStudyContainer = ContainerManager.getForPath(ehrStudyContainerPath);
            for (String tableName : tableNames)
            {
                TableInfo table = schema.getTable(tableName);
                new SqlExecutor(schema).execute("UPDATE " + table + " SET Container = ? WHERE Container IS NULL", ehrStudyContainer);
            }
        }
    }

    /**
     * called at ehr_lookups-17.30-18.10
     */
    @SuppressWarnings({"UnusedDeclaration"})
    public void setEhrLookupsContainerFirstSet(final ModuleContext moduleContext)
    {
        List<String> ehrLookupsTableNames = Arrays.asList(
                EHRLookupsUserSchema.TABLE_GEOGRAPHIC_ORIGINS,
                EHRLookupsUserSchema.TABLE_ROOMS,
                EHRLookupsUserSchema.TABLE_BUILDINGS,
                EHRLookupsUserSchema.TABLE_TREATMENT_CODES);

        DbSchema ehrLookupsSchema = EHRSchema.getInstance().getEHRLookupsSchema();
        setContainerColumn(moduleContext, ehrLookupsTableNames, ehrLookupsSchema);
    }


    /**
     * called at ehr_lookups-18.10-18.20
     */
    @SuppressWarnings({"UnusedDeclaration"})
    public void setEhrLookupsContainerSecondSet(final ModuleContext moduleContext)
    {
        List<String> ehrLookupsTableNames = Arrays.asList(
                        "ageclass",
                        "amount_units",
                        "areas",
                        "billingtypes",
                        "blood_draw_services",
                        "blood_draw_tube_type",
                        "blood_tube_volumes",
                        "cage",
                        "cage_positions",
                        "cage_type",
                        "cageclass",
                        "calculated_status_codes",
                        "clinpath_status",
                        "clinpath_tests",
                        "conc_units",
                        "death_remarks",
                        "disallowed_medications",
                        "divider_types",
                        "dosage_units",
                        "drug_defaults",
                        "flag_categories",
                        "full_snomed",
                        "gender_codes",
                        "lab_test_range",
                        "lab_tests",
                        "labwork_panels",
                        "labwork_services",
                        "labwork_types",
                        "note_types",
                        "parentageTypes",
                        "procedure_default_charges",
                        "procedure_default_codes",
                        "procedure_default_comments",
                        "procedure_default_flags",
                        "procedure_default_treatments",
                        "procedures",
                        "project_types",
                        "relationshipTypes",
                        "request_priority",
                        "restraint_type",
                        "routes",
                        "snomap",
                        "source",
                        "species",
                        "species_codes",
                        "treatment_frequency",
                        "treatment_frequency_times",
                        "usda_codes",
                        "usda_levels",
                        "volume_units",
                        "weight_ranges"
                );

                DbSchema ehrLookupsSchema = EHRSchema.getInstance().getEHRLookupsSchema();
                setContainerColumn(moduleContext, ehrLookupsTableNames, ehrLookupsSchema);
    }

    /**
     * called at ehr_lookups-18.10-18.20
     */
    @SuppressWarnings({"UnusedDeclaration"})
    public void setEhrContainerFirstSet(final ModuleContext moduleContext)
    {
        List<String> ehrTableNames = Arrays.asList(
                "protocolProcedures",
                "scheduled_task_types"
        );

        DbSchema ehrSchema = EHRSchema.getInstance().getSchema();
        setContainerColumn(moduleContext, ehrTableNames, ehrSchema);
    }

}