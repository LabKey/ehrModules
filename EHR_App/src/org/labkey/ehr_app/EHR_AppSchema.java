package org.labkey.ehr_app;

import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbSchemaType;
import org.labkey.api.data.dialect.SqlDialect;

public class EHR_AppSchema
{
    private static final EHR_AppSchema _instance = new EHR_AppSchema();
    public static final String NAME = "EHR_App";

    public static EHR_AppSchema getInstance()
    {
        return _instance;
    }

    private EHR_AppSchema()
    {
        // private constructor to prevent instantiation from
        // outside this class: this singleton should only be
        // accessed via org.labkey.jhu_ehr.Jhu_ehrSchema.getInstance()
    }

    public DbSchema getSchema()
    {
        return DbSchema.get(NAME, DbSchemaType.Module);
    }

    public SqlDialect getSqlDialect()
    {
        return getSchema().getSqlDialect();
    }
}
