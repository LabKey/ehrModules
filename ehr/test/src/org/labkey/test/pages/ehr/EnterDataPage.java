package org.labkey.test.pages.ehr;

import org.labkey.test.WebDriverWrapper;
import org.labkey.test.WebTestHelper;
import org.openqa.selenium.WebDriver;

public class EnterDataPage extends BaseColonyOverviewPage
{
    public EnterDataPage(WebDriver driver)
    {
        super(driver);
    }

    public static EnterDataPage beginAt(WebDriverWrapper driver)
    {
        return beginAt(driver, driver.getCurrentContainerPath());
    }

    public static EnterDataPage beginAt(WebDriverWrapper driver, String containerPath)
    {
        driver.beginAt(WebTestHelper.buildURL("ehr", containerPath, "enterData"));
        return new EnterDataPage(driver.getDriver());
    }

}
