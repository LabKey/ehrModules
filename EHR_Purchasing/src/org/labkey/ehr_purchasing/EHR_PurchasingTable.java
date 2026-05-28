/*
 * Copyright (c) 2023-2026 LabKey Corporation
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
package org.labkey.ehr_purchasing;

import org.labkey.api.data.ContainerFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.DatabaseTableType;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.query.SimpleQueryUpdateService;

public class EHR_PurchasingTable extends SimpleUserSchema.SimpleTable<EHR_PurchasingUserSchema>
{
    public EHR_PurchasingTable(EHR_PurchasingUserSchema schema, TableInfo table, ContainerFilter cf)
    {
        super(schema, table, cf);
    }

    @Override
    public QueryUpdateService getUpdateService()
    {
        if (!isReadOnly())
        {
            TableInfo table = getRealTable();
            if (table != null && table.getTableType() == DatabaseTableType.TABLE)
                return new SimpleQueryUpdateService(this, table)
                {
                    @Override
                    protected boolean supportUpdateUsingDIB()
                    {
                        // ehr_purchasing.purchasingRequests has a custom query definition in wnprc_purchusing that adds special calculated columns.
                        // The email notifications sent are dependent on those calculated columns, which aren't returned by updateRows using data iterator / prepared statement
                        return false;
                    }
                };
        }
        return null;
    }
}
