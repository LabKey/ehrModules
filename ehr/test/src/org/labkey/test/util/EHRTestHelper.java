/*
 * Copyright (c) 2012-2014 LabKey Corporation
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
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.tests.EHRReportingAndUITest;
import org.labkey.test.util.ext4cmp.Ext4CmpRef;
import org.labkey.test.util.ext4cmp.Ext4ComboRef;
import org.labkey.test.util.ext4cmp.Ext4FieldRef;
import org.labkey.test.util.ext4cmp.Ext4GridRef;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

import static org.labkey.test.BaseWebDriverTest.WAIT_FOR_JAVASCRIPT;

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
        _test.log("setting data entry field: " + fieldName);
        _test.setFormElement(Locator.xpath("//div[./div/span[text()='" + tabName + "']]//*[(self::input or self::textarea) and @name='" + fieldName + "']"), value);
        _test.log("finished setting data entry field: " + fieldName);
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
        _test.log("creating user via API: " + email);
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
                return null != _test._ext4Helper.queryOne(query, Ext4CmpRef.class);
            }
        }, "Component did not appear for query: " + query, WAIT_FOR_JAVASCRIPT);
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

        _test.waitForElement(Ext4Helper.Locators.ext4Button("Save Draft"));
        Ext4CmpRef saveBtn = _test._ext4Helper.queryOne("button[text='Save Draft']", Ext4CmpRef.class);
        saveBtn.waitForEnabled();
    }

    public Ext4FieldRef getExt4FieldForFormSection(String sectionTitle, String fieldLabel)
    {
        return _test._ext4Helper.queryOne("panel[title='" + sectionTitle + "'] [fieldLabel='" + fieldLabel + "']", Ext4FieldRef.class);
    }

    public Ext4GridRef getExt4GridForFormSection(String sectionTitle)
    {
        String query = "panel[title='" + sectionTitle + "']";
        Ext4CmpRef.waitForComponent(_test, query);
        Ext4GridRef grid = _test._ext4Helper.queryOne(query, Ext4GridRef.class);
        if (grid != null)
            grid.setClicksToEdit(1);

        return grid;
    }

    public Locator getDataEntryButton(String text)
    {
        return Ext4Helper.Locators.ext4Button(text).withClass("ehr-dataentrybtn");
    }

    public void addRecordToGrid(Ext4GridRef grid)
    {
        Integer count = grid.getRowCount();
        grid.clickTbarButton("Add");
        grid.waitForRowCount(count + 1);
        grid.cancelEdit();
        _test.sleep(50);
    }

    public void clickExt4WindowBtn(String title, String label)
    {
        _test.waitForElement(Ext4Helper.ext4Window(title));
        _test.waitAndClick(Locator.tag("div").withClass("x4-window").notHidden().append(Ext4Helper.Locators.ext4Button(label)));
    }

    public void applyTemplate(Ext4GridRef grid, String templateName, boolean bulkEdit, Date date)
    {
        grid.clickTbarButton("Templates");

        _test.waitAndClick(Ext4Helper.ext4MenuItem("Templates").notHidden());
        _test.waitAndClick(Ext4Helper.ext4MenuItem(templateName).notHidden());

        _test.waitForElement(Ext4Helper.ext4Window("Apply Template"));
        Ext4ComboRef combo = new Ext4ComboRef(Ext4ComboRef.getForLabel(_test, "Template Name").getId(), _test);
        combo.waitForStoreLoad();
        Assert.assertEquals(combo.getDisplayValue(), templateName);

        if (date != null)
        {
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
            SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm");
            _test._ext4Helper.queryOne("window datefield", Ext4FieldRef.class).setValue(dateFormat.format(date));
            _test._ext4Helper.queryOne("window timefield", Ext4FieldRef.class).setValue(timeFormat.format(date));
        }

        if (bulkEdit)
        {
            Ext4FieldRef.getForLabel(_test, "Bulk Edit Before Applying").setChecked(true);
            _test.waitAndClick(Ext4Helper.Locators.ext4Button("Submit"));
            _test.waitForElement(Ext4Helper.ext4Window("Bulk Edit"));
        }
        else
        {
            _test.waitAndClick(Ext4Helper.Locators.ext4Button("Submit"));
        }
    }

    public void toggleBulkEditField(String label)
    {
        Locator l = Ext4Helper.ext4Window("Bulk Edit").append(Locator.tagContainingText("label", label + ":").withClass("x4-form-item-label"));
        Assert.assertEquals(_test.getElementCount(l), 1, "More than 1 matching element found, use a more specific xpath");
        _test.click(l);
    }

    public void discardForm()
    {
        _test.waitAndClick(getDataEntryButton("More Actions"));
        _test._ext4Helper.clickExt4MenuItem("Discard");
        _test.waitForElement(Ext4Helper.ext4Window("Discard Form"));
        _test.clickAndWait(Ext4Helper.Locators.ext4Button("Yes"));

        _test.waitForElement(Locator.tagWithText("span", "Enter Data"));
    }
}

