package org.labkey.ehr.security;

import org.labkey.api.security.permissions.AbstractPermission;

/**
 * User: bbimber
 * Date: Mar 24, 2011
 */
public class EHRRequestCompleteInsertPermission extends AbstractPermission
{
    public EHRRequestCompleteInsertPermission()
    {
        super("EHRRequestCompleteInsertPermission", "Can insert data with the QC State: Request: Complete");
    }
}
