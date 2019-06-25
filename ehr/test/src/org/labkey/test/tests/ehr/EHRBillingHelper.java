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
package org.labkey.test.tests.ehr;

import org.jetbrains.annotations.Nullable;
import org.labkey.remoteapi.CommandException;
import org.labkey.remoteapi.Connection;
import org.labkey.remoteapi.query.Filter;
import org.labkey.remoteapi.query.SelectRowsCommand;
import org.labkey.remoteapi.query.SelectRowsResponse;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.WebTestHelper;
import org.labkey.test.components.ext4.Window;
import org.labkey.test.tests.tnprc_ehr.TNPRC_RequestsTest;
import org.labkey.test.util.DataRegionTable;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.LoggedParam;
import org.labkey.test.util.SummaryStatisticsHelper;
import org.labkey.test.util.TestLogger;
import org.labkey.test.util.ext4cmp.Ext4FieldRef;

import java.io.IOException;
import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertEquals;

public class EHRBillingHelper
{
    private BaseWebDriverTest _test;
    private String _projectName;
    private String _folderName;
    private String _modulePath;
    private String _containerPath;
    private String _billingFolder;
    public Ext4Helper _ext4Helper;

    public EHRBillingHelper(BaseWebDriverTest test, String projectName)
    {
        _test = test;
        _projectName = projectName;
        _ext4Helper = new Ext4Helper(_test);
    }

    public EHRBillingHelper(BaseWebDriverTest test, String projectName, String folderName, String modulePath, String containerPath, String billingFolder)
    {
        this(test, projectName);
        _folderName = folderName;
        _modulePath = modulePath;
        _containerPath = containerPath;
        _billingFolder = billingFolder;
    }

    public void performBillingRun(String startDate, String endDate, String comment, int finishedJobsExpected)
    {
        _test.log("Performing the billing run");
        _test.waitAndClickAndWait(Locator.linkContainingText("Perform Billing Run"));

        _test.log("Setting the start and end date for the run");
        Ext4FieldRef.waitForField(_test, "Start Date");
        Ext4FieldRef.getForLabel(_test, "Start Date").setValue(startDate);
        Ext4FieldRef.getForLabel(_test, "End Date").setValue(endDate);
        Ext4FieldRef.getForLabel(_test, "Comment").setValue(comment);
        _test.waitAndClick(Ext4Helper.Locators.ext4Button("Submit"));

        checkMessageWindow("Success", "Run Started!", "OK");

        _test.log("Waiting for the run to complete");
        _test.waitAndClickAndWait(Locator.linkWithText("All"));
        _test.waitForPipelineJobsToComplete(finishedJobsExpected, "Billing Run", false);
    }

    public void checkMessageWindow(String title, @Nullable String bodyText, String buttonText)
    {
        Window msgWindow = new Window.WindowFinder(_test.getDriver()).withTitle(title).waitFor();
        assertEquals("Message window Title mismatch", title, msgWindow.getTitle());

        if (null != bodyText)
            assertEquals("Message window Body Text mismatch", bodyText, msgWindow.getBody());

        msgWindow.clickButton(buttonText, 0);
    }


    public void verifyBillingInvoicedItemsByAnimal(String invoiceId, String animalId, int numRows, List chargecategory, List unitCost, List totalCost,List quantity)
    {
        DataRegionTable results = goToInvoiceItemsForId(invoiceId);

        _test.log("Verifying the invoice items data for animal id " + animalId);
        results.setFilter("Id", "Equals", animalId);
        assertEquals("Wrong row count for " + animalId, numRows, results.getDataRowCount());
        assertEquals("Wrong value for Charge Category", chargecategory, results.getColumnDataAsText("chargecategory"));
        assertEquals("Wrong value for Unit cost", unitCost, results.getColumnDataAsText("unitCost"));
        assertEquals("Wrong value for Total cost", totalCost, results.getColumnDataAsText("totalcost"));
        assertEquals("Wrong value for Quantity",quantity,results.getColumnDataAsText("quantity"));
        results.clearFilter("Id");
    }

