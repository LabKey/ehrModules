/*
 * Copyright (c) 2018-2019 LabKey Corporation
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

import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.LogManager;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.pipeline.PipelineJobException;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.security.User;
import org.labkey.api.services.ServiceRegistry;
import org.labkey.api.util.Pair;

import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * Service to get a list of queries to be processed during a Billing Run. The listing is a collection of
 * BillingPipelineJobProcess objects that define what schema.query to execute and the mapping from that query's
 * columns to the ehr_billing.invoicedItem table's columns.
 * Additionally, get center specific generated invoice number.
 *
 * Currently registered server wide but should allow multiple co-existing services and resolve per container's active modules
 */
public interface InvoicedItemsProcessingService
{
    @Nullable
    static InvoicedItemsProcessingService get()
    {
        return ServiceRegistry.get().getService(InvoicedItemsProcessingService.class);
    }

    /** @return the inputs to the billing process that are capable of generating charges */
    default List<BillingPipelineJobProcess> getProcessList()
    {
        return Collections.emptyList();
    }

    /**
     * Generate invoice number for a billing task processed row and billing period date.
     * @param row the billing task processed row to get values from
     * @param billingPeriodDate a date within a billing period
     * @return generated invoice num
     */
    @Nullable
    String getInvoiceNum(Map<String, Object> row, Date billingPeriodDate) throws PipelineJobException;

    /**
     * Process center specific billing columns, if any.
     * @param invoiceId invoice Run Id for which additional processing can be performed
     */
    void performAdditionalProcessing(String invoiceId, User user, Container container);

    /*
     * Returns a pair of previous matching billing run's objectId and rowId
     * */
    @Nullable
    default Pair<String,String> verifyBillingRunPeriod(User user, Container container, Date startDate, Date endDate) throws PipelineJobException
    {
        // look for existing runs overlapping the provided date range.
        TableInfo invoiceRunsUser = QueryService.get().getUserSchema(user, container,
                "ehr_billing").getTable("invoiceRuns", null);
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("billingPeriodStart"), endDate, CompareType.DATE_LTE);
        filter.addCondition(FieldKey.fromString("billingPeriodEnd"), startDate, CompareType.DATE_GTE);

        if (null != invoiceRunsUser)
        {
            TableSelector ts = new TableSelector(invoiceRunsUser, filter, null);
            if (ts.exists())
            {
                throw new PipelineJobException("There is already an existing billing period that overlaps the provided interval");
            }
        }
        return null;
    }

    default void processBillingRerun(String newInvoiceId, String newInvoiceRowId, Date billingStartDate, Date billingRunEndDate, int nextTransactionNumber, User user, Container container, Logger logger) {}

    default void setBillingStartDate(Date billingStartDate) {}

    default String getUnitCostColName()
    {
        return "unitCost";
    }

    default String getTotalCostColName()
    {
        return "totalcost";
    }

    default String getAdditionalUnitCostColName()
    {
        return null;
    }

    default String getAdditionalTotalCostColName()
    {
        return null;
    }
}