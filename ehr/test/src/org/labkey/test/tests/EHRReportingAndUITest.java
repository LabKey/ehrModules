/*
 * Copyright (c) 2011-2013 LabKey Corporation
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
import org.labkey.test.Locator;
import org.labkey.test.SortDirection;
import org.labkey.test.TestTimeoutException;
import org.labkey.test.categories.EHR;
import org.labkey.test.categories.External;
import org.labkey.test.categories.ONPRC;
import org.labkey.test.util.DataRegionTable;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.LabModuleHelper;
import org.labkey.test.util.ext4cmp.Ext4CmpRefWD;
import org.labkey.test.util.ext4cmp.Ext4ComboRefWD;
import org.labkey.test.util.ext4cmp.Ext4FieldRefWD;

@Category({External.class, EHR.class, ONPRC.class})
public class EHRReportingAndUITest extends AbstractEHRTest
{
    @Override
    public void doCleanup(boolean afterTest) throws TestTimeoutException
    {
        super.doCleanup(afterTest);
    }

    @Override
    public void runUITests() throws Exception
    {
        initProject();

        detailsPagesTest();
        viewsTest();
        customActionsTest();
        animalHistoryTest();
        quickSearchTest();
    }

    /**
     * This test will hit a variety of EHR views and provides a very basic test of the UI on that page.  Initially it will
     * just look for JS errors and certain keywords, like 'error' or 'failed'.
     */
    private void detailsPagesTest()
    {
        String VIEW_TEXT = "Browse All";

        clickProject(getProjectName());
        clickFolder(FOLDER_NAME);

        waitAndClickAndWait(Locator.linkWithText("Browse All Datasets"));

        //TODO: place these in a WNPRC_EHRTest if one if ever created
//        waitForText("Biopsies");
//        waitAndClick(LabModuleHelper.getNavPanelItem("Biopsies:", VIEW_TEXT));
//
//        waitForText("details");
//        DataRegionTable dr = new DataRegionTable("query", this);
//        dr.clickLink(0, 0);
//        //these are the sections we expect
//        waitForText("Biopsy Details");
//        waitForText("Morphologic Diagnoses");
//        waitForText("Histology");
//        assertNoErrorText();

//        beginAt("/ehr/" + getContainerPath() + "/datasets.view");
//        waitForText("Necropsies");
//        waitAndClick(LabModuleHelper.getNavPanelItem("Necropsies:", VIEW_TEXT));
//        waitForText("details");
//        dr = new DataRegionTable("query", this);
//        dr.clickLink(0, 0);
//        //these are the sections we expect
//        waitForText("Necropsy Details");
//        waitForText("Morphologic Diagnoses");
//        waitForText("Histology");
//        assertNoErrorText();

        beginAt("/ehr/" + getContainerPath() + "/datasets.view");
        waitForText("Drug Administration");
        waitAndClick(LabModuleHelper.getNavPanelItem("Drug Administration:", VIEW_TEXT));

        waitForText("details");
        DataRegionTable dr = new DataRegionTable("query", this);
        dr.clickLink(0, 0);
        //these are the sections we expect
        waitForText("Drug Details");
        waitForText("Clinical Remarks From ");
        assertNoErrorText();

        beginAt("/ehr/" + getContainerPath() + "/datasets.view");
        waitForText("Housing");
        waitAndClick(LabModuleHelper.getNavPanelItem("Housing:", VIEW_TEXT));

        waitForText(ROOM_ID2);
        dr = new DataRegionTable("query", this);
        dr.clickLink(1, "Room");

        //these are the sections we expect
        waitForText("Cage Details");
        waitForText("Animals Currently Housed");
        waitForText("Cage Observations For This Location");
        waitForText("All Animals Ever Housed");
        assertNoErrorText();

        beginAt("/ehr/" + getContainerPath() + "/datasets.view");
        waitForText("Clinpath Runs");
        waitAndClick(LabModuleHelper.getNavPanelItem("Clinpath Runs:", VIEW_TEXT));

        waitForText("details");
        dr = new DataRegionTable("query", this);
        dr.clickLink(0, 0);
        waitForText("Labwork Summary");
        waitForText("Results", WAIT_FOR_JAVASCRIPT * 2);
        waitForText("No results found");
        assertNoErrorText();

        beginAt("/ehr/" + getContainerPath() + "/datasets.view");
        waitForText("Clinical Encounters");
        waitAndClick(LabModuleHelper.getNavPanelItem("Clinical Encounters:", VIEW_TEXT));

        waitForText("details");
        dr = new DataRegionTable("query", this);
        dr.setSort("date", SortDirection.DESC);
        waitForText("details");
        dr.clickLink(0, 0);
        waitForText("Encounter Details");
        waitForText("Weight Monitoring Needed");
        assertNoErrorText();
    }

    private void dataRegionButtonTest()
    {
        //TODO: check custom buttons

        //TODO: also check that delete, import, etc do not appear unless explicitly enabled
    }

    /**
     * This tests misc views that are not included in detailsPagesTest()
     */
    public void viewsTest()
    {
        //housing queries
        beginAt("/project/" + getContainerPath() + "/begin.view");
        waitAndClick(Locator.linkWithText("Housing Queries"));

        waitForText("View:"); //a proxy for the search panel loading


        //animal queries
        beginAt("/project/" + getContainerPath() + "/begin.view");
        waitAndClick(Locator.linkWithText("Animal Search"));

        waitForTextToDisappear("Loading");
        waitForText("View:"); //a proxy for the search panel loading
        assertNoErrorText();
        //TODO: test search plus specific queries

        //project, protocol queries
        beginAt("/project/" + getContainerPath() + "/begin.view");
        waitAndClick(Locator.linkWithText("Protocol and Project Queries"));

        waitForTextToDisappear("Loading");
        waitForText("View:"); //a proxy for the search panel loading
        assertNoErrorText();
        //TODO: test search plus specific queries

        //population overview
        beginAt("/project/" + getContainerPath() + "/begin.view");
        waitAndClick(Locator.linkWithText("Population Summary"));

        waitForText("Current Population Counts");
        waitForText("Population Changes");
        waitForText("Other Population Queries");
        //TODO: test R report plus other queries
        assertNoErrorText();

        //participant page
        beginAt("/query/" + getContainerPath() + "/executeQuery.view?schemaName=study&query.queryName=animal");
        waitForText("Animal");
        DataRegionTable dr = new DataRegionTable("query", this);
        dr.clickLink(1,"Id");
        log("Inspecting details page");
        waitForElement(Locator.xpath("//span[contains(text(), 'Animal Details:')]"));
        waitForElement(Locator.xpath("//label[contains(text(), '# Animals In Cage:')]"));
        assertNoErrorText();
    }

    private void animalHistoryTest()
    {
        String dataRegionName;
        clickProject(getProjectName());
        clickFolder(FOLDER_NAME);

        waitAndClick(Locator.linkWithText("Animal History"));

        log("Verify Single animal history");
        String query = "textfield[itemId=subjArea]";
        _helper.waitForCmp(query);
        Ext4FieldRefWD subjField = getAnimalHistorySubjField();
        subjField.setValue(PROTOCOL_MEMBER_IDS[0]);

        refreshAnimalHistoryReport();
        _helper.waitForCmp(query);
        subjField = _ext4Helper.queryOne("#subjArea", Ext4FieldRefWD.class);
        Assert.assertEquals("Incorrect value in subject ID field", PROTOCOL_MEMBER_IDS[0], subjField.getValue());

        //crawlReportTabs(); // TOO SLOW. TODO: Crawl specific tabs to test functionality

        //NOTE: rendering the entire colony is slow, so instead of abstract we load a simpler report
        log("Verify entire colony history");
        waitAndClick(Locator.ext4Radio("Entire Database"));
        _ext4Helper.clickTabContainingText("Demographics");
        waitForText("Rhesus"); //a proxy for the loading of the dataRegion
        dataRegionName = _helper.getAnimalHistoryDataRegionName("Demographics");
        Assert.assertEquals("Did not find the expected number of Animals", 44, getDataRegionRowCount(dataRegionName));

        log("Verify location based history");
        waitAndClick(Locator.ext4Radio("Current Location"));

        _ext4Helper.queryOne("#areaField", Ext4FieldRefWD.class).setValue(AREA_ID);
        sleep(200); //wait for 2nd field to filter
        _ext4Helper.queryOne("#roomField", Ext4FieldRefWD.class).setValue(ROOM_ID);
        _ext4Helper.queryOne("#cageField", Ext4FieldRefWD.class).setValue(CAGE_ID);
        _ext4Helper.clickTabContainingText("Abstract");
        waitForText("9794992", WAIT_FOR_JAVASCRIPT);   //this is the values of sire field

        log("Verify Project search");
        waitAndClick(Locator.ext4Radio("Multiple Animals"));
        waitAndClick(Locator.linkContainingText("[Search By Project/Protocol]"));
        waitForElement(Ext4Helper.ext4Window("Search By Project/Protocol"));
        _ext4Helper.selectComboBoxItem("Center Project:", PROJECT_ID, true);
        _extHelper.clickExtButton("Search By Project/Protocol", "Submit", 0);

        waitForElement(Locator.ext4Button(PROJECT_MEMBER_ID + " (X)"), WAIT_FOR_JAVASCRIPT);
        refreshAnimalHistoryReport();

        //NOTE: unsure why this causes the page to lock up
        //waitForElement(Locator.linkWithText(PROJECT_MEMBER_ID), WAIT_FOR_JAVASCRIPT * 3);
        waitForElement(Locator.xpath("//th[text() = 'Details: " + PROJECT_MEMBER_ID + "']"), WAIT_FOR_JAVASCRIPT * 2);

        log("Verify Protocol search");
        waitAndClick(Locator.ext4Radio("Multiple Animals"));
        waitAndClick(Locator.linkContainingText("[Search By Project/Protocol]"));
        waitForElement(Ext4Helper.ext4Window("Search By Project/Protocol"));
        _ext4Helper.selectComboBoxItem("IACUC Protocol:", PROTOCOL_ID, true);
        clickButton("Submit", 0);
        waitForElement(Locator.ext4Button(PROTOCOL_MEMBER_IDS[0] + " (X)"), WAIT_FOR_JAVASCRIPT);

        // Check protocol search results.
        refreshAnimalHistoryReport();
        dataRegionName = _helper.getAnimalHistoryDataRegionName("Abstract");
        Assert.assertEquals("Did not find the expected number of Animals", PROTOCOL_MEMBER_IDS.length, getDataRegionRowCount(dataRegionName));
        assertElementPresent(Locator.linkContainingText(PROTOCOL_MEMBER_IDS[0]));

        // Check animal count after removing one from search.
        waitAndClick(Locator.ext4Button(PROTOCOL_MEMBER_IDS[0] + " (X)"));
        waitForElementToDisappear(Locator.ext4Button(PROTOCOL_MEMBER_IDS[0] + " (X)"), WAIT_FOR_JAVASCRIPT);
        refreshAnimalHistoryReport();
        dataRegionName = _helper.getAnimalHistoryDataRegionName("Abstract");
        Assert.assertEquals("Did not find the expected number of Animals", PROTOCOL_MEMBER_IDS.length - 1, getDataRegionRowCount(dataRegionName));

        // Re-add animal.
        getAnimalHistorySubjField().setValue(PROTOCOL_MEMBER_IDS[0]);
        waitAndClick(Locator.ext4Button("Append -->"));
        waitForElement(Locator.button(PROTOCOL_MEMBER_IDS[0] + " (X)"), WAIT_FOR_JAVASCRIPT);
        refreshAnimalHistoryReport();
        dataRegionName = _helper.getAnimalHistoryDataRegionName("Abstract");
        waitForText(PROTOCOL_MEMBER_IDS[0]);
        Assert.assertEquals("Did not find the expected number of Animals", PROTOCOL_MEMBER_IDS.length, getDataRegionRowCount(dataRegionName));

        waitForElement(Locator.xpath("//th[contains(text(), 'Weights -')]"));
        _ext4Helper.clickExt4Tab("Raw Data");
        waitForText("Percent Change", WAIT_FOR_PAGE * 3);

        log("Check subjectField parsing");
        getAnimalHistorySubjField().setValue(MORE_ANIMAL_IDS[0] + "," + MORE_ANIMAL_IDS[1] + ";" + MORE_ANIMAL_IDS[2] + " " + MORE_ANIMAL_IDS[3] + "\t" + MORE_ANIMAL_IDS[4]);
        waitAndClick(Locator.ext4Button("Replace -->"));
        refreshAnimalHistoryReport();
        dataRegionName = _helper.getAnimalHistoryDataRegionName("Abstract");
        Assert.assertEquals("Did not find the expected number of Animals", 5, getDataRegionRowCount(dataRegionName));

        //NOTE: this cause the page to lock up.
        //waitForElementToDisappear(Locator.linkWithText(PROTOCOL_MEMBER_IDS[1]));
        //assertElementNotPresent(Locator.linkWithText(PROTOCOL_MEMBER_IDS[2]));

        waitForElementToDisappear(Locator.xpath("//td//a[contains(text(), '" + PROTOCOL_MEMBER_IDS[1] + "')]").notHidden(), WAIT_FOR_JAVASCRIPT * 3);
        assertElementNotPresent(Locator.xpath("//td//a[contains(text(), '" + PROTOCOL_MEMBER_IDS[2] + "')]").notHidden());

        waitAndClick(Locator.ext4Button("Clear"));
        refreshAnimalHistoryReport();
        waitForElement(Ext4Helper.ext4Window("Error"));
        assertElementNotPresent(Locator.buttonContainingText("(X)"));
        assertTextPresent("Must enter at least one subject");
        click(Locator.ext4Button("OK"));
    }

    private void customActionsTest()
    {
        log("Verify custom actions");
        String dataRegionName = "query";
        beginAt("/query/" + getContainerPath() + "/executeQuery.view?schemaName=study&query.queryName=weight&query.id~in=" + (PROTOCOL_MEMBER_IDS[0] + ";" + PROTOCOL_MEMBER_IDS[1] + ";" + PROTOCOL_MEMBER_IDS[2]));
        waitForElement(Locator.xpath("//span[contains(text(), 'Weight')]"));
        log("Return Distinct Values - no selections");
        _extHelper.clickExtMenuButton(false, Locator.xpath("//table[@id='dataregion_"+dataRegionName+"']" +Locator.navButton("More Actions").getPath()), "Return Distinct Values");
        _extHelper.clickExtButton("Return Distinct Values", "Submit", 0);
        _extHelper.waitForExtDialog("Error");
        waitAndClick(Locator.ext4Button("OK"));

        log("Return Distinct Values");
        checkAllOnPage(dataRegionName);
        _extHelper.clickExtMenuButton(false, Locator.xpath("//table[@id='dataregion_" + dataRegionName + "']" + Locator.navButton("More Actions").getPath()), "Return Distinct Values");
        waitForElement(Ext4Helper.ext4Window("Return Distinct Values"));
        new Ext4ComboRefWD(Ext4ComboRefWD.getForLabel(this, "Select Field"), this).setComboByDisplayValue("Animal Id");
        _extHelper.clickExtButton("Return Distinct Values", "Submit", 0);
        _extHelper.waitForExtDialog("Distinct Values");
        String expected = PROTOCOL_MEMBER_IDS[0]+"\n"+PROTOCOL_MEMBER_IDS[1]+"\n"+PROTOCOL_MEMBER_IDS[2];
        Assert.assertEquals("Incorrect value returned", expected, _ext4Helper.queryOne("#distinctValues", Ext4FieldRefWD.class).getValue());
        _extHelper.clickExtButton("Distinct Values", "Close", 0);

        log("Return Distinct Values - filtered");
        _extHelper.waitForLoadingMaskToDisappear(WAIT_FOR_JAVASCRIPT * 3);
        setFilterAndWait(dataRegionName, "Id", "Does Not Equal", PROTOCOL_MEMBER_IDS[1], 0);
        waitForText("(Id <> " + PROTOCOL_MEMBER_IDS[1], WAIT_FOR_JAVASCRIPT);
        _extHelper.clickExtMenuButton(false, Locator.xpath("//table[@id='dataregion_"+dataRegionName+"']" +Locator.navButton("More Actions").getPath()), "Return Distinct Values");
        waitForElement(Ext4Helper.ext4Window("Return Distinct Values"));
        Ext4CmpRefWD btn = _ext4Helper.queryOne("button[text='Submit']", Ext4CmpRefWD.class);
        waitAndClick(Locator.id(btn.getId()));
        waitForElement(Ext4Helper.ext4Window("Distinct Values"));
        Assert.assertEquals("Incorrect value returned", PROTOCOL_MEMBER_IDS[0]+"\n"+PROTOCOL_MEMBER_IDS[2], _ext4Helper.queryOne("#distinctValues", Ext4FieldRefWD.class).getValue());
        btn = _ext4Helper.queryOne("button[text='Close']", Ext4CmpRefWD.class);
        waitAndClick(Locator.id(btn.getId()));

        log("Return Distinct Values - show all");
        _extHelper.clickExtMenuButton(false, Locator.xpath("//table[@id='dataregion_"+dataRegionName+"']" +Locator.navButton("More Actions").getPath()), "Return Distinct Values");
        waitForElement(Ext4Helper.ext4Window("Return Distinct Values"));
        Ext4FieldRefWD.getForBoxLabel(this, "All Rows").setChecked(true);
        btn = _ext4Helper.queryOne("button[text='Submit']", Ext4CmpRefWD.class);
        waitAndClick(Locator.id(btn.getId()));
        waitForElement(Ext4Helper.ext4Window("Distinct Values"));
        String value = (String)_ext4Helper.queryOne("#distinctValues", Ext4FieldRefWD.class).getValue();
        Assert.assertEquals("Incorrect number of IDs returned", 2, value.split("\n").length);
        btn = _ext4Helper.queryOne("button[text='Close']", Ext4CmpRefWD.class);
        waitAndClick(Locator.id(btn.getId()));

        log("Compare Weights - no selection");
        uncheckAllOnPage(dataRegionName);
        _extHelper.clickExtMenuButton(false, Locator.xpath("//table[@id='dataregion_"+dataRegionName+"']" +Locator.navButton("More Actions").getPath()), "Compare Weights");
        assertAlert("No records selected");

        log("Compare Weights - one selection");
        checkDataRegionCheckbox(dataRegionName, 0);
        _extHelper.clickExtMenuButton(false, Locator.xpath("//table[@id='dataregion_"+dataRegionName+"']" +Locator.navButton("More Actions").getPath()), "Compare Weights");
        _extHelper.waitForExtDialog("Weights");
        _extHelper.clickExtButton("Weights", "OK", 0);
        assertTextNotPresent("Weight 1");

        log("Compare Weights - two selections");
        checkDataRegionCheckbox(dataRegionName, 1);
        _extHelper.clickExtMenuButton(false, Locator.xpath("//table[@id='dataregion_"+dataRegionName+"']" +Locator.navButton("More Actions").getPath()), "Compare Weights");
        _extHelper.waitForExtDialog("Weights");
        _extHelper.clickExtButton("Weights", "OK", 0);
        assertTextNotPresent("Weight 1");

        log("Compare Weights - three selections");
        checkDataRegionCheckbox(dataRegionName, 2);
        _extHelper.clickExtMenuButton(false, Locator.xpath("//table[@id='dataregion_" + dataRegionName + "']" + Locator.navButton("More Actions").getPath()), "Compare Weights");
        _extHelper.waitForExtDialog("Error"); // After error dialog.
        _extHelper.clickExtButton("Error", "OK", 0);

        //wait for load
        _extHelper.waitForExtDialog("Weights");
        _extHelper.clickExtButton("Weights", "OK", 0);
        assertTextNotPresent("Weight 1");

        log("Jump to History");
        checkDataRegionCheckbox("query", 0); // PROTOCOL_MEMBER_IDS[0]
        clickMenuButton("More Actions", "Jump To History");
        assertTitleContains("Animal History");

        //page has loaded, so we re-query
        getAnimalHistorySubjField().setValue(PROTOCOL_MEMBER_IDS[2]);
        waitAndClick(Locator.ext4Button("Append -->"));
        refreshAnimalHistoryReport();
        dataRegionName = _helper.getAnimalHistoryDataRegionName("Abstract");
        Assert.assertEquals("Did not find the expected number of Animals", 2, getDataRegionRowCount(dataRegionName));
        assertTextPresent(PROTOCOL_MEMBER_IDS[0], PROTOCOL_MEMBER_IDS[2]);
    }

    private Ext4FieldRefWD getAnimalHistorySubjField()
    {
        Ext4CmpRefWD.waitForComponent(this, "#subjArea");
        return _ext4Helper.queryOne("#subjArea", Ext4FieldRefWD.class);
    }

    private void refreshAnimalHistoryReport()
    {
        waitForText("Abstract");
        sleep(200);
        waitAndClick(Locator.ext4Button("Refresh"));
    }

    private void quickSearchTest()
    {
        log("Quick Search - Show Animal");
        clickProject(getProjectName());
        clickFolder(FOLDER_NAME);
        waitForElement(Locator.linkWithText("Advanced Animal Search"), WAIT_FOR_JAVASCRIPT);
        setFormElement(Locator.name("animal"), MORE_ANIMAL_IDS[0]);
        clickButton("Show Animal");
        assertTitleContains("Animal Details: "+MORE_ANIMAL_IDS[0]);

        log("Quick Search - Show Project");
        clickProject(getProjectName());
        clickFolder(FOLDER_NAME);
        waitForElement(Locator.linkWithText("Advanced Animal Search"), WAIT_FOR_JAVASCRIPT);
        _ext4Helper.queryOne("#projectField", Ext4ComboRefWD.class).setComboByDisplayValue(PROJECT_ID);
        clickButton("Show Project");
        waitForElement(Locator.linkWithText(DUMMY_PROTOCOL), WAIT_FOR_JAVASCRIPT);

        log("Quick Search - Show Protocol");
        clickProject(getProjectName());
        clickFolder(FOLDER_NAME);
        waitForElement(Locator.linkWithText("Advanced Animal Search"), WAIT_FOR_JAVASCRIPT);
        _ext4Helper.queryOne("#protocolField", Ext4ComboRefWD.class).setComboByDisplayValue(PROTOCOL_ID);
        clickButton("Show Protocol");
        waitForElement(Locator.linkWithText(PROTOCOL_ID), WAIT_FOR_JAVASCRIPT);

        log("Quick Search - Show Room");
        clickProject(getProjectName());
        clickFolder(FOLDER_NAME);
        waitForElement(Locator.linkWithText("Advanced Animal Search"), WAIT_FOR_JAVASCRIPT);
        _ext4Helper.queryOne("#roomField", Ext4FieldRefWD.class).setValue(ROOM_ID);
        clickButton("Show Room");
        waitForElement(Locator.linkWithText(PROJECT_MEMBER_ID), WAIT_FOR_JAVASCRIPT);
    }

    private void crawlReportTabs()
    {
        String tabs[] = {/*"-Assay", "MHC SSP Typing", "Viral Loads", */ //Bad queries on test server.
                         "-Assignments", "Active Assignments", "Assignment History",
                         "-Clin Path", "Bacteriology", "Chemistry:By Panel", "Clinpath Runs", "Hematology:By Panel", "Immunology:By Panel", "Parasitology", "Urinalysis:By Panel", "Viral Challenges", "Virology",
                         "-Clinical", "Abstract:Active Assignments", "Clinical Encounters", "Clinical Remarks", "Diarrhea Calendar", "Full History", "Full History Plus Obs", "Irregular Obs:Irregular Observations", "Problem List", "Procedure Codes", "Surgical History", "Tasks", "Treatment Orders", "Treatments", "Treatment Schedule", "Weights:Weight",
                         "-Colony Management", "Behavior Remarks", "Birth Records", "Housing - Active", "Housing History", "Inbreeding Coefficients", "Kinship", "Menses Calendar", "Menses Observations:Irregular Observations", "Pedigree:Offspring", /*"Pedigree Plot",*/ "Pregnancies", "TB Tests",
                         "-Pathology", "Biopsies", "Histology", "Morphologic Diagnosis", "Necropsies",
                         "-Physical Exam", "Alopecia", "Body Condition", "Dental Status", "Exams", "PE Findings", "Teeth", "Vitals",
                         "-Today At Center", "Irregular Observations", "Obs/Treatment:Obs/Treatments", "Problem List", /*"Today's History",*/ "Treatments - Morning", "Treatments - Afternoon", "Treatments - Evening", "Treatments - Master", "Unresolved Problem List", /*"Today's Blood Draws",*/
                         "-General", "Arrival/Departure:Arrivals", "Blood Draw History", "Charges", "Current Blood", "Deaths", "Demographics", "Major Events", "Notes", "Abstract:Active Assignments"};

        log("Check all Animal History report tabs");
        for (String tab : tabs)
        {
            if(tab.startsWith("-")) // High level tab
            {
                _extHelper.clickExtTab(tab.substring(1));
            }
            else
            {
                if(tab.contains(":"))
                {
                    _extHelper.clickExtTab(tab.split(":")[0]);
                    _helper.getAnimalHistoryDataRegionName(tab.split(":")[1]);
                }
                else
                {
                    _extHelper.clickExtTab(tab);
                    _helper.getAnimalHistoryDataRegionName(tab);
                }
            }
        }

        //Clear out lingering text on report pages
        clickProject(getProjectName());
        clickFolder(FOLDER_NAME);
        waitAndClickAndWait(Locator.linkWithText("Animal History"));
    }
}
