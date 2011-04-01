package org.labkey.ehr.security;

import org.labkey.api.security.permissions.AbstractPermission;

/**
 * User: bbimber
 * Date: Mar 24, 2011
 */
public class EHRDeleteRequestedDeletePermission extends AbstractPermission
{
    public EHRDeleteRequestedDeletePermission()
    {
        super("EHRDeleteRequestedDeletePermission", "Can delete data with the QC State: Delete Requested");
    }
}
