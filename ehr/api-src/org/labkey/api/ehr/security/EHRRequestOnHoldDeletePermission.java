package org.labkey.api.ehr.security;

/**
 * User: ggottfredsen
 * Date: May 06, 2021
 */
public class EHRRequestOnHoldDeletePermission extends AbstractEHRPermission
{
    public EHRRequestOnHoldDeletePermission()
    {
        super("EHRRequestOnHoldDeletePermission", "Can delete data with the QC State: Request: On Hold");
    }
}
