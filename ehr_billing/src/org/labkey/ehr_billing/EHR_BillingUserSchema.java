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
                if (t.name().equalsIgnoreCase(name.toLowerCase()))
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
        return null;
    }
}