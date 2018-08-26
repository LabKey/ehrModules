package org.labkey.api.ehr_billing.pipeline;

import org.jetbrains.annotations.Nullable;
import org.labkey.api.services.ServiceRegistry;

import java.util.Date;

/**
 * Service to get query names and column names to be processed during a Billing Run.
 * Additionally, get center specific generated invoice number.
 */
public interface InvoicedItemsProcessingService
{
    @Nullable
    static InvoicedItemsProcessingService get()
    {
        return ServiceRegistry.get(InvoicedItemsProcessingService.class);
    }

    public String getPerDiemProcessingQueryName();

    public String[] getPerDiemProcessingColumnNames();

    public String getProceduresProcessingQueryName();

    public String[] getProceduresProcessingColumnNames();

    public String getMiscChargesProcessingQueryName();

    public String[] getMiscChargesProcessingColumnNames();

    public String getLabworkProcessingQueryName();

    public String[] getLabworkProcessingColumnNames();

    public String getLeaseFeeProcessingQueryName();

    public String[] getLeaseFeeProcessingColumnNames();

    public String[] getInvoicedItemsColumnNames();
    
    public String getSchemaName();

    /**
     * Generate invoice number for unique account number and billing period pair.
     * @param debitAcct account number
     * @param billingPeriodDate a date within a billing period
     * @return generated invoice num
     */
    public String getInvoiceNum(String debitAcct, Date billingPeriodDate);
}