    @LogMethod
    public void verifyBillingInvoicedItemsUsingAPI(String InvoicedId, List<InvoicedItem> items) throws IOException, CommandException
    {
        NumberFormat formatter = NumberFormat.getCurrencyInstance();
        Connection cn = WebTestHelper.getRemoteApiConnection();
        SelectRowsCommand sr;

        SelectRowsCommand invoiceIdSr =new  SelectRowsCommand("ehr_billing", "invoiceRuns");
        invoiceIdSr.addFilter(new Filter("rowId", InvoicedId));
        SelectRowsResponse invoiceIdResponse = invoiceIdSr.execute(cn, _projectName + "/" + _billingFolder);

        for (InvoicedItem item : items)
        {
            sr = new SelectRowsCommand("ehr_billing", "invoicedItems");
            sr.addFilter(new Filter("invoiceId",invoiceIdResponse.getRows().get(0).get("objectId").toString()));

            if (item.getAnimalId() != null)
                sr.addFilter(new Filter("Id", item.getAnimalId()));
            if (item.getCategory() != null)
                sr.addFilter(new Filter("category", item.getCategory()));
            if (item.getChargeID() != null)
            {
                SelectRowsCommand chargeId = new SelectRowsCommand("ehr_billing", "chargeableItems");
                chargeId.addFilter(new Filter("name", item.getChargeID()));
                SelectRowsResponse chargeableItemResponse = chargeId.execute(cn, _projectName + "/" + _billingFolder);

                sr.addFilter(new Filter("chargeId", chargeableItemResponse.getRows().get(0).get("rowId").toString()));
            }

            SelectRowsResponse resp = sr.execute(cn, _projectName + "/" + _billingFolder);
            assertEquals("Wrong row count for " + item.getCategory() + item._animalId, item.getRowCount(), resp.getRowCount().intValue());

            if (item.getTotalQuantity() != null)
            {
                int sumQuantity = 0;
                for (Map<String, Object> row : resp.getRows())
                    if (row.get("quantity") != null)
                        sumQuantity += (double) row.get("quantity");

                assertEquals("Total quantity is not as expected", String.valueOf(sumQuantity), item.getTotalQuantity());
            }

            if (item.getTotalCost() != null && !item.getTotalCost().equalsIgnoreCase("n/a"))
            {
                double sumCost = 0.0;
                for (Map<String, Object> row : resp.getRows())
                    if (row.get("totalcost") != null)
                        sumCost += (double) row.get("totalcost");

                assertEquals("Total cost is not as expected", formatter.format(sumCost), item.getTotalCost());
            }

            if (!item.getColumnTextCheckMap().isEmpty())
            {
                for (Map.Entry<String, List<String>> entry : item.getColumnTextCheckMap().entrySet())
                {
                    List<String> input = new ArrayList<String>();
                    for (Map<String, Object> row : resp.getRows())
                    {
                        if (row.get(entry.getKey()) != null)
                            if (resp.getColumnDataType(entry.getKey()).toString().equalsIgnoreCase("STRING"))
                                input.add(row.get(entry.getKey()).toString());
                            else
                                input.add(formatter.format(row.get(entry.getKey())));

                    }

                    assertEquals("Wrong values for column: " + entry.getKey(), input, entry.getValue());
                }

            }
        }
    }

