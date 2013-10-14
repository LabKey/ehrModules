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

import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.categories.EHR;
import org.labkey.test.categories.External;
import org.labkey.test.categories.ONPRC;
import org.labkey.test.util.LabModuleHelper;
import org.labkey.test.util.LogMethod;
import org.openqa.selenium.WebDriver;

import java.util.Date;

/**
 * User: bimber
 * Date: 11/27/12
 * Time: 1:15 PM
 *
 * This should contain tests designed to validate EHR data entry or associated business logic.
 * NOTE: EHRApiTest may be a better location for tests designed to test server-side trigger scripts
 * or similar business logic.
 */
@Category({External.class, EHR.class, ONPRC.class})
public class WNPRCEHRDataEntryTest extends AbstractEHRTest
{
    @BeforeClass @LogMethod
    public static void doSetup() throws Exception
    {
        WNPRCEHRDataEntryTest initTest = new WNPRCEHRDataEntryTest();
        initTest.doCleanup(false);

        initTest.initProject();

        currentTest = initTest;
    }

    @Test
    public void weightDataEntryTest()
    {
        clickProject(getProjectName());
        clickFolder(FOLDER_NAME);
        saveLocation();
        impersonate(FULL_SUBMITTER.getEmail());
        recallLocation();
        waitAndClickAndWait(Locator.linkWithText("Enter Data"));

        log("Create weight measurement task.");
        waitAndClickAndWait(Locator.linkWithText("Enter Weights"));
        waitForElement(Locator.name("title"), WAIT_FOR_JAVASCRIPT);
        waitForElement(Locator.xpath("//input[@name='title' and not(contains(@class, 'disabled'))]"), WAIT_FOR_JAVASCRIPT);
        _helper.waitForElementWithValue(this, "title", "Weight", 10000);

        setFormElement(Locator.name("title"), TASK_TITLE);
        _extHelper.selectComboBoxItem("Assigned To:", BASIC_SUBMITTER.getGroup() + "\u00A0"); // appended with a nbsp (Alt+0160)

        assertFormElementEquals(Locator.name("title"), TASK_TITLE);

        log("Add blank weight entries");
        clickButton("Add Record", 0);
        waitForElement(Locator.xpath("//input[@name='Id' and not(contains(@class, 'disabled'))]"), WAIT_FOR_JAVASCRIPT);
        // Form input doesn't seem to be enabled yet, so wait
        sleep(500);
        _extHelper.setExtFormElementByLabel("Id:", "noSuchAnimal");
        waitForText("Id not found", WAIT_FOR_JAVASCRIPT);
        _extHelper.setExtFormElementByLabel("Id:", DEAD_ANIMAL_ID);
        waitForText(DEAD_ANIMAL_ID, WAIT_FOR_JAVASCRIPT);

        //these fields seem to be forgetting their values, so verify they show the correct value
        assertFormElementEquals(Locator.name("title"), TASK_TITLE);

        waitForElement(Locator.button("Add Batch"), WAIT_FOR_JAVASCRIPT);
        clickButton("Add Batch", 0);
        _extHelper.waitForExtDialog("");
        _extHelper.setExtFormElementByLabel("", "Room(s):", ROOM_ID);
        _extHelper.clickExtButton("", "Submit", 0);
        waitForText(PROJECT_MEMBER_ID, WAIT_FOR_JAVASCRIPT);
        clickButton("Add Batch", 0);
        _extHelper.waitForExtDialog("");
        _extHelper.setExtFormElementByLabel("", "Id(s):", MORE_ANIMAL_IDS[0]+","+MORE_ANIMAL_IDS[1]+";"+MORE_ANIMAL_IDS[2]+" "+MORE_ANIMAL_IDS[3]+"\n"+MORE_ANIMAL_IDS[4]);
        _extHelper.clickExtButton("", "Submit", 0);
        waitForText(MORE_ANIMAL_IDS[0], WAIT_FOR_JAVASCRIPT);
        waitForText(MORE_ANIMAL_IDS[1], WAIT_FOR_JAVASCRIPT);
        waitForText(MORE_ANIMAL_IDS[2], WAIT_FOR_JAVASCRIPT);
        waitForText(MORE_ANIMAL_IDS[3], WAIT_FOR_JAVASCRIPT);
        waitForText(MORE_ANIMAL_IDS[4], WAIT_FOR_JAVASCRIPT);

        _helper.selectDataEntryRecord("weight", MORE_ANIMAL_IDS[0], true);
        _helper.selectDataEntryRecord("weight", MORE_ANIMAL_IDS[1], true);
        _helper.selectDataEntryRecord("weight", MORE_ANIMAL_IDS[2], true);
        clickButton("Delete Selected", 0);
        _extHelper.waitForExtDialog("Confirm");
        _extHelper.clickExtButton("Yes", 0);
        waitForElementToDisappear(Locator.tagWithText("div", PROTOCOL_MEMBER_IDS[0]), WAIT_FOR_JAVASCRIPT);
        waitForElementToDisappear(Locator.tagWithText("div", MORE_ANIMAL_IDS[0]), WAIT_FOR_JAVASCRIPT);
        waitForElementToDisappear(Locator.tagWithText("div", MORE_ANIMAL_IDS[1]), WAIT_FOR_JAVASCRIPT);

        _helper.selectDataEntryRecord("weight", MORE_ANIMAL_IDS[4], true);
        clickButton("Duplicate Selected", 0);
        _extHelper.waitForExtDialog("Duplicate Records");
        _extHelper.clickExtButton("Duplicate Records", "Submit", 0);
        _extHelper.waitForLoadingMaskToDisappear(WAIT_FOR_JAVASCRIPT);
        //TODO: verify this worked

        clickButton("Save & Close");

        waitForText("No data to show.", WAIT_FOR_JAVASCRIPT);
        _extHelper.clickExtTab("All Tasks");
        waitForElement(Locator.xpath("//div[contains(@class, 'all-tasks-marker') and "+Locator.NOT_HIDDEN+"]//table"), WAIT_FOR_JAVASCRIPT);
        Assert.assertEquals("Incorrect number of task rows.", 1, getElementCount(Locator.xpath("//div[contains(@class, 'all-tasks-marker') and " + Locator.NOT_HIDDEN + "]//tr[@class='labkey-alternate-row' or @class='labkey-row']")));
        _extHelper.clickExtTab("Tasks By Room");
        waitForElement(Locator.xpath("//div[contains(@class, 'room-tasks-marker') and "+Locator.NOT_HIDDEN+"]//table"), WAIT_FOR_JAVASCRIPT);
        Assert.assertEquals("Incorrect number of task rows.", 3, getElementCount(Locator.xpath("//div[contains(@class, 'room-tasks-marker') and " + Locator.NOT_HIDDEN + "]//tr[@class='labkey-alternate-row' or @class='labkey-row']")));
        _extHelper.clickExtTab("Tasks By Id");
        waitForElement(Locator.xpath("//div[contains(@class, 'id-tasks-marker') and "+Locator.NOT_HIDDEN+"]//table"), WAIT_FOR_JAVASCRIPT);
        Assert.assertEquals("Incorrect number of task rows.", 3, getElementCount(Locator.xpath("//div[contains(@class, 'id-tasks-marker') and " + Locator.NOT_HIDDEN + "]//tr[@class='labkey-alternate-row' or @class='labkey-row']")));

        stopImpersonating();

        log("Fulfil measurement task");
        impersonate(BASIC_SUBMITTER.getEmail());
        recallLocation();
        waitAndClickAndWait(Locator.linkWithText("Enter Data"));
        waitForElement(Locator.xpath("//div[contains(@class, 'my-tasks-marker') and "+Locator.NOT_HIDDEN+"]//table"), WAIT_FOR_JAVASCRIPT);
        waitForElement(Locator.linkContainingText(TASK_TITLE));

        String href = getAttribute(Locator.linkWithText(TASK_TITLE), "href");
        beginAt(href); // Clicking link opens in another window.
        waitForElement(Locator.xpath("/*//*[contains(@class,'ehr-weight-records-grid')]"), WAIT_FOR_JAVASCRIPT);
        waitForTextToDisappear("Loading...", WAIT_FOR_JAVASCRIPT);
        _helper.selectDataEntryRecord("weight", MORE_ANIMAL_IDS[4], false);
        waitForElement(Locator.linkWithText(MORE_ANIMAL_IDS[4]), WAIT_FOR_JAVASCRIPT);
        clickButton("Delete Selected", 0); // Delete duplicate record. It has served its purpose.
        _extHelper.waitForExtDialog("Confirm");
        _extHelper.clickExtButton("Yes", 0);
        waitForText("No Animal Selected", WAIT_FOR_JAVASCRIPT);
        _helper.selectDataEntryRecord("weight", PROJECT_MEMBER_ID, false);
        _extHelper.setExtFormElementByLabel("Weight (kg):", "3.333");
        _helper.selectDataEntryRecord("weight", MORE_ANIMAL_IDS[3], false);
        _extHelper.setExtFormElementByLabel("Weight (kg):", "4.444");
        _helper.selectDataEntryRecord("weight", MORE_ANIMAL_IDS[4], false);
        _extHelper.setExtFormElementByLabel("Weight (kg):", "5.555");

        clickButton("Submit for Review", 0);
        _extHelper.waitForExtDialog("Submit For Review");
        _extHelper.selectComboBoxItem("Assign To:", DATA_ADMIN.getGroup());
        _extHelper.clickExtButton("Submit For Review", "Submit");
        waitForText("Enter Blood Draws");
        waitForElement(Locator.id("userMenuPopupText"));

        sleep(1000); // Weird
        stopImpersonating();

        log("Verify Measurements");
        sleep(1000); // Weird
        impersonate(DATA_ADMIN.getEmail());
        recallLocation();
        waitAndClickAndWait(Locator.linkWithText("Enter Data"));
        waitForElement(Locator.xpath("//div[contains(@class, 'my-tasks-marker') and "+Locator.NOT_HIDDEN+"]//table"), WAIT_FOR_JAVASCRIPT);
        _extHelper.clickExtTab("Review Required");
        waitForElement(Locator.xpath("//div[contains(@class, 'review-requested-marker') and "+Locator.NOT_HIDDEN+"]//table"), WAIT_FOR_JAVASCRIPT);
        Assert.assertEquals("Incorrect number of task rows.", 1, getElementCount(Locator.xpath("//div[contains(@class, 'review-requested-marker') and " + Locator.NOT_HIDDEN + "]//tr[@class='labkey-alternate-row' or @class='labkey-row']")));
        String href2 = getAttribute(Locator.linkWithText(TASK_TITLE), "href");
        beginAt(href2); // Clicking opens in a new window.
        waitForElement(Locator.xpath("/*//*[contains(@class,'ehr-weight-records-grid')]"), WAIT_FOR_JAVASCRIPT);
        clickButton("Validate", 0);
        waitForElement(Locator.xpath("//button[text() = 'Submit Final' and "+Locator.ENABLED+"]"), WAIT_FOR_JAVASCRIPT);
        clickButton("Submit Final", 0);
        _extHelper.waitForExtDialog("Finalize Form");
        _extHelper.clickExtButton("Finalize Form", "Yes");
        waitForText("Enter Blood Draws");
        waitForElement(Locator.id("userMenuPopupText"));

        sleep(1000); // Weird
        stopImpersonating();
        sleep(1000); // Weird

        clickProject(PROJECT_NAME);
        clickFolder(FOLDER_NAME);
        waitAndClickAndWait(Locator.linkWithText("Browse All Datasets"));
        waitAndClickAndWait(LabModuleHelper.getNavPanelItem("Weight:", "Browse All"));

        setFilter("query", "date", "Equals", DATE_FORMAT.format(new Date()));
        assertTextPresent("3.333", "4.444", "5.555");
        Assert.assertEquals("Completed was not present the expected number of times", 3, getElementCount(Locator.xpath("//td[text() = 'Completed']")));
    }

