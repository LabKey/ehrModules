package org.labkey.ehr.security;

import org.labkey.api.security.permissions.AbstractPermission;

/**
 * User: bbimber
 * Date: Mar 24, 2011
 */
public class EHRRequestDeniedInsertPermission extends AbstractPermission
{
    public EHRRequestDeniedInsertPermission()
    {
        super("EHRRequestDeniedInsertPermission", "Can insert data with the QC State: Request: Denied");
    }
}
