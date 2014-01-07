/*
 * Copyright (c) 2012-2013 LabKey Corporation
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
package org.labkey.test.util;

import org.labkey.remoteapi.CommandException;
import org.labkey.remoteapi.CommandResponse;
import org.labkey.remoteapi.Connection;
import org.labkey.remoteapi.security.AddGroupMembersCommand;
import org.labkey.remoteapi.security.CreateGroupCommand;
import org.labkey.remoteapi.security.CreateGroupResponse;
import org.labkey.remoteapi.security.CreateUserCommand;
import org.labkey.remoteapi.security.CreateUserResponse;
import org.labkey.remoteapi.security.DeleteUserCommand;
import org.labkey.remoteapi.security.GetUsersCommand;
import org.labkey.remoteapi.security.GetUsersResponse;
import org.labkey.test.BaseSeleniumWebTest;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.tests.EHRReportingAndUITest;
import org.labkey.test.util.ext4cmp.Ext4CmpRefWD;
import org.labkey.test.util.ext4cmp.Ext4ComboRefWD;
import org.labkey.test.util.ext4cmp.Ext4FieldRefWD;
import org.labkey.test.util.ext4cmp.Ext4GridRefWD;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

import static org.labkey.test.BaseWebDriverTest.WAIT_FOR_JAVASCRIPT;
import static org.labkey.test.Locator.NOT_HIDDEN;

/**
 * User: bbimber
 * Date: 8/6/12
 * Time: 10:49 AM
 */
public class EHRTestHelper
{
    private BaseWebDriverTest _test;

    public EHRTestHelper(BaseWebDriverTest test)
    {
        _test = test;
    }

    public String getAnimalHistoryDataRegionName(String title)
    {
        // Specific to the EHR Animal History page.
        _test.waitForElement(Locator.xpath("//table[@name='webpart' and ./*/*/*/a//span[text()='"+title+"' or starts-with(text(), '"+title+" - ')]]//table[starts-with(@id,'dataregion_') and not(contains(@id, 'header'))]"), BaseWebDriverTest.WAIT_FOR_JAVASCRIPT * 6);
        return _test.getAttribute(Locator.xpath("//table[@name='webpart' and ./*/*/*/a//span[text()='" + title + "' or starts-with(text(), '" + title + " -')]]//table[starts-with(@id,'dataregion_') and not(contains(@id, 'header'))]"), "id").substring(11);
    }

    public String getWeightDataRegionName()
    {
        return _test.getAttribute(Locator.xpath("//div[contains(@class, 'ldk-wp') and ./*/*/*//th[contains(text(), 'Weights - test')]]//table[starts-with(@id,'dataregion_') and not(contains(@id, 'header'))]"), "id").substring(11);
    }

    public void selectDataEntryRecord(String query, String Id, boolean keepExisting)
    {
        _test._extHelper.selectExtGridItem("Id", Id, -1, "ehr-" + query + "-records-grid", keepExisting);
        if(!keepExisting)
            _test.waitForElement(Locator.xpath("//div[@id='Id']/a[text()='"+Id+"']"), BaseWebDriverTest.WAIT_FOR_JAVASCRIPT);
    }

    public void clickVisibleButton(String text)
    {
        _test.click(Locator.xpath("//button[text()='" + text + "' and " + EHRReportingAndUITest.VISIBLE + " and not(contains(@class, 'x-hide-display'))]"));
    }

    public void setDataEntryFieldInTab(String tabName, String fieldName, String value)
    {
        value += "\t"; //force blur event
        _test.setFormElement(Locator.xpath("//div[./div/span[text()='" + tabName + "']]//*[(self::input or self::textarea) and @name='" + fieldName + "']"), value);
        _test.sleep(100);
    }

    public void setDataEntryField(String fieldName, String value)
    {
        value += "\t"; //force blur event
        _test.setFormElement(Locator.name(fieldName), value);
        _test.sleep(100);
    }