    @LogMethod
    public void verifyBillingInvoicedItems(String invoiceId, List<InvoicedItem> items)
    {
        DataRegionTable results = goToInvoiceItemsForId(invoiceId);

        for (InvoicedItem item : items)
        {
            StringBuilder msg = new StringBuilder("Verify Invoiced Item: ");
            if (item.getAnimalId() != null)
                msg.append("AnimalId = ").append(item.getAnimalId());
            else
                msg.append("Category = ").append(item.getCategory());
            TestLogger.log(msg.toString());
            TestLogger.increaseIndent();

            if (item.getAnimalId() != null)
                results.setFilter("Id", "Equals", item.getAnimalId());
            if (item.getCategory() != null)
                results.setFilter("category", "Equals", item.getCategory());
            if(item.getChargeID() != null)
                results.setFilter("chargeId","Equals", item.getChargeID());
            if(item.getChargeCategoryID() != null)
                results.setFilter("chargeId/chargeCategoryid","Equals", item.getChargeCategoryID());

            assertEquals("Wrong row count for " + item.getCategory(), item.getRowCount(), results.getDataRowCount());
            if (item.getTotalQuantity() != null)
                results.verifySummaryStatisticValue("quantity", SummaryStatisticsHelper.BASE_STAT_SUM, item.getTotalQuantity());
            if (item.getTotalCost() != null)
                results.verifySummaryStatisticValue("totalcost", SummaryStatisticsHelper.BASE_STAT_SUM, item.getTotalCost());

            if (!item.getColumnTextCheckMap().isEmpty())
            {
                for (Map.Entry<String, List<String>> entry : item.getColumnTextCheckMap().entrySet())
                    assertEquals("Wrong values for column: " + entry.getKey(), entry.getValue(), results.getColumnDataAsText(entry.getKey()));
            }

            if (item.getAnimalId() != null)
                results.clearFilter("Id");
            if (item.getCategory() != null)
                results.clearFilter("category");
            if(item.getChargeID() != null)
                results.clearFilter("chargeId");

            TestLogger.decreaseIndent();
        }

        results.clearFilter("invoiceId");
    }

    private DataRegionTable goToInvoiceItemsForId(String invoiceId)
    {
        _test.log("Verifying invoice items data for Invoice ID " + invoiceId);
        _test.clickFolder(_billingFolder);
        _test.clickAndWait(Locator.bodyLinkContainingText("All Invoiced Items"));
        DataRegionTable results = new DataRegionTable("query", _test.getDriver());
        results.setFilter("invoiceId", "Equals", invoiceId);
        return results;
    }

    public static class InvoicedItem
    {
        private String _animalId;
        private String _category;
        private int _rowCount;
        private String _totalCost;
        private String _totalQuantity;
        private String _chargeCategoryId;
        private String _chargeID;
        private Map<String, List<String>> _columnTextChecks = new HashMap<>();

        public InvoicedItem(String category, int rowCount, String totalQuantity, String totalCost)
        {
            _category = category;
            _rowCount = rowCount;
            _totalQuantity = totalQuantity;
            _totalCost = totalCost;
        }

        public InvoicedItem(String animalId, String category, int rowCount, String totalQuantity, String totalCost)
        {
            _animalId = animalId;
            _category = category;
            _rowCount = rowCount;
            _totalQuantity = totalQuantity;
            _totalCost = totalCost;
        }

        public InvoicedItem(String animalId, String category, int rowCount, String totalQuantity, String totalCost, String chargeID)
        {
            _animalId = animalId;
            _category = category;
            _rowCount = rowCount;
            _totalQuantity = totalQuantity;
            _totalCost = totalCost;
            _chargeID = chargeID;
        }

        public InvoicedItem(String category, int rowCount, String totalQuantity, String totalCost, String chargeCategoryId)
        {
            _category = category;
            _rowCount = rowCount;
            _totalQuantity = totalQuantity;
            _totalCost = totalCost;
            _chargeCategoryId = chargeCategoryId;
        }

        public String getCategory()
        {
            return _category;
        }

        public int getRowCount()
        {
            return _rowCount;
        }

        public String getTotalCost()
        {
            return _totalCost;
        }

        public String getTotalQuantity()
        {
            return _totalQuantity;
        }

        public String getAnimalId()
        {
            return _animalId;
        }

        public String getChargeID()
        {
            return _chargeID;
        }

        public String getChargeCategoryID()
        {
            return _chargeCategoryId;
        }

        public void addColumnTextToCheck(String colName, List<String> colValues)
        {
            _columnTextChecks.put(colName, colValues);
        }

        public Map<String, List<String>> getColumnTextCheckMap()
        {
            return _columnTextChecks;
        }
    }
}
