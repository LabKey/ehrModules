/*
 * Copyright (c) 2017 LabKey Corporation
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
package org.labkey.ehr_billing;

import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.TableInfo;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.security.User;

public class EHR_BillingUserSchema extends SimpleUserSchema
{
    public EHR_BillingUserSchema(String name, @Nullable String description, User user, Container container, DbSchema dbschema)
    {
        super(name, description, user, container, dbschema);
    }

    public enum TableType
    {
        aliases
        {
            @Override
            public TableInfo createTable(EHR_BillingUserSchema schema)
            {
                SimpleUserSchema.SimpleTable<EHR_BillingUserSchema> table =
                        new SimpleUserSchema.SimpleTable<>(
                                schema, EHR_BillingSchema.getInstance().getAliasesTable()).init();

                return table;
            }
        },
        chargeRates
        {
            @Override
            public TableInfo createTable(EHR_BillingUserSchema schema)
            {
                SimpleUserSchema.SimpleTable<EHR_BillingUserSchema> table =
                        new SimpleUserSchema.SimpleTable<>(
                                schema, EHR_BillingSchema.getInstance().getChargeRatesTable()).init();

                return table;
            }
        },
        invoiceRuns
        {
            @Override
            public TableInfo createTable(EHR_BillingUserSchema schema)
            {
                SimpleUserSchema.SimpleTable<EHR_BillingUserSchema> table =
                        new SimpleUserSchema.SimpleTable<>(
                                schema, EHR_BillingSchema.getInstance().getTableInvoiceRuns()).init();
                return table;
            }
        },
        invoicedItems
        {
            @Override
            public TableInfo createTable(EHR_BillingUserSchema schema)
            {
                SimpleUserSchema.SimpleTable<EHR_BillingUserSchema> table =
                        new SimpleUserSchema.SimpleTable<>(
                                schema, EHR_BillingSchema.getInstance().getTableInvoiceItems()).init();
                return table;
            }
        }
        ,
        miscCharges
        {
            @Override
            public TableInfo createTable(EHR_BillingUserSchema schema)
            {
                SimpleUserSchema.SimpleTable<EHR_BillingUserSchema> table =
                        new SimpleUserSchema.SimpleTable<>(
                                schema, EHR_BillingSchema.getInstance().getMiscCharges()).init();
                return table;
            }
        }
        ,
        chargeableItems
        {
            @Override
            public TableInfo createTable(EHR_BillingUserSchema schema)
            {
                SimpleUserSchema.SimpleTable<EHR_BillingUserSchema> table =
                        new SimpleUserSchema.SimpleTable<>(
                                schema, EHR_BillingSchema.getInstance().getChargeableItems()).init();
                return table;
            }
        };

        public abstract TableInfo createTable(EHR_BillingUserSchema schema);
    }

    @Override
    @Nullable
    public TableInfo createTable(String name)
    {
        if (name != null)
        {
            TableType tableType = null;
            for (TableType t : TableType.values())
            {
                // Make the enum name lookup case insensitive
                if (t.name().equalsIgnoreCase(name))
                {
                    tableType = t;
                    break;
                }
            }
            if (tableType != null)
            {
                return tableType.createTable(this);
            }
        }
        return super.createTable(name);
    }
}