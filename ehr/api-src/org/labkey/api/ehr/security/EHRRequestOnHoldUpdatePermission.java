package org.labkey.api.ehr.security;

/**
 * User: ggottfredsen
 * Date: May 06, 2021
 */
public class EHRRequestOnHoldUpdatePermission extends AbstractEHRPermission
{
    public EHRRequestOnHoldUpdatePermission()
    {
        super("EHRRequestOnHoldUpdatePermission", "Can update data with the QC State: Request: On Hold");
    }
}
