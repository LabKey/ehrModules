/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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