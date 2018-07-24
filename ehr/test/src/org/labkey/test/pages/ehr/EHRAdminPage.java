package org.labkey.test.pages.ehr;

import org.labkey.test.Locator;
import org.labkey.test.WebDriverWrapper;
import org.labkey.test.WebTestHelper;
import org.openqa.selenium.WebDriver;

public class EHRAdminPage extends BaseColonyOverviewPage
{
    public EHRAdminPage(WebDriver driver)
    {
        super(driver);
    }

    public static EHRAdminPage beginAt(WebDriverWrapper driver)
    {
        return beginAt(driver, driver.getCurrentContainerPath());
    }

    public static EHRAdminPage beginAt(WebDriverWrapper driver, String containerPath)
    {
        driver.beginAt(WebTestHelper.buildURL("ehr", containerPath, "ehrAdmin"));
        return new EHRAdminPage(driver.getDriver());
    }

    public static NotificationAdminPage clickNotificationService(WebDriverWrapper driver)
    {
        driver.clickAndWait(Locator.linkWithText("Notification Admin"));
        return new NotificationAdminPage(driver.getDriver());
    }
}
