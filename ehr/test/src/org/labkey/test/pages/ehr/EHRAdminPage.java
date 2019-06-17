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