    public int createUserAPI(String email, String containerPath) throws CommandException, IOException
    {
        Connection cn = new Connection(_test.getBaseURL(), PasswordUtil.getUsername(), PasswordUtil.getPassword());
        CreateUserCommand uc = new CreateUserCommand(email);
        uc.setSendEmail(true);
        CreateUserResponse resp = uc.execute(cn, containerPath);
        return resp.getUserId().intValue();
    }


    public boolean deleteUserAPI(String email, String containerPath, boolean throwOnException)
    {
        try
        {
            Connection cn = new Connection(_test.getBaseURL(), PasswordUtil.getUsername(), PasswordUtil.getPassword());
            GetUsersCommand getUsers = new GetUsersCommand();
            getUsers.setName(email);
            GetUsersResponse userResp = getUsers.execute(cn, containerPath);
            if (userResp.getUsersInfo().size() > 0)
            {
                DeleteUserCommand uc = new DeleteUserCommand(userResp.getUsersInfo().get(0).getUserId());
                CommandResponse resp = uc.execute(cn, containerPath);
                return true;
            }
        }
        catch (CommandException e)
        {
            if (throwOnException)
                throw new RuntimeException(e);
        }
        catch (IOException e)
        {
            if (throwOnException)
                throw new RuntimeException(e);
        }

        return false;
    }

    public int createPermissionsGroupAPI(String groupName, String containerPath, Integer... memberIds) throws Exception
    {
        Connection cn = new Connection(_test.getBaseURL(), PasswordUtil.getUsername(), PasswordUtil.getPassword());
        CreateGroupCommand gc = new CreateGroupCommand(groupName);
        CreateGroupResponse resp = gc.execute(cn, containerPath);
        Integer groupId = resp.getGroupId().intValue();

        AddGroupMembersCommand mc = new AddGroupMembersCommand(groupId);
        for (Integer m : memberIds)
            mc.addPrincipalId(m);

        mc.execute(cn, containerPath);

        return groupId;
    }

    public void waitForCmp(final String query)
    {
        _test.waitFor(new BaseWebDriverTest.Checker()
        {
            @Override
            public boolean check()
            {
                return null != _test._ext4Helper.queryOne(query, Ext4CmpRefWD.class);
            }
        }, "Component did not appear for query: " + query, BaseSeleniumWebTest.WAIT_FOR_JAVASCRIPT);
    }

    @LogMethod(quiet = true)
    public void selectSnomedComboBoxItem(Locator.XPathLocator parentLocator, @LoggedParam String selection)
    {
        _test.click(Locator.xpath(parentLocator.getPath() + "//*[contains(@class, 'x-form-arrow-trigger')]"));
        _test.waitAndClick(Locator.xpath("//div["+NOT_HIDDEN+"]/div/div[contains(normalize-space(), '" + selection + "')]"));
        _test.waitForElementToDisappear(Locator.xpath("//div["+NOT_HIDDEN+"]/div/div[contains(normalize-space(), '" + selection + "')]"), WAIT_FOR_JAVASCRIPT);
    }

    public Boolean waitForElementWithValue(final BaseWebDriverTest test, final String name, final String value, final int msTimeout)
    {
        final Locator l = Locator.name(name);
        long secTimeout = msTimeout / 1000;
        secTimeout = secTimeout > 0 ? secTimeout : 1;
        WebDriverWait wait = new WebDriverWait(test.getDriver(), secTimeout);
        try
        {
            return wait.until(new ExpectedCondition<Boolean>()
            {
                @Override
                public Boolean apply(WebDriver d)
                {
                    return value.equals(test.getFormElement(l));
                }
            });
        }
        catch (TimeoutException ex)
        {
            throw new NoSuchElementException("Timeout waiting for element [" + secTimeout + "sec]: " + l.getLoggableDescription());
        }
    }

