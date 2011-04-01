package org.labkey.ehr.security;

import org.labkey.api.security.permissions.AbstractPermission;

/**
 * User: bbimber
 * Date: Mar 24, 2011
 */
public class EHRDeleteRequestedInsertPermission extends AbstractPermission
{
    public EHRDeleteRequestedInsertPermission()
    {
        super("EHRDeleteRequestedInsertPermission", "Can insert data with the QC State: Delete Requested");
    }
}
