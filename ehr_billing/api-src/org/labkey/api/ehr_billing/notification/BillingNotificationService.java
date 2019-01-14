package org.labkey.api.ehr_billing.notification;


import java.util.Collection;

abstract public class BillingNotificationService
{
    static BillingNotificationService _instance = null;

    public static BillingNotificationService get()
    {
        return _instance;
    }

    static public void setInstance(BillingNotificationService instance)
    {
        _instance = instance;
    }

    abstract public void registerBillingNotificationProvider(BillingNotificationProvider provider);

    abstract public Collection<BillingNotificationProvider> getBillingNotificationProviders();

}
