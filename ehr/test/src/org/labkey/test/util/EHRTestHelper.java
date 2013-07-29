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
import org.labkey.remoteapi.Connection;
import org.labkey.remoteapi.security.AddGroupMembersCommand;
import org.labkey.remoteapi.security.CreateGroupCommand;
import org.labkey.remoteapi.security.CreateGroupResponse;
import org.labkey.remoteapi.security.CreateUserCommand;
import org.labkey.remoteapi.security.CreateUserResponse;
import org.labkey.test.BaseSeleniumWebTest;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.tests.EHRReportingAndUITest;
import org.labkey.test.util.ext4cmp.Ext4CmpRefWD;

import java.io.IOException;

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
}

