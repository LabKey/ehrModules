package org.labkey.api.ehr_billing;

import org.labkey.api.data.Container;

abstract public class EHR_BillingService
{
    static EHR_BillingService instance;

    public static EHR_BillingService get()
    {
        return instance;
    }

    static public void setInstance(EHR_BillingService instance)
    {
        EHR_BillingService.instance = instance;
    }

    /**
     * @return the container holding the Billing data, as defined by the passed container's module property 'BillingContainer'
     */
    abstract public Container getEHRBillingContainer(Container c);
}
