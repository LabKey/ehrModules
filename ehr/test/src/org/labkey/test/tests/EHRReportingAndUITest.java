/*
 * Copyright (c) 2011-2014 LabKey Corporation
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

import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.Locator;
import org.labkey.test.SortDirection;
import org.labkey.test.TestTimeoutException;
import org.labkey.test.categories.EHR;
import org.labkey.test.categories.External;
import org.labkey.test.categories.ONPRC;
import org.labkey.test.util.DataRegionTable;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.Ext4HelperWD;
import org.labkey.test.util.LabModuleHelper;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.ext4cmp.Ext4CmpRefWD;
import org.labkey.test.util.ext4cmp.Ext4ComboRefWD;
import org.labkey.test.util.ext4cmp.Ext4FieldRefWD;

import static org.junit.Assert.*;

@Category({External.class, EHR.class, ONPRC.class})
public class EHRReportingAndUITest extends AbstractEHRTest
{
    @BeforeClass
    @LogMethod
    public static void doSetup() throws Exception
    {
        EHRReportingAndUITest initTest = new EHRReportingAndUITest();
        initTest.doCleanup(false);
        initTest.initProject();
        currentTest = initTest;
    }

    //TODO: also check that delete, import, etc do not appear unless explicitly enabled

    /**
     * This test will hit a variety of EHR views and provides a very basic test of the UI on that page.  Initially it will
     * just look for JS errors and certain keywords, like 'error' or 'failed'.
     */
    @Test
    public void detailsPagesTest()
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

        waitForText("details", WAIT_FOR_PAGE * 2);
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

    /**
     * This tests misc custom pages that are not included in detailsPagesTest()
     */
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
        waitForElement(Locator.linkContainingText("View All Projects With Active Assignments"));
        assertNoErrorText();

        //population overview
        beginAt("/project/" + getContainerPath() + "/begin.view");
        waitAndClick(Locator.linkWithText("Population Summary"));

        waitForText("Current Population Counts");
        waitForText("Population Changes");
        waitForText("Other Population Queries");

        assertNoErrorText();

        //participant page
        beginAt("/query/" + getContainerPath() + "/executeQuery.view?schemaName=study&query.queryName=animal");
        waitForText("Animal");
        DataRegionTable dr = new DataRegionTable("query", this);
        dr.clickLink(1,"Id");
        log("Inspecting details page");
        waitForElement(Locator.tagContainingText("th", "Overview: "));
        waitForElement(Locator.tagContainingText("th", "Weights - "));
        assertNoErrorText();
    }

    @Test
    public void animalHistoryTest()
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
        waitForElement(Locator.tagContainingText("th", "Overview: " + PROTOCOL_MEMBER_IDS[0]));
        waitForElement(Locator.tagContainingText("div", "There are no active medications"));
        waitForElement(Locator.tagContainingText("div", "5.62 kg")); //loading of the weight section
        _helper.waitForCmp(query);
        subjField = _ext4Helper.queryOne("#subjArea", Ext4FieldRefWD.class);
        assertEquals("Incorrect value in subject ID field", PROTOCOL_MEMBER_IDS[0], subjField.getValue());

        //NOTE: rendering the entire colony is slow, so instead of abstract we load a simpler report
        log("Verify entire colony history");
        waitAndClick(Locator.ext4Radio("Entire Database"));
        waitAndClick(Ext4HelperWD.ext4Tab("Demographics"));
        waitForElement(Locator.tagContainingText("a", "Rhesus")); //a proxy for the loading of the dataRegion
        waitForElement(Locator.tagContainingText("a", "test9195996"));  //the last ID on the page.  possibly a better proxy?
        sleep(2000); //allow page to resize
        dataRegionName = _helper.getAnimalHistoryDataRegionName("Demographics");
        assertEquals("Did not find the expected number of Animals", 44, getDataRegionRowCount(dataRegionName));

        log("Verify location based history");
        waitAndClick(Locator.ext4Radio("Current Location"));

        _helper.waitForCmp("#areaField");
        _ext4Helper.queryOne("#areaField", Ext4FieldRefWD.class).setValue(AREA_ID);
        sleep(200); //wait for 2nd field to filter
        _ext4Helper.queryOne("#roomField", Ext4FieldRefWD.class).setValue(ROOM_ID);
        _ext4Helper.queryOne("#cageField", Ext4FieldRefWD.class).setValue(CAGE_ID);
        refreshAnimalHistoryReport();
        waitForElement(Locator.tagContainingText("a", "9794992"), WAIT_FOR_JAVASCRIPT);   //this is the value of sire field

        log("Verify Project search");
        waitAndClick(Locator.ext4Radio("Multiple Animals"));
        waitAndClick(Locator.linkContainingText("[Search By Project/Protocol]"));
        waitForElement(Ext4Helper.ext4Window("Search By Project/Protocol"));
        Ext4FieldRefWD.waitForComponent(this, "Center Project");
        Ext4ComboRefWD.getForLabel(this, "Center Project").setComboByDisplayValue(PROJECT_ID);
        _helper.clickExt4WindowBtn("Search By Project/Protocol", "Submit");

        waitForElement(Locator.ext4Button(PROJECT_MEMBER_ID + " (X)"), WAIT_FOR_JAVASCRIPT);
        refreshAnimalHistoryReport();
        waitForElement(Locator.tagContainingText("span", "Demographics - " + PROJECT_MEMBER_ID), WAIT_FOR_JAVASCRIPT * 2);

        log("Verify Protocol search");
        waitAndClick(Locator.ext4Radio("Multiple Animals"));
        waitAndClick(Locator.linkContainingText("[Search By Project/Protocol]"));
        waitForElement(Ext4Helper.ext4Window("Search By Project/Protocol"));
        Ext4FieldRefWD.waitForComponent(this, "IACUC Protocol");
        Ext4ComboRefWD.getForLabel(this, "IACUC Protocol").setComboByDisplayValue(PROTOCOL_ID);
        waitAndClick(Locator.ext4Button("Submit"));
        waitForElement(Locator.ext4Button(PROTOCOL_MEMBER_IDS[0] + " (X)"), WAIT_FOR_JAVASCRIPT);

        // Check protocol search results.
        refreshAnimalHistoryReport();
        dataRegionName = _helper.getAnimalHistoryDataRegionName("Demographics");
        assertEquals("Did not find the expected number of Animals", PROTOCOL_MEMBER_IDS.length, getDataRegionRowCount(dataRegionName));
        assertElementPresent(Locator.linkContainingText(PROTOCOL_MEMBER_IDS[0]));

        // Check animal count after removing one from search.
        waitAndClick(Locator.ext4Button(PROTOCOL_MEMBER_IDS[0] + " (X)"));
        waitForElementToDisappear(Locator.ext4Button(PROTOCOL_MEMBER_IDS[0] + " (X)"), WAIT_FOR_JAVASCRIPT);
        refreshAnimalHistoryReport();
        dataRegionName = _helper.getAnimalHistoryDataRegionName("Demographics");
        assertEquals("Did not find the expected number of Animals", PROTOCOL_MEMBER_IDS.length - 1, getDataRegionRowCount(dataRegionName));

        // Re-add animal.
        getAnimalHistorySubjField().setValue(PROTOCOL_MEMBER_IDS[0]);
        waitAndClick(Locator.ext4Button("Append -->"));
        waitForElement(Locator.ext4Button(PROTOCOL_MEMBER_IDS[0] + " (X)"), WAIT_FOR_JAVASCRIPT);
        refreshAnimalHistoryReport();
        dataRegionName = _helper.getAnimalHistoryDataRegionName("Demographics");
        waitForText(PROTOCOL_MEMBER_IDS[0]);
        assertEquals("Did not find the expected number of Animals", PROTOCOL_MEMBER_IDS.length, getDataRegionRowCount(dataRegionName));

        log("Check subjectField parsing");
        getAnimalHistorySubjField().setValue(MORE_ANIMAL_IDS[0] + "," + MORE_ANIMAL_IDS[1] + ";" + MORE_ANIMAL_IDS[2] + " " + MORE_ANIMAL_IDS[3] + "\t" + MORE_ANIMAL_IDS[4]);
        waitAndClick(Locator.ext4Button("Replace -->"));
        refreshAnimalHistoryReport();
        dataRegionName = _helper.getAnimalHistoryDataRegionName("Demographics");
        assertEquals("Did not find the expected number of Animals", 5, getDataRegionRowCount(dataRegionName));

        waitForElementToDisappear(Locator.xpath("//td//a[contains(text(), '" + PROTOCOL_MEMBER_IDS[1] + "')]").notHidden(), WAIT_FOR_JAVASCRIPT * 3);
        assertElementNotPresent(Locator.xpath("//td//a[contains(text(), '" + PROTOCOL_MEMBER_IDS[2] + "')]").notHidden());

        waitAndClick(Locator.ext4Button("Clear"));
        refreshAnimalHistoryReport();
        waitForElement(Ext4Helper.ext4Window("Error"));
        assertElementNotPresent(Locator.ext4ButtonContainingText("(X)"));
        assertTextPresent("Must enter at least one subject");
        waitAndClick(Locator.ext4Button("OK"));

        log("checking specific tabs");

        //snapshot
        getAnimalHistorySubjField().setValue(MORE_ANIMAL_IDS[0] + "," + MORE_ANIMAL_IDS[1]);
        waitAndClick(Locator.ext4Button("Replace -->"));
        refreshAnimalHistoryReport();
        waitAndClick(Ext4HelperWD.ext4Tab("General"));
        waitAndClick(Ext4HelperWD.ext4Tab("Snapshot"));
        waitForElement(Locator.tagContainingText("span", "Dead"), WAIT_FOR_JAVASCRIPT * 2);
        waitForElement(Locator.tagContainingText("div", "1 year, 308 days"));
        waitForElement(Locator.tagContainingText("th", "Weights - " + MORE_ANIMAL_IDS[0]));

        //weight
        waitAndClick(Ext4HelperWD.ext4Tab("Clinical"));
        waitAndClick(Ext4HelperWD.ext4Tab("Weights"));
        waitForElement(Locator.xpath("//th[contains(text(), 'Weights -')]"));
        waitForElement(Locator.tagWithText("div", "3.73 kg")); //first animal
        waitForElement(Locator.tagWithText("div", "3.56 kg")); //second animal
        waitForElements(Locator.css("svg tspan"), 30);  //kinda ugly proxy for graphs loading
        waitForElements(Ext4HelperWD.ext4Tab("Raw Data"), 2);
        waitAndClick(Ext4HelperWD.ext4Tab("Raw Data"));
        waitForElement(Locator.tagWithText("span", "Percent Change"), WAIT_FOR_PAGE * 3);

        //chronological history
        waitAndClick(Ext4HelperWD.ext4Tab("Clinical"));
        waitAndClick(Ext4HelperWD.ext4Tab("Clinical History"));
        waitForElement(Locator.tagContainingText("div", "No records found since:"));
    }

    @Test
    public void dataRegionButtonsTest()
    {
        log("Verify custom dataregion buttons");
        String dataRegionName = "query";
        beginAt("/query/" + getContainerPath() + "/executeQuery.view?schemaName=study&query.queryName=weight&query.id~in=" + (PROTOCOL_MEMBER_IDS[0] + ";" + PROTOCOL_MEMBER_IDS[1] + ";" + PROTOCOL_MEMBER_IDS[2]));
        waitForElement(Locator.xpath("//span[contains(text(), 'Weight')]"));
        log("Return Distinct Values - no selections");
        _extHelper.clickExtMenuButton(false, Locator.xpath("//table[@id='dataregion_"+dataRegionName+"']" +Locator.navButton("More Actions").getPath()), "Return Distinct Values");
        _helper.clickExt4WindowBtn("Return Distinct Values", "Submit");
        waitForElement(Ext4HelperWD.ext4Window("Error"));
        waitAndClick(Locator.ext4Button("OK"));

        log("Return Distinct Values");
        checkAllOnPage(dataRegionName);
        _extHelper.clickExtMenuButton(false, Locator.xpath("//table[@id='dataregion_" + dataRegionName + "']" + Locator.navButton("More Actions").getPath()), "Return Distinct Values");
        waitForElement(Ext4HelperWD.ext4Window("Return Distinct Values"));
        waitForElement(Locator.ext4Button("Submit"), WAIT_FOR_JAVASCRIPT * 3);
        new Ext4ComboRefWD(Ext4ComboRefWD.getForLabel(this, "Select Field"), this).setComboByDisplayValue("Animal Id");
        _helper.clickExt4WindowBtn("Return Distinct Values", "Submit");
        waitForElement(Ext4HelperWD.ext4Window("Distinct Values"));
        String expected = PROTOCOL_MEMBER_IDS[0]+"\n"+PROTOCOL_MEMBER_IDS[1]+"\n"+PROTOCOL_MEMBER_IDS[2];
        assertEquals("Incorrect value returned", expected, _ext4Helper.queryOne("#distinctValues", Ext4FieldRefWD.class).getValue());
        _helper.clickExt4WindowBtn("Distinct Values", "Close");

        log("Return Distinct Values - filtered");
        _extHelper.waitForLoadingMaskToDisappear(WAIT_FOR_JAVASCRIPT * 3);
        setFilterAndWait(dataRegionName, "Id", "Does Not Equal", PROTOCOL_MEMBER_IDS[1], 0);
        waitForText("(Id <> " + PROTOCOL_MEMBER_IDS[1], WAIT_FOR_JAVASCRIPT);
        _extHelper.clickExtMenuButton(false, Locator.xpath("//table[@id='dataregion_"+dataRegionName+"']" +Locator.navButton("More Actions").getPath()), "Return Distinct Values");
        waitForElement(Ext4Helper.ext4Window("Return Distinct Values"));
        waitForElement(Locator.ext4Button("Submit"));
        Ext4CmpRefWD btn = _ext4Helper.queryOne("button[text='Submit']", Ext4CmpRefWD.class);
        waitAndClick(Locator.id(btn.getId()));
        waitForElement(Ext4Helper.ext4Window("Distinct Values"));
        assertEquals("Incorrect value returned", PROTOCOL_MEMBER_IDS[0]+"\n"+PROTOCOL_MEMBER_IDS[2], _ext4Helper.queryOne("#distinctValues", Ext4FieldRefWD.class).getValue());
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
        assertEquals("Incorrect number of IDs returned", 2, value.split("\n").length);
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
        _helper.clickExt4WindowBtn("Weights", "OK");
        assertTextNotPresent("Weight 1");

        log("Compare Weights - two selections");
        checkDataRegionCheckbox(dataRegionName, 1);
        _extHelper.clickExtMenuButton(false, Locator.xpath("//table[@id='dataregion_"+dataRegionName+"']" +Locator.navButton("More Actions").getPath()), "Compare Weights");
        _extHelper.waitForExtDialog("Weights");
        _helper.clickExt4WindowBtn("Weights", "OK");
        assertTextNotPresent("Weight 1");

        log("Compare Weights - three selections");
        checkDataRegionCheckbox(dataRegionName, 2);
        _extHelper.clickExtMenuButton(false, Locator.xpath("//table[@id='dataregion_" + dataRegionName + "']" + Locator.navButton("More Actions").getPath()), "Compare Weights");
        waitForElement(Ext4HelperWD.ext4Window("Error")); // After error dialog.
        _helper.clickExt4WindowBtn("Error", "OK");

        //wait for load
        waitForElement(Ext4HelperWD.ext4Window("Weights"));
        _helper.clickExt4WindowBtn("Weights", "OK");
        assertTextNotPresent("Weight 1");

        log("Jump to History");
        checkDataRegionCheckbox("query", 0); // PROTOCOL_MEMBER_IDS[0]
        _extHelper.clickMenuButton("More Actions", "Jump To History");
        assertTitleContains("Animal History");
        waitForElement(Locator.tagContainingText("th", "Overview: "));

        //page has loaded, so we re-query
        getAnimalHistorySubjField().setValue(PROTOCOL_MEMBER_IDS[2]);
        waitAndClick(Locator.ext4Button("Append -->"));
        refreshAnimalHistoryReport();
        waitForElement(Ext4HelperWD.ext4Tab("Demographics"));
        waitForElement(Locator.ext4Button(PROTOCOL_MEMBER_IDS[2] + " (X)"));
        waitAndClick(Ext4HelperWD.ext4Tab("Demographics"));
        dataRegionName = _helper.getAnimalHistoryDataRegionName("Demographics");
        assertEquals("Did not find the expected number of Animals", 2, getDataRegionRowCount(dataRegionName));
        assertTextPresent(PROTOCOL_MEMBER_IDS[0], PROTOCOL_MEMBER_IDS[2]);
    }

    private void refreshAnimalHistoryReport()
    {
        waitForElement(Ext4HelperWD.ext4Tab("Demographics"));
        sleep(200);
        waitAndClick(Locator.ext4Button("Refresh"));
    }

    @Test
    public void quickSearchTest()
    {
        //TODO: can I interact with this as a menu webpart?
        log("Add quick search webpart");
        goToEHRFolder();
        addWebPart("Quick Search");

        log("Quick Search - Show Animal");
        clickProject(getProjectName());
        clickFolder(FOLDER_NAME);
        waitForElement(Locator.linkWithText("Advanced Animal Search"), WAIT_FOR_JAVASCRIPT);
        setFormElement(Locator.name("animal"), MORE_ANIMAL_IDS[0]);
        waitAndClickAndWait(Locator.ext4Button("Show Animal"));
        assertTitleContains("Animal Details: "+MORE_ANIMAL_IDS[0]);

        log("Quick Search - Show Project");
        clickProject(getProjectName());
        clickFolder(FOLDER_NAME);
        waitForElement(Locator.linkWithText("Advanced Animal Search"), WAIT_FOR_JAVASCRIPT);
        _ext4Helper.queryOne("#projectField", Ext4ComboRefWD.class).setComboByDisplayValue(PROJECT_ID);
        waitAndClickAndWait(Locator.ext4Button("Show Project"));
        waitForElement(Locator.linkWithText(DUMMY_PROTOCOL), WAIT_FOR_JAVASCRIPT);

        log("Quick Search - Show Protocol");
        clickProject(getProjectName());
        clickFolder(FOLDER_NAME);
        waitForElement(Locator.linkWithText("Advanced Animal Search"), WAIT_FOR_JAVASCRIPT);
        _ext4Helper.queryOne("#protocolField", Ext4ComboRefWD.class).setComboByDisplayValue(PROTOCOL_ID);
        waitAndClickAndWait(Locator.ext4Button("Show Protocol"));
        waitForElement(Locator.linkWithText(PROTOCOL_ID), WAIT_FOR_JAVASCRIPT);

        log("Quick Search - Show Room");
        clickProject(getProjectName());
        clickFolder(FOLDER_NAME);
        waitForElement(Locator.linkWithText("Advanced Animal Search"), WAIT_FOR_JAVASCRIPT);
        _ext4Helper.queryOne("#roomField", Ext4FieldRefWD.class).setValue(ROOM_ID);
        waitAndClickAndWait(Locator.ext4Button("Show Room"));
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
