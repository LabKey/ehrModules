/*
 * Copyright (c) 2019-2026 LabKey Corporation
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
package org.labkey.ehr_billing.table;

import org.labkey.api.data.AbstractTableInfo;
import org.labkey.api.data.JdbcType;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ldk.table.AbstractTableCustomizer;
import org.labkey.api.query.ExprColumn;

/** Applies metadata to EHR billing queries, and injects calculated columns via SQL expressions */
public class EHR_BillingCustomizer extends AbstractTableCustomizer
{
    @Override
    public void customize(TableInfo table)
    {
        if (table instanceof AbstractTableInfo)
        {
            if (matches(table, "ehr_billing", "aliases"))
            {
                customizeAliases((AbstractTableInfo) table);
            }
        }
    }

    private void customizeAliases(AbstractTableInfo ti)
    {
        String name = "isActive";
        if (ti.getColumn(name) == null)
        {
            SQLFragment sql = getIsActiveSql(ti);
            ExprColumn col = new ExprColumn(ti, name, sql, JdbcType.BOOLEAN, ti.getColumn("budgetStartDate"), ti.getColumn("budgetEndDate"));
            col.setLabel("Is Active?");
            col.setUserEditable(false);
            col.setFormat("Y;N;");
            ti.addColumn(col);
        }
    }

    private SQLFragment getIsActiveSql(AbstractTableInfo ti)
    {
        return new SQLFragment("(CASE " +
                // when the start is in the future, using whole-day increments, it is not active
                " WHEN (CAST(" + ExprColumn.STR_TABLE_ALIAS + ".budgetStartDate as DATE) > {fn curdate()}) THEN " + ti.getSqlDialect().getBooleanFALSE() + "\n" +
                // when enddate is null, it is active
                " WHEN (" + ExprColumn.STR_TABLE_ALIAS + ".budgetEndDate IS NULL) THEN " + ti.getSqlDialect().getBooleanTRUE() + "\n" +
                // if enddate is in the future (whole-day increments), then it is active
                " WHEN (CAST(" + ExprColumn.STR_TABLE_ALIAS + ".budgetEndDate AS DATE) >= {fn curdate()}) THEN " + ti.getSqlDialect().getBooleanTRUE() + "\n" +
                " ELSE " + ti.getSqlDialect().getBooleanFALSE() + "\n" +
                " END)");
    }
}