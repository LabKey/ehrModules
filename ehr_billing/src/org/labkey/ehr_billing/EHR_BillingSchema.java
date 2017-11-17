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

import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbSchemaType;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.dialect.SqlDialect;

public class EHR_BillingSchema
{
    private static final EHR_BillingSchema _instance = new EHR_BillingSchema();

    //schema name
    public static final String NAME = "ehr_billing";

    //table names to expose via schema browser
    public static final String ALIASES_TABLE_NAME = "aliases";
    public static final String CHARGERATES_TABLE_NAME = "chargeRates";
    public static final String TABLE_INVOICE_RUNS = "invoiceRuns";
    public static final String TABLE_INVOICED_ITEMS = "invoicedItems";
    public static final String TABLE_MISC_CHARGES = "miscCharges";
    public static final String TABLE_CHARGEABLE_ITEMS = "chargeableItems";


    public static EHR_BillingSchema getInstance()
    {
        return _instance;
    }

    private EHR_BillingSchema()
    {
        // private constructor to prevent instantiation from
        // outside this class: this singleton should only be
        // accessed via org.labkey.ehr_billing.EHR_BillingSchema.getInstance()
    }

    public DbSchema getSchema()
    {
        return DbSchema.get(NAME, DbSchemaType.Module);
    }

    public SqlDialect getSqlDialect()
    {
        return getSchema().getSqlDialect();
    }

    public TableInfo getAliasesTable()
    {
        return getSchema().getTable(ALIASES_TABLE_NAME);
    }

    public TableInfo getChargeRatesTable()
    {
        return getSchema().getTable(CHARGERATES_TABLE_NAME);
    }

    public TableInfo getTableInvoiceRuns()
    {
        return getSchema().getTable(TABLE_INVOICE_RUNS);
    }

    public TableInfo getTableInvoiceItems()
    {
        return getSchema().getTable(TABLE_INVOICED_ITEMS);
    }

    public TableInfo getMiscCharges()
    {
        return getSchema().getTable(TABLE_MISC_CHARGES);
    }

    public TableInfo getChargeableItems()
    {
        return getSchema().getTable(TABLE_CHARGEABLE_ITEMS);
    }

}
