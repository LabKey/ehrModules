package org.labkey.ehr.security;

import org.labkey.api.ehr.security.EHRTemplateCreatorPermission;
import org.labkey.api.security.permissions.Permission;

/**
 * Created by Josh on 2/25/2016.
 */
public class EHRTemplateCreatorRole extends AbstractEHRRole
{
    public EHRTemplateCreatorRole()
    {
        super("EHR Template Creator", "Users with this role are permitted to create templates for data entry", EHRTemplateCreatorPermission.class);
    }
}
