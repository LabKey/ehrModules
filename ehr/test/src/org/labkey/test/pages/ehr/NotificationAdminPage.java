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
package org.labkey.test.pages.ehr;

import org.labkey.test.Locator;
import org.labkey.test.WebDriverWrapper;
import org.labkey.test.WebTestHelper;
import org.labkey.test.components.ext4.Window;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.PasswordUtil;
import org.labkey.test.util.ext4cmp.Ext4CmpRef;
import org.labkey.test.util.ext4cmp.Ext4FieldRef;
import org.openqa.selenium.WebDriver;

public class NotificationAdminPage extends BaseColonyOverviewPage
{
    public NotificationAdminPage(WebDriver driver)
    {
        super(driver);
    }

    public static NotificationAdminPage beginAt(WebDriverWrapper driver)
    {
        return beginAt(driver, driver.getCurrentContainerPath());
    }

    public static NotificationAdminPage beginAt(WebDriverWrapper driver, String containerPath)
    {
        driver.beginAt(WebTestHelper.buildURL("ldk", containerPath, "notificationAdmin"));
        return new NotificationAdminPage(driver.getDriver());
    }

    public void setNotificationUserAndReplyEmail(String replyEmail)
    {
        Ext4FieldRef.getForLabel(this, "Notification User").setValue(PasswordUtil.getUsername());
        Ext4FieldRef.getForLabel(this, "Reply Email").setValue(replyEmail);
        Ext4CmpRef btn = _ext4Helper.queryOne("button[text='Save']", Ext4CmpRef.class);
        btn.waitForEnabled();
        clickButton("Save", 0);
        waitForElement(Ext4Helper.Locators.window().withDescendant(Window.Locators.title().withText("Success")));
        waitAndClickAndWait(Ext4Helper.Locators.ext4Button("OK"));
    }

    public void enableColonyManagementAlerts(String inputName)
    {
        log("Enabling Colony Management Notification");
        _ext4Helper.selectComboBoxItem(Ext4Helper.Locators.formItemWithInputNamed(inputName), Ext4Helper.TextMatchTechnique.EXACT, "Enabled");
        clickButton("Save", 0);
        waitForElement(Ext4Helper.Locators.window().withDescendant(Window.Locators.title().withText("Success")));
        waitAndClickAndWait(Ext4Helper.Locators.ext4Button("OK"));

    }

    public void enableDeathNotification(String inputName)
    {
        log("Enabling Death Notification");
        _ext4Helper.selectComboBoxItem(Ext4Helper.Locators.formItemWithInputNamed(inputName), Ext4Helper.TextMatchTechnique.EXACT, "Enabled");
        clickButton("Save", 0);
        waitForElement(Ext4Helper.Locators.window().withDescendant(Window.Locators.title().withText("Success")));
        waitAndClickAndWait(Ext4Helper.Locators.ext4Button("OK"));

    }

    public void enableBillingNotification(String inputName)
    {
        log("Enabling Billing Notification");
        _ext4Helper.selectComboBoxItem(Ext4Helper.Locators.formItemWithInputNamed(inputName), Ext4Helper.TextMatchTechnique.EXACT, "Enabled");
        clickButton("Save", 0);
        waitForElement(Ext4Helper.Locators.window().withDescendant(Window.Locators.title().withText("Success")));
        waitAndClickAndWait(Ext4Helper.Locators.ext4Button("OK"));

    }

    public void enableRequestAdminAlerts(String inputName)
    {
        log("Enabling Request Admin Notification");
        _ext4Helper.selectComboBoxItem(Ext4Helper.Locators.formItemWithInputNamed(inputName), Ext4Helper.TextMatchTechnique.EXACT, "Enabled");
        clickButton("Save", 0);
        waitForElement(Ext4Helper.Locators.window().withDescendant(Window.Locators.title().withText("Success")));
        waitAndClickAndWait(Ext4Helper.Locators.ext4Button("OK"));
    }

    public void clickRunReportInBrowser(String name)
    {
        log("Clicking Run Report in browser for " + name);
        name = name.replace(" ", "");
        clickAndWait(Locator.tagWithAttributeContaining("a", "href", name).withText("Run Report In Browser"));
    }

    public void clickManuallyTriggerEmail(String name)
    {
        log("Manually Triggering Email for " + name);
        name = name.replace(" ", "");
        clickAndWait(Locator.tagWithAttributeContaining("a", "id", name).withText("Manually Trigger Email"), 0);
        waitAndClick(Ext4Helper.Locators.window("Send Email").append(Ext4Helper.Locators.ext4Button("Yes")));
    }

    public void addManageUsers(String notification, String user)
    {
        log("Adding " + user + "to" + notification);
        notification = notification.replace(" ", "");
        notification = "manageUser_" + notification;
        clickAndWait(Locator.tagWithAttributeContaining("a", "id", notification).withText("Manage Subscribed Users/Groups"), 0);
        _ext4Helper.selectComboBoxItem("Add User Or Group:", user);
        clickButton("Close", 0);

    }
}
