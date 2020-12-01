/*
 * Copyright (c) 2020 LabKey Corporation
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

import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbSchemaType;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.dialect.SqlDialect;

public class EHR_PurchasingSchema
{
    private static final EHR_PurchasingSchema _instance = new EHR_PurchasingSchema();

    public static final String NAME = "ehr_purchasing";//schema name

    //ehr_purchasing tables
    public static final String VENDOR_TABLE = "vendor";
    public static final String SHIPPINGINFO_TABLE = "shippingInfo";
    public static final String ITEM_UNITS_TABLE = "itemUnits";
    public static final String USER_ACCOUNT_ASSOCIATIONS_TABLE = "userAccountAssociations";
    public static final String LINE_ITEM_STATUS_TABLE = "lineItemStatus";
    public static final String LINE_ITEMS_TABLE = "lineItems";
    public static final String PURCHASING_REQUESTS_TABLE = "purchasingRequests";


    public static EHR_PurchasingSchema getInstance()
    {
        return _instance;
    }

    private EHR_PurchasingSchema()
    {
        // private constructor to prevent instantiation from
        // outside this class: this singleton should only be
        // accessed via org.labkey.ehr_purchasing.EHR_PurchasingSchema.getInstance()
    }

    public DbSchema getSchema()
    {
        return DbSchema.get(NAME, DbSchemaType.Module);
    }

    public SqlDialect getSqlDialect()
    {
        return getSchema().getSqlDialect();
    }

    public TableInfo getVendorTable()
    {
        return getSchema().getTable(VENDOR_TABLE);
    }

    public TableInfo getShippingInfoTable()
    {
        return getSchema().getTable(SHIPPINGINFO_TABLE);
    }

    public TableInfo getItemUnitsTable()
    {
        return getSchema().getTable(ITEM_UNITS_TABLE);
    }

    public TableInfo getUserAccountAssociationsTable()
    {
        return getSchema().getTable(USER_ACCOUNT_ASSOCIATIONS_TABLE);
    }

    public TableInfo getLineItemStatusTable()
    {
        return getSchema().getTable(LINE_ITEM_STATUS_TABLE);
    }

    public TableInfo getLineItemsTable()
    {
        return getSchema().getTable(LINE_ITEMS_TABLE);
    }

    public TableInfo getPurchasingRequestsTable()
    {
        return getSchema().getTable(PURCHASING_REQUESTS_TABLE);
    }
}
