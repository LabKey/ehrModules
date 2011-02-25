package org.labkey.ehr.security;

import org.labkey.api.security.*;
import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.api.security.permissions.InsertPermission;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.security.permissions.UpdatePermission;
import org.labkey.api.security.roles.AbstractRole;
import org.labkey.ehr.EHRModule;

/**
 * User: jeckels
 * Date: Feb 25, 2011
 */
public class EHRDataAdminRole extends AbstractEHRRole
{
    public EHRDataAdminRole()
    {
        super("EHR Data Admin", "Users with this role are permitted to make any edits to datasets",
                AdminPermission.class,
                ReadPermission.class,
                InsertPermission.class,
                UpdatePermission.class);

        addExcludedPrincipal(org.labkey.api.security.SecurityManager.getGroup(Group.groupGuests));
    }
}
