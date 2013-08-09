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
package org.labkey.test.tests;

import org.junit.Assert;
import org.junit.experimental.categories.Category;
import org.labkey.remoteapi.CommandException;
import org.labkey.remoteapi.Connection;
import org.labkey.remoteapi.query.ContainerFilter;
import org.labkey.remoteapi.query.Filter;
import org.labkey.remoteapi.query.InsertRowsCommand;
import org.labkey.remoteapi.query.SelectRowsCommand;
import org.labkey.remoteapi.query.SelectRowsResponse;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.ModulePropertyValue;
import org.labkey.test.TestTimeoutException;
import org.labkey.test.categories.EHR;
import org.labkey.test.categories.External;
import org.labkey.test.categories.ONPRC;
import org.labkey.test.util.AdvancedSqlTest;
import org.labkey.test.util.DataRegionTable;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.PasswordUtil;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

/**
 * User: bbimber
 * Date: 8/24/12
 * Time: 7:02 AM
 */
@Category({External.class, EHR.class, ONPRC.class})
public class ComplianceTrainingTest extends BaseWebDriverTest implements AdvancedSqlTest
{
    private String listZIP =  getLabKeyRoot() + "/server/customModules/EHR_ComplianceDB/tools/SOP_Lists.zip";

    @Override
    protected String getProjectName()
    {
        return "ComplianceTraining";// + TRICKY_CHARACTERS_FOR_PROJECT_NAMES;
    }

    @Override
    protected void doTestSteps() throws Exception
    {
        setUpTest();
        testSopSubmission();

    }

    private void testSopSubmission() throws Exception
    {
        beginAt("/ehr_compliancedb/" + getProjectName() + "/SOP_submission.view");
        reloadPage();

        Assert.assertTrue("Submit button not disabled", isElementPresent(Locator.xpath("//button[@id='SOPsubmitButton' and @disabled]")));

        DataRegionTable dr1 = getDataRegion(0);
        DataRegionTable dr2 = getDataRegion(1);
        Assert.assertEquals("Incorrect row count found", 1, dr1.getDataRowCount());
        Assert.assertEquals("Incorrect row count found", 0, dr2.getDataRowCount());

        dr1.checkAllOnPage();
        clickButton("Mark Read");
        reloadPage();

        dr1 = getDataRegion(0);
        dr2 = getDataRegion(1);
        Assert.assertEquals("Incorrect row count found", 0, dr1.getDataRowCount());
        Assert.assertEquals("Incorrect row count found", 1, dr2.getDataRowCount());

        Assert.assertFalse("Submit button is still disabled", isElementPresent(Locator.xpath("//button[@id='SOPsubmitButton' and @disabled]")));

        dr2.checkAllOnPage();
        clickButton("Mark Reread");
        reloadPage();

        checkCheckbox(Locator.xpath("//input[@id='sopCheck']"));
        uncheckCheckbox(Locator.xpath("//input[@id='sopCheck']"));
        clickButton("Submit", 0);
        assertAlert("You must check the box above the submit button to certify you have read your SOPs");

        checkCheckbox(Locator.xpath("//input[@id='sopCheck']"));
        clickButton("Submit", 0);
        waitForElement(Ext4Helper.ext4Window("SOPs Complete"));
        clickButton("OK");
    }

    private void reloadPage()
    {
        waitForText("Mark Read");
        waitForText("Mark Reread");
    }

    private DataRegionTable getDataRegion(int idx)
    {
        Locator.XPathLocator form = Locator.xpath("//form[div/table[starts-with(@id, 'dataregion_')]]").index(idx);
        waitForElement(form);
        String id = getAttribute(form, "id");
        return new DataRegionTable(id, this);
    }

    protected void setUpTest() throws Exception
    {
        _containerHelper.createProject(getProjectName(), "Compliance and Training");
        goToProjectHome();

        setModuleProperties(Arrays.asList(new ModulePropertyValue("EHR_ComplianceDB", "/", "EmployeeContainer", "/" + getProjectName())));

        log("Creating Lists");
        _listHelper.importListArchive(getProjectName(), new File(listZIP));

        try
        {
            Connection cn = new Connection(getBaseURL(), PasswordUtil.getUsername(), PasswordUtil.getPassword());

            InsertRowsCommand insertCmd;
            Map<String,Object> rowMap;

            //verify SOP requirement present
            String reqName = "SOP REVIEW-ANNUAL";
            SelectRowsCommand select = new SelectRowsCommand("ehr_compliancedb", "requirements");
            select.addFilter(new Filter("requirementname", reqName, Filter.Operator.EQUAL));
            select.setContainerFilter(ContainerFilter.AllFolders);
            SelectRowsResponse resp = select.execute(cn, getProjectName());

            if (resp.getRows().size() == 0)
            {
                insertCmd = new InsertRowsCommand("ehr_compliancedb", "requirements");
                rowMap = new HashMap<>();
                rowMap.put("requirementname", reqName);

                insertCmd.addRow(rowMap);
                insertCmd.execute(cn, getProjectName());
            }

            //verify category present
            String category = "Category";
            select = new SelectRowsCommand("ehr_compliancedb", "employeecategory");
            select.addFilter(new Filter("categoryname", category, Filter.Operator.EQUAL));
            resp = select.execute(cn, getProjectName());

            if (resp.getRows().size() == 0)
            {
                insertCmd = new InsertRowsCommand("ehr_compliancedb", "employeecategory");
                rowMap = new HashMap<>();
                rowMap.put("categoryname", category);

                insertCmd.addRow(rowMap);
                insertCmd.execute(cn, getProjectName());
            }

            //create employee record
            insertCmd = new InsertRowsCommand("ehr_compliancedb", "employees");
            rowMap = new HashMap<>();
            rowMap.put("employeeid", PasswordUtil.getUsername());
            rowMap.put("email", PasswordUtil.getUsername());
            rowMap.put("firstname", "Test");
            rowMap.put("lastname", "User");
            rowMap.put("category", category);

            insertCmd.addRow(rowMap);
            insertCmd.execute(cn, getProjectName());

            //add SOP record
            insertCmd = new InsertRowsCommand("lists", "SOPs");
            rowMap = new HashMap<>();
            rowMap.put("Id", "SOP1");
            rowMap.put("name", "SOP 1");

            insertCmd.addRow(rowMap);
            insertCmd.execute(cn, getProjectName());

            //add record to SOP requirements
            insertCmd = new InsertRowsCommand("ehr_compliancedb", "sopbycategory");
            rowMap = new HashMap<>();
            rowMap.put("sop_id", "SOP1");
            rowMap.put("category", category);

            insertCmd.addRow(rowMap);
            insertCmd.execute(cn, getProjectName());
        }
        catch (CommandException e)
        {
            throw new RuntimeException(e);
        }
        catch (IOException e)
        {
            throw new RuntimeException(e);
        }
    }

    @Override
    protected void doCleanup(boolean afterTest) throws TestTimeoutException
    {
        deleteProject(getProjectName(), afterTest);
    }

    @Override
    public String getAssociatedModuleDirectory()
    {
        return null;
    }

    @Override
    public boolean isFileUploadTest()
    {
        return true;
    }

    @Override public BrowserType bestBrowser()
    {
        return BrowserType.CHROME;
    }
}
