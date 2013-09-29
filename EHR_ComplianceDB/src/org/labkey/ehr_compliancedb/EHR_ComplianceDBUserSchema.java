package org.labkey.ehr_compliancedb;

import org.labkey.api.data.Container;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.SchemaTableInfo;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ldk.table.ContainerScopedTable;
import org.labkey.api.module.Module;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.security.User;

import java.util.Set;

/**
 * User: bimber
 * Date: 9/24/13
 * Time: 9:07 PM
 */
public class EHR_ComplianceDBUserSchema extends SimpleUserSchema
{
    public EHR_ComplianceDBUserSchema(User user, Container container, DbSchema dbschema)
    {
        super(EHR_ComplianceDBModule.SCHEMA_NAME, null, user, container, dbschema);
    }

    @Override
    protected TableInfo createTable(String name)
    {
        if ("requirements".equalsIgnoreCase(name))
        {
            SchemaTableInfo table = _dbSchema.getTable(name);
            return new ContainerScopedTable(this, table, "requirementname").init();
        }

        return super.createTable(name);
    }

    public static void register(final Module m)
    {
        final DbSchema dbSchema = DbSchema.get(EHR_ComplianceDBModule.SCHEMA_NAME);

        DefaultSchema.registerProvider(EHR_ComplianceDBModule.SCHEMA_NAME, new DefaultSchema.SchemaProvider()
        {
            public QuerySchema getSchema(final DefaultSchema schema)
            {
                if (schema.getContainer().getActiveModules().contains(m))
                {
                    return new EHR_ComplianceDBUserSchema(schema.getUser(), schema.getContainer(), dbSchema);
                }
                return null;
            }
        });
    }

}
