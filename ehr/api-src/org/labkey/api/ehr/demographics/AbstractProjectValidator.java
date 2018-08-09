package org.labkey.api.ehr.demographics;

import org.labkey.api.data.Container;
import org.labkey.api.data.TableInfo;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;

abstract public class AbstractProjectValidator implements ProjectValidator
{
    public AbstractProjectValidator()
    {}

    public TableInfo getTableInfo(Container c, User u, String schemaName, String queryName)
    {
        UserSchema us = QueryService.get().getUserSchema(u, c, schemaName);
        if (us == null)
        {
            throw new IllegalArgumentException("Schema " + schemaName + " not found in the container: " + c.getPath());
        }

        final TableInfo ti = us.getTable(queryName);
        if (ti == null)
        {
            throw new IllegalArgumentException("Table: " + schemaName + "." + queryName + " not found in the container: " + c.getPath());
        }

        return ti;
    }

}
