/*
 * Copyright (c) 2015-2017 LabKey Corporation
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
package org.labkey.test.tests.ehr;

import org.json.simple.JSONObject;
import org.junit.Assert;
import org.junit.Test;
import org.labkey.remoteapi.CommandResponse;
import org.labkey.remoteapi.PostCommand;
import org.labkey.test.Locator;
import org.labkey.test.pages.ehr.AnimalHistoryPage;
import org.labkey.test.util.DataRegionTable;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.LoggedParam;
import org.labkey.test.util.PortalHelper;
import org.labkey.test.util.ext4cmp.Ext4ComboRef;
import org.labkey.test.util.external.labModules.LabModuleHelper;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import static org.junit.Assert.assertEquals;

//Inherit from this class instead of AbstractEHRTest when you want to run these tests, which should work across all ehr modules
public abstract class AbstractGenericEHRTest extends AbstractEHRTest
{
    @Test
    public void customActionsTest()
    {
        log("verifying custom actions");

        //housing queries
        beginAt("/project/" + getContainerPath() + "/begin.view");
        waitAndClick(Locator.linkWithText("Housing Queries"));
        waitForTextToDisappear("Loading");
        waitForElement(Locator.tagContainingText("div", "View:")); //a proxy for the search panel loading
        assertNoErrorText();

        //animal queries
        beginAt("/project/" + getContainerPath() + "/begin.view");
        waitAndClick(Locator.linkWithText("Animal Search"));
        waitForTextToDisappear("Loading");
        waitForElement(Locator.tagContainingText("div", "View:")); //a proxy for the search panel loading
        assertNoErrorText();

        //project, protocol queries
        beginAt("/project/" + getContainerPath() + "/begin.view");
        waitAndClick(Locator.linkWithText("Protocol and Project Queries"));
        waitForTextToDisappear("Loading");
        waitForElement(Locator.tagContainingText("div", "View:")); //a proxy for the search panel loading
        waitForElement(Locator.linkContainingText("Find Assignments Overlapping A Date Range"));
        assertNoErrorText();

        //participant page
        beginAt("/query/" + getContainerPath() + "/executeQuery.view?schemaName=study&query.queryName=animal");
        waitForText("Animal");
        DataRegionTable dr = new DataRegionTable("query", this);
        clickAndWait(dr.link(1, "Id"));
        log("Inspecting details page");
        waitForElement(Locator.tagWithText("b", "Summary:"));
        waitForElement(Locator.tagContainingText("span", "Weights - "));
        assertNoErrorText();
    }

    @Test
    public void testQuickSearch()
    {
        //TODO: can I interact with this as a menu webpart?
        log("Add quick search webpart");
        navigateToFolder(getProjectName(), getFolderName());
        (new PortalHelper(this)).addWebPart("Quick Search");
        log("Quick Search - Show Animal");
        navigateToFolder(getProjectName(), getFolderName());
        waitForElement(Locator.linkWithText("Advanced Animal Search"), WAIT_FOR_JAVASCRIPT);
        setFormElement(Locator.name("animal"), MORE_ANIMAL_IDS[0]);
        waitAndClickAndWait(Ext4Helper.Locators.ext4Button("Show Animal"));
        waitForElement(Locator.css(".labkey-wp-title-text").withText("Overview: " + MORE_ANIMAL_IDS[0]));
        assertTitleContains("Animal Details: " + MORE_ANIMAL_IDS[0]);

        log("Quick Search - Show Project");
        navigateToFolder(getProjectName(), getFolderName());
        waitForElement(Locator.linkWithText("Advanced Animal Search"), WAIT_FOR_JAVASCRIPT);
        _ext4Helper.queryOne("#projectField", Ext4ComboRef.class).setComboByDisplayValue(PROJECT_ID);
        waitAndClickAndWait(Ext4Helper.Locators.ext4Button("Show Project"));
        waitForElement(Locator.linkWithText(DUMMY_PROTOCOL), WAIT_FOR_JAVASCRIPT);

        log("Quick Search - Show Protocol");
        navigateToFolder(getProjectName(), getFolderName());
        waitForElement(Locator.linkWithText("Advanced Animal Search"), WAIT_FOR_JAVASCRIPT);
        _ext4Helper.queryOne("#protocolField", Ext4ComboRef.class).setComboByDisplayValue(PROTOCOL_ID);
        waitAndClickAndWait(Ext4Helper.Locators.ext4Button("Show Protocol"));
        waitForElement(Locator.linkWithText(PROTOCOL_ID), WAIT_FOR_JAVASCRIPT);
    }

    @Test
    public void testWeightValidation() throws Exception
    {
        //initialize wieght of subject 0
        String[] fields;
        Object[][] data;
        PostCommand insertCommand;
        fields = new String[]{"Id", "date", "weight", "QCStateLabel"};
        data = new Object[][]{
                {SUBJECTS[3], new Date(), 12, EHRQCState.COMPLETED.label},
        };
        insertCommand = getApiHelper().prepareInsertCommand("study", "Weight", "lsid", fields, data);
        getApiHelper().doSaveRows(DATA_ADMIN.getEmail(), insertCommand, getExtraContext());

        //expect weight out of range
        data = new Object[][]{
                {SUBJECTS[3], new Date(), null, null, 120, EHRQCState.IN_PROGRESS.label, null, null, "recordID"}
        };
        Map<String, List<String>> expected = new HashMap<>();
        expected.put("weight", Arrays.asList(
                        "WARN: Weight above the allowable value of 20.0 kg for Cynomolgus",
                        "INFO: Weight gain of >10%. Last weight 12 kg")
        );
        getApiHelper().testValidationMessage(DATA_ADMIN.getEmail(), "study", "weight", weightFields, data, expected);

        //expect INFO for +10% diff
        data = new Object[][]{
                {SUBJECTS[3], new Date(), null, null, 20, EHRQCState.IN_PROGRESS.label, null, null, "recordID"}
        };
        expected = new HashMap<>();
        expected.put("weight", Collections.singletonList("INFO: Weight gain of >10%. Last weight 12 kg"));
        getApiHelper().testValidationMessage(DATA_ADMIN.getEmail(), "study", "weight", weightFields, data, expected);

        //expect INFO for -10% diff
        data = new Object[][]{
                {SUBJECTS[3], new Date(), null, null, 5, EHRQCState.IN_PROGRESS.label, null, null, "recordID"}
        };
        expected = new HashMap<>();
        expected.put("weight", Collections.singletonList("INFO: Weight drop of >10%. Last weight 12 kg"));
        getApiHelper().testValidationMessage(DATA_ADMIN.getEmail(), "study", "weight", weightFields, data, expected);

        //TODO: test error threshold
    }

    @Test
    public void testSecurityDataAdmin() throws Exception
    {
        testUserAgainstAllStates(DATA_ADMIN);
    }

    @Test
    public void testSecurityRequester() throws Exception
    {
        testUserAgainstAllStates(REQUESTER);
    }

    @Test
    public void testSecurityBasicSubmitter() throws Exception
    {
        testUserAgainstAllStates(BASIC_SUBMITTER);
    }

    @Test
    public void testSecurityFullSubmitter() throws Exception
    {
        testUserAgainstAllStates(FULL_SUBMITTER);
    }

    @Test
    public void testSecurityFullUpdater() throws Exception
    {
        testUserAgainstAllStates(FULL_UPDATER);
    }


    @Test
    public void testSecurityRequestAdmin() throws Exception
    {
        testUserAgainstAllStates(REQUEST_ADMIN);
    }

    @Test
    public void testCustomButtons()
    {
        log("verifying custom buttons");

        //housing queries
        beginAt("/project/" + getContainerPath() + "/begin.view");
        waitAndClick(Locator.linkWithText("Browse All Datasets"));
        waitForText("Weight:");
        waitAndClick(LabModuleHelper.getNavPanelItem("Weight:", VIEW_TEXT));
        DataRegionTable dr = new DataRegionTable("query", this);
        saveLocation();
        checkCheckbox(Locator.checkboxByName(".select").index(0));
        checkCheckbox(Locator.checkboxByName(".select").index(1));
        String animal1 = dr.getDataAsText(0,"Id");
        String animal2 = dr.getDataAsText(0, "Id");
        dr.clickHeaderMenu("More Actions", false, "Compare Weights");
        waitForText(5000, "Weight 1", "Weight 2", "Days Between", "% Change");
        waitAndClick(Ext4Helper.Locators.ext4Button("OK"));
        dr.clickHeaderMenu("More Actions", true, "Jump To History");
        assertTextPresent("Animal History");
        sleep(5000);
        recallLocation();
        List<String> submenuItems = dr.getHeaderMenuOptions("More Actions");
        List<String> expectedSubmenu = Arrays.asList("Jump To History", "Return Distinct Values","Show Record History","Compare Weights","Edit Records");
        Assert.assertEquals("More actions menu did not contain expected options",expectedSubmenu, submenuItems);
    }

    private void testUserAgainstAllStates(@LoggedParam EHRUser user) throws Exception
    {
        JSONObject extraContext = new JSONObject();
        extraContext.put("errorThreshold", "ERROR");
        extraContext.put("skipIdFormatCheck", true);
        extraContext.put("allowAnyId", true);
        CommandResponse response;

        //maintain list of insert/update times for interest
        _saveRowsTimes = new ArrayList<>();

        //test insert
        Object[][] insertData = {weightData1};
        insertData[0][Arrays.asList(weightFields).indexOf(FIELD_OBJECTID)] = null;
        insertData[0][Arrays.asList(weightFields).indexOf(FIELD_LSID)] = null;
        PostCommand insertCommand = getApiHelper().prepareInsertCommand("study", "Weight", FIELD_LSID, weightFields, insertData);

        for (EHRQCState qc : EHRQCState.values())
        {
            extraContext.put("targetQC", qc.label);
            boolean successExpected = successExpected(user.getRole(), qc, "insert");
            log("Testing role: " + user.getRole().name() + " with insert of QCState: " + qc.label);
            if (successExpected)
                getApiHelper().doSaveRows(user.getEmail(), insertCommand, extraContext);
            else
                getApiHelper().doSaveRowsExpectingError(user.getEmail(), insertCommand, extraContext);
        }
        calculateAverage();

        //then update.  update is fun b/c we need to test many QCState combinations.  Updating a row from 1 QCstate to a new QCState technically
        //requires update Permission on the original QCState, plus insert Permission into the new QCState
        for (EHRQCState originalQc : EHRQCState.values())
        {
            // first create an initial row as a data admin
            UUID objectId = UUID.randomUUID();
            Object[][] originalData = {weightData1};
            originalData[0][Arrays.asList(weightFields).indexOf(FIELD_QCSTATELABEL)] = originalQc.label;
            extraContext.put("targetQC", originalQc.label);
            originalData[0][Arrays.asList(weightFields).indexOf(FIELD_OBJECTID)] = objectId.toString();
            PostCommand initialInsertCommand = getApiHelper().prepareInsertCommand("study", "Weight", FIELD_LSID, weightFields, originalData);
            log("Inserting initial record for update test, with initial QCState of: " + originalQc.label);
            response = getApiHelper().doSaveRows(DATA_ADMIN.getEmail(), initialInsertCommand, extraContext);

            String lsid = getLsidFromResponse(response);
            originalData[0][Arrays.asList(weightFields).indexOf(FIELD_LSID)] = lsid;

            //then try to update to all other QCStates
            for (EHRQCState qc : EHRQCState.values())
            {
                boolean successExpected = originalQc.equals(qc) ? successExpected(user.getRole(), originalQc, "update") : successExpected(user.getRole(), originalQc, "update") && successExpected(user.getRole(), qc, "insert");
                log("Testing role: " + user.getRole().name() + " with update from QCState " + originalQc.label + " to: " + qc.label);
                originalData[0][Arrays.asList(weightFields).indexOf(FIELD_QCSTATELABEL)] = qc.label;
                PostCommand updateCommand = getApiHelper().prepareUpdateCommand("study", "Weight", FIELD_LSID, weightFields, originalData, null);
                extraContext.put("targetQC", qc.label);
                if (!successExpected)
                    getApiHelper().doSaveRowsExpectingError(user.getEmail(), updateCommand, extraContext);
                else
                {
                    getApiHelper().doSaveRows(user.getEmail(), updateCommand, extraContext);
                    log("Resetting QCState of record to: " + originalQc.label);
                    originalData[0][Arrays.asList(weightFields).indexOf(FIELD_QCSTATELABEL)] = originalQc.label;
                    extraContext.put("targetQC", originalQc.label);
                    updateCommand = getApiHelper().prepareUpdateCommand("study", "Weight", FIELD_LSID, weightFields, originalData, null);
                    getApiHelper().doSaveRows(DATA_ADMIN.getEmail(), updateCommand, extraContext);
                }
            }
        }

        //log the average save time
        //TODO: eventually we should set a threshold and assert we dont exceed it
        calculateAverage();

        simpleSignIn(); //NOTE: this is designed to force the test to sign in, assuming our session was timed out from all the API tests
        resetErrors();  //note: inserting records without permission will log errors by design.  the UI should prevent this from happening, so we want to be aware if it does occur
    }

    @Test
    public void testCalculatedAgeColumns()
    {
        String subjectId = "test2008446";

        beginAt(String.format("query/%s/executeQuery.view?schemaName=study&query.queryName=Weight&query.viewName=&query.Id~contains=%s", getContainerPath(), subjectId));
        _customizeViewsHelper.openCustomizeViewPanel();
        _customizeViewsHelper.addColumn("ageAtTime/AgeAtTime");
        _customizeViewsHelper.addColumn("ageAtTime/AgeAtTimeYearsRounded");
        _customizeViewsHelper.addColumn("ageAtTime/AgeAtTimeMonths");
        _customizeViewsHelper.applyCustomView();

        DataRegionTable table = new DataRegionTable("query", this);
        int columnCount = table.getColumnCount();
        List<String> row = table.getRowDataAsText(0);
        assertEquals("Calculated ages are incorrect", Arrays.asList("3.9", "3.0", "47.0"), row.subList(columnCount - 3, columnCount));
    }

    private void calculateAverage()
    {
        if (_saveRowsTimes.size() == 0)
            return;

        long sum = 0;
        for(long time : _saveRowsTimes){
            sum += time;
        }

        //calculate average of all elements
        long average = sum / _saveRowsTimes.size();
        log("The average save time per record was : " + average + " ms");

        _saveRowsTimes = new ArrayList<>();
    }

    private boolean successExpected(EHRRole role, EHRQCState qcState, String permission)
    {
        // Expand to other request types once we start testing them. Insert only for now.
        return allowedActions.contains(new Permission(role, qcState, permission));
    }

    private String getLsidFromResponse(CommandResponse response)
    {
        if (response.getProperty("exception") != null)
        {
            throw new RuntimeException(response.getProperty("exception").toString());
        }
        return response.getProperty("result[0].rows[0].values." + FIELD_LSID);
    }

    protected void openClinicalHistoryForAnimal(String animalId)
    {
        //chronological history
        AnimalHistoryPage animalHistoryPage = new AnimalHistoryPage(getDriver());
        animalHistoryPage.searchSingleAnimal(animalId);
        animalHistoryPage.clickCategoryTab("Clinical");
        animalHistoryPage.clickReportTab("Clinical History");
    }

    protected void beginAtAnimalHistoryTab()
    {
        beginAt(getAnimalHistoryPath());
    }

    protected void checkClinicalHistoryType(List<String> expectedLabels)
    {
        waitAndClick(Locator.linkWithText("Show/Hide Types"));
        List<WebElement> elements = getWrappedDriver().findElements(By.cssSelector("table.x4-form-type-checkbox label.x4-form-cb-label"));
        Set<String> labels = new HashSet<>(getTexts(elements));
        assertEquals("Wrong Clinical History Options",new HashSet<>(expectedLabels),labels);
    }

    protected abstract String getAnimalHistoryPath();
}