    @Test
    public void mprDataEntryTest()
    {
        clickProject(PROJECT_NAME);
        clickFolder(FOLDER_NAME);
        saveLocation();
        impersonate(FULL_SUBMITTER.getEmail());
        recallLocation();
        waitAndClickAndWait(Locator.linkWithText("Enter Data"));

        log("Create MPR task.");
        waitAndClickAndWait(Locator.linkWithText("Enter MPR"));
        // Wait for page to fully render.
        waitForText("Treatments", WAIT_FOR_JAVASCRIPT);
        waitForElement(Locator.name("Id"), WAIT_FOR_JAVASCRIPT);
        waitForElement(Locator.name("title"), WAIT_FOR_JAVASCRIPT);
        _extHelper.selectComboBoxItem("Assigned To:", BASIC_SUBMITTER.getGroup() + "\u00A0"); // appended with a nbsp (Alt+0160)
        _extHelper.setExtFormElementByLabel("Id:", PROJECT_MEMBER_ID + "\t");
        click(Locator.xpath("//div[./label[normalize-space()='Id:']]//input"));
        waitForElement(Locator.linkWithText(PROJECT_MEMBER_ID), WAIT_FOR_JAVASCRIPT);
        _helper.setDataEntryField("title", MPR_TASK_TITLE);
        waitAndClick(Locator.name("title"));

        clickButton("Save & Close");

        waitForText("No data to show.", WAIT_FOR_JAVASCRIPT);
        _extHelper.clickExtTab("All Tasks");
        waitForElement(Locator.xpath("//div[contains(@class, 'all-tasks-marker') and "+Locator.NOT_HIDDEN+"]//table"), WAIT_FOR_JAVASCRIPT);
        Assert.assertEquals("Incorrect number of task rows.", 1, getElementCount(Locator.xpath("//div[contains(@class, 'all-tasks-marker') and " + Locator.NOT_HIDDEN + "]//tr[@class='labkey-alternate-row' or @class='labkey-row']")));
        _extHelper.clickExtTab("Tasks By Room");
        waitForElement(Locator.xpath("//div[contains(@class, 'room-tasks-marker') and "+Locator.NOT_HIDDEN+"]//table"), WAIT_FOR_JAVASCRIPT);
        Assert.assertEquals("Incorrect number of task rows.", 1, getElementCount(Locator.xpath("//div[contains(@class, 'room-tasks-marker') and " + Locator.NOT_HIDDEN + "]//tr[@class='labkey-alternate-row' or @class='labkey-row']")));
        _extHelper.clickExtTab("Tasks By Id");
        waitForElement(Locator.xpath("//div[contains(@class, 'id-tasks-marker') and "+Locator.NOT_HIDDEN+"]//table"), WAIT_FOR_JAVASCRIPT);
        Assert.assertEquals("Incorrect number of task rows.", 1, getElementCount(Locator.xpath("//div[contains(@class, 'id-tasks-marker') and " + Locator.NOT_HIDDEN + "]//tr[@class='labkey-alternate-row' or @class='labkey-row']")));
        stopImpersonating();

        log("Fulfil MPR task");
        impersonate(BASIC_SUBMITTER.getEmail());
        recallLocation();
        waitAndClickAndWait(Locator.linkWithText("Enter Data"));
        waitForElement(Locator.xpath("//div[contains(@class, 'my-tasks-marker') and "+VISIBLE+"]//table"), WAIT_FOR_JAVASCRIPT);
        String href = getAttribute(Locator.linkWithText(MPR_TASK_TITLE), "href");
        beginAt(href);

        // Wait for page to fully render.
        waitForText("Treatments", WAIT_FOR_JAVASCRIPT);
        waitForElement(Locator.name("Id"), WAIT_FOR_PAGE);
        waitForElement(Locator.name("title"), WAIT_FOR_JAVASCRIPT);
        waitForElement(Locator.xpath("/*//*[contains(@class,'ehr-drug_administration-records-grid')]"), WAIT_FOR_JAVASCRIPT);
        _extHelper.selectComboBoxItem("Project:", PROJECT_ID + " (" + DUMMY_PROTOCOL + ")\u00A0");
        _extHelper.selectComboBoxItem("Type:", "Physical Exam\u00A0");
        _helper.setDataEntryField("remark", "Bonjour");
        _helper.setDataEntryField("performedby", BASIC_SUBMITTER.getEmail());

        log("Add treatments record.");
        waitForElement(Locator.xpath("/*//*[contains(@class,'ehr-drug_administration-records-grid')]"), WAIT_FOR_JAVASCRIPT);
        _helper.clickVisibleButton("Add Record");

        //a proxy for when the record has been added and bound to the form
        waitForElement(Locator.xpath("//div[./div/span[text()='Treatments & Procedures']]//input[@name='enddate' and not(contains(@class, 'disabled'))]"), WAIT_FOR_JAVASCRIPT);
        setFormElementJS(Locator.xpath("//div[./div/span[text()='Treatments & Procedures']]//input[@name='enddate']/..//input[contains(@id, 'date')]"), DATE_FORMAT.format(new Date()));

        waitForElement(Locator.xpath("//div[./div/span[text()='Treatments & Procedures']]//input[@name='code' and not(contains(@class, 'disabled'))]"), WAIT_FOR_JAVASCRIPT);
        sleep(250);
        _extHelper.selectComboBoxItem("Code:", "Antibiotic");
        sleep(250);

        //this is a poor solution, but the normal helper was unreliable.  when converting to Ext4 this should be removed
        _helper.selectSnomedComboBoxItem(Locator.xpath("//input[@name='code']/.."), "amoxicillin (c-54620)");

        _extHelper.selectComboBoxItem("Route:", "oral\u00a0");
        _helper.setDataEntryFieldInTab("Treatments & Procedures", "concentration", "5");
        _extHelper.selectComboBoxItem(Locator.xpath("//input[@name='conc_units']/.."), "mg/tablet\u00a0");

        //TODO: assert units

        _helper.setDataEntryFieldInTab("Treatments & Procedures", "dosage", "2");
        click(Locator.xpath("//img["+VISIBLE+" and contains(@class, 'x-form-search-trigger')]"));
        waitForElement(Locator.xpath("//div[@class='x-form-invalid-msg']"), WAIT_FOR_JAVASCRIPT);
        _helper.setDataEntryFieldInTab("Treatments & Procedures", "remark", "Yum");

        //TODO: Test more procedures.
//        log("Add blood draw record.");
//        _extHelper.clickExtTab(this, "Blood Draws");
//        waitForElement(Locator.xpath("//*["+VISIBLE+" and contains(@class,'ehr-blood_draws-records-grid')]"), WAIT_FOR_JAVASCRIPT);
//        clickVisibleButton("Add Record");
//
//        log("Add recovery observation");
//        _extHelper.clickExtTab(this, "Recovery Observations");
//        waitForElement(Locator.xpath("//*["+VISIBLE+" and contains(@class,'ehr-clinical_observations-records-grid')]"), WAIT_FOR_JAVASCRIPT);
//        clickVisibleButton("Add Record");
//
//        log("Add procedure code");
//        _extHelper.clickExtTab(this, "Procedure Codes");
//        waitForElement(Locator.xpath("//*["+VISIBLE+" and contains(@class,'ehr-procedure_codes-records-grid')]"), WAIT_FOR_JAVASCRIPT);
//        clickVisibleButton("Add Record");
//
//        log("Add housing record.");
//        _extHelper.clickExtTab(this, "Housing Moves/Restraint");
//        waitForElement(Locator.xpath("//*["+VISIBLE+" and contains(@class,'ehr-housing-records-grid')]"), WAIT_FOR_JAVASCRIPT);
//        clickVisibleButton("Add Record");
//
//        log("Add weight record.");
//        _extHelper.clickExtTab(this, "Weight");
//        waitForElement(Locator.xpath("//*["+VISIBLE+" and contains(@class,'ehr-weight-records-grid')]"), WAIT_FOR_JAVASCRIPT);
//        clickVisibleButton("Add Record");
//
//        log("Add charge");
//        _extHelper.clickExtTab(this, "Charges");
//        waitForElement(Locator.xpath("/*//*["+VISIBLE+" and not(contains(@class, 'x-hide-display')) and contains(@class,'ehr-charges-records-grid')]"), WAIT_FOR_JAVASCRIPT);
//        clickVisibleButton("Add Record");

        clickButton("Save & Close");
        waitForText("Data Entry");

        stopImpersonating();
    }

    @Override
    public BrowserType bestBrowser()
    {
        return BrowserType.CHROME;
    }
}
