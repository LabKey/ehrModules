/*
 * Copyright (c) 2013-2014 LabKey Corporation
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
package org.labkey.ehr_compliancedb.query;

import org.labkey.api.data.AbstractTableInfo;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.JdbcType;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.TableCustomizer;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ldk.LDKService;
import org.labkey.api.query.DetailsURL;
import org.labkey.api.query.ExprColumn;
import org.labkey.api.query.QueryForeignKey;
import org.labkey.ehr_compliancedb.EHR_ComplianceDBModule;

/**
 * User: bimber
 * Date: 9/13/13
 * Time: 11:19 AM
 */
public class EHRComplianceTableCustomizer implements TableCustomizer
{
    public void customize(TableInfo table)
    {
        LDKService.get().getDefaultTableCustomizer().customize(table);

        if (table instanceof AbstractTableInfo)
        {
            if (table.getName().equalsIgnoreCase("employees") && table.getUserSchema().getName().equalsIgnoreCase(EHR_ComplianceDBModule.SCHEMA_NAME))
            {
                ((AbstractTableInfo) table).setDetailsURL(DetailsURL.fromString("/ehr_compliancedb/employeeDetails.view?employeeid=${employeeid}"));

                LDKService.get().appendCalculatedDateColumns((AbstractTableInfo)table, null, "enddate");

                addIsActiveCol((AbstractTableInfo) table);
            }
            else if (table.getName().equalsIgnoreCase("employees") && table.getUserSchema().getName().equalsIgnoreCase("EmployeeData"))
            {
                ((AbstractTableInfo) table).setDetailsURL(DetailsURL.fromString("/ehr_compliancedb/employeeDetailsPublic.view?employeeid=${employeeid}"));
            }
            else if (table.getName().equalsIgnoreCase("requirements") && table.getUserSchema().getName().equalsIgnoreCase(EHR_ComplianceDBModule.SCHEMA_NAME))
            {
                ((AbstractTableInfo) table).setDetailsURL(DetailsURL.fromString("/ehr_compliancedb/requirementDetails.view?requirementname=${requirementname}"));
            }

            doSharedCustomization((AbstractTableInfo) table);
        }
    }

    private void doSharedCustomization(AbstractTableInfo ti)
    {
        if (ti.getColumn("employeeid") != null && !ti.getName().equalsIgnoreCase("employees"))
        {
            ti.getColumn("employeeid").setFk(new QueryForeignKey(ti.getUserSchema(), null, "employees", "employeeid", "employeeid"));
        }

        if (ti.getColumn("requirementname") != null && !ti.getName().equalsIgnoreCase("requirements"))
        {
            ti.getColumn("requirementname").setFk(new QueryForeignKey(ti.getUserSchema(), null, "requirements", "requirementname", "requirementname"));
        }
    }

    private void addIsActiveCol(AbstractTableInfo ti)
    {
        String isActive = "isActive";
        ColumnInfo isActiveCol = ti.getColumn(isActive);
        if (isActiveCol == null)
        {
            SQLFragment sql = new SQLFragment("(CASE WHEN (" + ExprColumn.STR_TABLE_ALIAS + ".enddate IS NULL OR " + ExprColumn.STR_TABLE_ALIAS + ".enddate >= {fn curdate()}) THEN " + ti.getSqlDialect().getBooleanTRUE() + " ELSE " + ti.getSqlDialect().getBooleanFALSE() + " END)");
            ExprColumn newCol = new ExprColumn(ti, isActive, sql, JdbcType.BOOLEAN, ti.getColumn("enddate"));
            newCol.setLabel("Is Employee Active?");
            ti.addColumn(newCol);
        }
    }
}
