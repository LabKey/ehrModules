package org.labkey.test.pages.ehr;

import org.labkey.test.WebDriverWrapper;
import org.labkey.test.WebTestHelper;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class ManageDataPage extends BaseColonyOverviewPage
{
    public ManageDataPage(WebDriver driver)
    {
        super(driver);
    }

    public static ManageDataPage beginAt(WebDriverWrapper driver)
    {
        return beginAt(driver, driver.getCurrentContainerPath());
    }

    public static ManageDataPage beginAt(WebDriverWrapper driver, String containerPath)
    {
        driver.beginAt(WebTestHelper.buildURL("ehr", containerPath, "serviceRequests"));
        return new ManageDataPage(driver.getDriver());
    }

    public WebElement clickMyPendingRequestTab()
    {
        clickTab("My Pending Requests");
        return getActiveTabPanel();
    }

    public WebElement clickQueuesTab()
    {
        clickTab("Queues");
        return getActiveTabPanel();
    }

}