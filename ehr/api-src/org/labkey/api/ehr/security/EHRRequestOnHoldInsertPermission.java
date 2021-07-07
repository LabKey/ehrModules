package org.labkey.api.ehr.security;

/**
 * User: ggottfredsen
 * Date: May 06, 2021
 */
public class EHRRequestOnHoldInsertPermission extends AbstractEHRPermission
{
    public EHRRequestOnHoldInsertPermission()
    {
        super("EHRRequestOnHoldInsertPermission", "Can insert data with the QC State: Request: On Hold");
    }
}
