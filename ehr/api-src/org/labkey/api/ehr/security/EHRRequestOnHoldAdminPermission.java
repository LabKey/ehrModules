package org.labkey.api.ehr.security;

/**
 * User: ggottfredsen
 * Date: May 06, 2021
 */
public class EHRRequestOnHoldAdminPermission extends AbstractEHRPermission
{
    public EHRRequestOnHoldAdminPermission()
    {
        super("EHRRequestOnHoldAdminPermission", "Can admin data with the QC State: Request: On Hold");
    }
}