    //helpers for Ext4 data entry
    public void goToTaskForm(String name)
    {
        _test.goToProjectHome();
        _test.waitAndClickAndWait(Locator.tagContainingText("a", "Enter Data"));
        _test.waitAndClick(Locator.tagContainingText("span", "Enter New Data"));  //click tab
        _test.waitAndClick(_test.WAIT_FOR_PAGE, Locator.tagContainingText("a", name), _test.WAIT_FOR_PAGE);

        _test.waitForElement(Locator.ext4Button("Save Draft"));
        Ext4CmpRefWD saveBtn = _test._ext4Helper.queryOne("button[text='Save Draft']", Ext4CmpRefWD.class);
        saveBtn.waitForEnabled();
    }

    public Ext4FieldRefWD getExt4FieldForFormSection(String sectionTitle, String fieldLabel)
    {
        return _test._ext4Helper.queryOne("panel[title='" + sectionTitle + "'] [fieldLabel='" + fieldLabel + "']", Ext4FieldRefWD.class);
    }

    public Ext4GridRefWD getExt4GridForFormSection(String sectionTitle)
    {
        String query = "panel[title='" + sectionTitle + "']";
        Ext4CmpRefWD.waitForComponent(_test, query);
        Ext4GridRefWD grid = _test._ext4Helper.queryOne(query, Ext4GridRefWD.class);
        if (grid != null)
            grid.setClicksToEdit(1);

        return grid;
    }

    public Locator getDataEntryButton(String text)
    {
        return Locator.ext4Button(text).withClass("ehr-dataentrybtn");
    }

    public void addRecordToGrid(Ext4GridRefWD grid)
    {
        Integer count = grid.getRowCount();
        grid.clickTbarButton("Add");
        grid.waitForRowCount(count + 1);
        grid.cancelEdit();
        _test.sleep(50);
    }

    public void clickExt4WindowBtn(String title, String label)
    {
        _test.waitForElement(Ext4HelperWD.ext4Window(title));
        _test.waitAndClick(Locator.tag("div").withClass("x4-window").notHidden().append(Locator.ext4Button(label)));
    }

    public void applyTemplate(Ext4GridRefWD grid, String templateName, boolean bulkEdit, Date date)
    {
        grid.clickTbarButton("Templates");

        _test.waitAndClick(Ext4Helper.ext4MenuItem("Templates").notHidden());
        _test.waitAndClick(Ext4Helper.ext4MenuItem(templateName).notHidden());

        _test.waitForElement(Ext4HelperWD.ext4Window("Apply Template"));
        Ext4ComboRefWD combo = new Ext4ComboRefWD(Ext4ComboRefWD.getForLabel(_test, "Template Name").getId(), _test);
        combo.waitForStoreLoad();
        Assert.assertEquals(combo.getDisplayValue(), templateName);

        if (date != null)
        {
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
            SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm");
            _test._ext4Helper.queryOne("window datefield", Ext4FieldRefWD.class).setValue(dateFormat.format(date));
            _test._ext4Helper.queryOne("window timefield", Ext4FieldRefWD.class).setValue(timeFormat.format(date));
        }

        if (bulkEdit)
        {
            Ext4FieldRefWD.getForLabel(_test, "Bulk Edit Before Applying").setChecked(true);
            _test.waitAndClick(Locator.ext4Button("Submit"));
            _test.waitForElement(Ext4HelperWD.ext4Window("Bulk Edit"));
        }
        else
        {
            _test.waitAndClick(Locator.ext4Button("Submit"));
        }
    }

    public void toggleBulkEditField(String label)
    {
        Locator l = Ext4HelperWD.ext4Window("Bulk Edit").append(Locator.tagContainingText("label", label + ":").withClass("x4-form-item-label"));
        Assert.assertEquals(_test.getElementCount(l), 1, "More than 1 matching element found, use a more specific xpath");
        _test.click(l);
    }
}

