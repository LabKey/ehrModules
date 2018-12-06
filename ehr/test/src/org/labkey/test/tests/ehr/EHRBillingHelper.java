package org.labkey.test.tests.ehr;

import org.jetbrains.annotations.Nullable;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.components.ext4.Window;
import org.labkey.test.util.DataRegionTable;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.SummaryStatisticsHelper;
import org.labkey.test.util.ext4cmp.Ext4FieldRef;

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

    public void verifyBillingInvoicedItems(String invoiceId, List<InvoicedItem> items)
    {
        DataRegionTable results = goToInvoiceItemsForId(invoiceId);

        for (InvoicedItem item : items)
        {
            if (item.getAnimalId() != null)
                results.setFilter("Id", "Equals", item.getAnimalId());
            if (item.getCategory() != null)
                results.setFilter("category", "Equals", item.getCategory());
            if(item.getChargeID() != null)
                results.setFilter("chargeId","Equals", item.getChargeID());

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
