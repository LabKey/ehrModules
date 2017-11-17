package org.labkey.ehr_billing.security;

import org.labkey.api.security.permissions.AbstractPermission;

public class EHR_BillingAdminPermission extends AbstractPermission
{
    public EHR_BillingAdminPermission()
    {
        super("EHR_BillingAdminPermission", "Can insert and update data in the EHR Billing tables");
    }
}