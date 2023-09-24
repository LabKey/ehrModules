package org.labkey.ehr_app.query;

import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.labkey.api.data.DbSchema;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.ReadPermission;

public class EHR_AppUserSchema extends SimpleUserSchema
{
    public EHR_AppUserSchema(String name, @Nullable String description, User user, Container container, DbSchema dbschema)
    {
        super(name, description, user, container, dbschema);
    }

    @Override
    public boolean canReadSchema()
    {
        User user = getUser();
        if (user == null)
            return false;

        return getContainer().hasPermission(user, ReadPermission.class);
    }
}
