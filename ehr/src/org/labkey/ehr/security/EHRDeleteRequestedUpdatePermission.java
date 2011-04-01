package org.labkey.ehr.security;

import org.labkey.api.security.permissions.AbstractPermission;

/**
 * User: bbimber
 * Date: Mar 24, 2011
 */
public class EHRDeleteRequestedUpdatePermission extends AbstractPermission
{
    public EHRDeleteRequestedUpdatePermission()
    {
        super("EHRDeleteRequestedUpdatePermission", "Can update data with the QC State: Delete Requested");
    }
}
