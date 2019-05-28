package org.labkey.ehr_billing.notification;

import org.labkey.api.ehr_billing.notification.BillingNotificationProvider;
import org.labkey.api.ehr_billing.notification.BillingNotificationService;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

public class BillingNotificationServiceImpl extends BillingNotificationService
{
    private Map<String, BillingNotificationProvider> _billingNotificationProviders = new HashMap<>();


    @Override
    public void registerBillingNotificationProvider(BillingNotificationProvider provider)
    {
        _billingNotificationProviders.put(provider.getName(), provider);
    }

    @Override
    public Collection<BillingNotificationProvider> getBillingNotificationProviders()
    {
        return _billingNotificationProviders.values();
    }
}
