package org.labkey.test.tests.ehr;

import org.jetbrains.annotations.Nullable;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.components.ext4.Window;
import org.labkey.test.util.DataRegionTable;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.SummaryStatisticsHelper;
import org.labkey.test.util.ext4cmp.Ext4FieldRef;

import java.util.List;

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

    private void checkMessageWindow(String title, @Nullable String bodyText, String buttonText)
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

    public void verifyBillingInvoicedItemsByCategory(String invoiceId, List<InvoicedItemCategory> categories)
    {
        DataRegionTable results = goToInvoiceItemsForId(invoiceId);

        for (InvoicedItemCategory category : categories)
        {
            _test.log("Verifying invoice items data for category " + category.getCategory());
            results.setFilter("category", "Equals", category.getCategory());
            int expectedRowCount = category.getRowCount();
            assertEquals("Wrong row count for " + category.getCategory(), expectedRowCount, results.getDataRowCount());
            if (category.getTotalCost() != null)
                results.verifySummaryStatisticValue("totalcost", SummaryStatisticsHelper.BASE_STAT_SUM, category.getTotalCost());
            results.clearFilter("category");
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

    public static class InvoicedItemCategory
    {
        private String _category;
        private int _rowCount;
        private String _totalCost;

        public InvoicedItemCategory(String category, int rowCount, String totalCost)
        {
            _category = category;
            _rowCount = rowCount;
            _totalCost = totalCost;
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
    }
}
