package org.labkey.ehr.security;

import org.labkey.api.security.permissions.AbstractPermission;

/**
 * User: bbimber
 * Date: Mar 24, 2011
 */
public class EHRInProgressDeletePermission extends AbstractPermission
{
    public EHRInProgressDeletePermission()
    {
        super("EHRInProgressDeletePermission", "Can delete data with the QC State: In Progress");
    }
}
