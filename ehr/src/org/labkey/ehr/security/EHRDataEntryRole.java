package org.labkey.ehr.security;

import org.labkey.api.security.permissions.DeletePermission;
import org.labkey.api.security.permissions.InsertPermission;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.security.permissions.UpdatePermission;
import org.labkey.api.security.roles.AbstractRole;
import org.labkey.ehr.EHRModule;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 1/17/13
 * Time: 7:42 PM
 */
public class EHRDataEntryRole extends AbstractRole
{
    public EHRDataEntryRole()
    {
        super("EHR Data Entry", "This role is required in order to submit data into any EHR table; however, having this role alone is not sufficient for data entry.  Per-table permissions are set through study admin.", EHRModule.class,
            ReadPermission.class,
            InsertPermission.class,
            UpdatePermission.class,
            DeletePermission.class,
            EHRDataEntryPermission.class
        );
    }
}
