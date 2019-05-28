package org.labkey.ehr_billing;

import org.labkey.api.data.Container;
import org.labkey.api.ehr_billing.EHR_BillingService;

public class EHR_BillingServiceImpl extends EHR_BillingService
{
    public EHR_BillingServiceImpl()
    {

    }

    @Override
    public Container getEHRBillingContainer(Container c)
    {
        return EHR_BillingManager.get().getBillingContainer(c);
    }
}
