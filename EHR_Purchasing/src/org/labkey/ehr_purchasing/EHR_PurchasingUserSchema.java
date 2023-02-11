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

import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerFilter;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.UpdatePermission;

/**
 * Exposes tables to be viewed from a schema browser (including extended tables).
 */
public class EHR_PurchasingUserSchema extends SimpleUserSchema
{
    public EHR_PurchasingUserSchema(String name, User user, Container container)
    {
        super(name, "Tables shared across ehr purchasing implementations for multiple centers", user, container, EHR_PurchasingSchema.getInstance().getSchema());
    }

    public enum TableType
    {
        vendor
        {
            @Override
            public TableInfo createTable(EHR_PurchasingUserSchema schema, ContainerFilter cf)
            {
                return new EHR_PurchasingTable(schema, EHR_PurchasingSchema.getInstance().getVendorTable(), cf).init();
            }
        },
        shippingInfo
        {
            @Override
            public TableInfo createTable(EHR_PurchasingUserSchema schema, ContainerFilter cf)
            {
                return new EHR_PurchasingTable(schema, EHR_PurchasingSchema.getInstance().getShippingInfoTable(), cf).init();
            }
        },
        units
        {
            @Override
            public TableInfo createTable(EHR_PurchasingUserSchema schema, ContainerFilter cf)
            {
                return new EHR_PurchasingTable(schema, EHR_PurchasingSchema.getInstance().getItemUnitsTable(), cf).init();
            }
        },
        userAccountAssociations
        {
            @Override
            public TableInfo createTable(EHR_PurchasingUserSchema schema, ContainerFilter cf)
            {
                return new EHR_PurchasingTable(schema, EHR_PurchasingSchema.getInstance().getUserAccountAssociationsTable(), cf).init();
            }
        },
        lineItemStatus
        {
            @Override
            public TableInfo createTable(EHR_PurchasingUserSchema schema, ContainerFilter cf)
            {
                return new EHR_PurchasingTable(schema, EHR_PurchasingSchema.getInstance().getLineItemStatusTable(), cf).init();
            }
        },
        lineItems
        {
            @Override
            public TableInfo createTable(EHR_PurchasingUserSchema schema, ContainerFilter cf)
            {
                SimpleTable table = new EHR_PurchasingTable(schema, EHR_PurchasingSchema.getInstance().getLineItemsTable(), cf).init();
                return getPermissionFilteredTable(table);
            }
        },
        purchasingRequests
        {
            @Override
            public TableInfo createTable(EHR_PurchasingUserSchema schema, ContainerFilter cf)
            {
                SimpleTable table = new EHR_PurchasingTable(schema, EHR_PurchasingSchema.getInstance().getPurchasingRequestsTable(), cf).init();
                return getPermissionFilteredTable(table);
            }
        };

        public abstract TableInfo createTable(EHR_PurchasingUserSchema schema, ContainerFilter cf);

        private static TableInfo getPermissionFilteredTable(SimpleTable table)
        {
            //Updaters can see all the rows
            if (table.getContainer().hasPermission(table.getUserSchema().getUser(), UpdatePermission.class))
                return table;

            //Non-updaters can only see rows created by them
            SimpleFilter filter = SimpleFilter.createContainerFilter(table.getContainer());
            filter.addCondition(FieldKey.fromString("createdBy"), table.getUserSchema().getUser());
            table.addCondition(filter);
            return table;
        }

    }

    @Override
    @Nullable
    public TableInfo createTable(String name, ContainerFilter cf)
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
                return tableType.createTable(this, cf);
            }
        }
        return super.createTable(name, cf);
    }
}