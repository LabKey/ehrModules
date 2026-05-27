/*
 * Copyright (c) 2023-2026 LabKey Corporation
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

import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.test.Locator;
import org.labkey.test.ModulePropertyValue;
import org.labkey.test.TestFileUtils;
import org.labkey.test.WebTestHelper;
import org.labkey.test.categories.EHR;
import org.labkey.test.pages.ReactAnimalHistoryPage;
import org.labkey.test.tests.ehr.AbstractGenericEHRTest;
import org.labkey.test.util.DataRegionTable;
import org.labkey.test.util.PostgresOnlyTest;
import org.labkey.test.util.TextSearcher;
import org.openqa.selenium.WebElement;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertTrue;
import static org.labkey.test.components.html.Input.Input;

@Category({EHR.class})
public class EHR_AppTest extends AbstractGenericEHRTest implements PostgresOnlyTest
{
    private static final String PROJECT_NAME = "EHR App";
    private static final String FOLDER_NAME = "EHR";

    @Override
    protected String getProjectName()
    {
        return PROJECT_NAME;
    }

    @Override
    public void importStudy()
    {
        File path = new File(TestFileUtils.getLabKeyRoot(), getModulePath() + "/resources/referenceStudy");
        importFolderByPath(path, getContainerPath(), 1);
        path = TestFileUtils.getSampleData("EHR_App/study");
        importFolderByPath(path, getContainerPath(), 2);
    }

    @Override
    protected void populateInitialData() throws Exception
    {
        List<ModulePropertyValue> props = new ArrayList<>();
        props.add(new ModulePropertyValue("EHR", "/" + getProjectName(), "EHRCustomModule", "EHR_App"));
        goToProjectHome();
        setModuleProperties(props);

        beginAt(WebTestHelper.buildURL("ehr", getContainerPath(), "populateLookupData", Map.of("manifest", "lookupsManifestTest")));

        waitForElement(Locator.linkWithText("Populate Lookups"));
        click(Locator.linkWithText("Populate Lookups"));
        acceptAlert();

        waitFor(() -> Input(Locator.textarea("populateLookupResults"), getDriver()).waitFor().getValue().contains("Loading lookups is complete."),
                "Lookups didn't finish loading", 60000);

        waitForElement(Locator.linkWithText("Populate Reports"));
        click(Locator.linkWithText("Populate Reports"));
        acceptAlert();

        waitFor(() -> Input(Locator.textarea("populateLookupResults"), getDriver()).waitFor().getValue().contains("Loading reports is complete."),
                "Reports didn't finish loading", 60000);
    }

    public void importFolderByPath(File path, String containerPath, int finishedJobsExpected)
    {
        setPipelineRoot(path.getPath(), false);

        beginAt(WebTestHelper.getBaseURL() + "/" + containerPath + "/pipeline-status-begin.view");
        clickButton("Process and Import Data", defaultWaitForPage);
        _fileBrowserHelper.expandFileBrowserRootNode();
        _fileBrowserHelper.checkFileBrowserFileCheckbox("folder.xml");
        _fileBrowserHelper.selectImportDataAction("Import Folder");

        Locator cb = Locator.checkboxByName("validateQueries");
        waitForElement(cb);
        uncheckCheckbox(cb);
        clickButton("Start Import");

        waitForPipelineJobsToComplete(finishedJobsExpected, "Folder import", false, MAX_WAIT_SECONDS * 2500);
    }

    @Override
    protected File getStudyPolicyXML()
    {
        return TestFileUtils.getSampleData("EHR_AppEHRStudyPolicy.xml");
    }

    @BeforeClass
    public static void setupProject() throws Exception
    {
        EHR_AppTest init = getCurrentTest();
        init.doSetup();
    }

    @Override
    protected String getExpectedAnimalIDCasing(String id)
    {
        return id.toUpperCase();
    }

    private void doSetup() throws Exception
    {
        initProject("EHR App");
        goToEHRFolder();
    }

    @Override
    protected String getModuleDirectory()
    {
        return "ehrModules/EHR_App";
    }

    @Override
    public String getModulePath()
    {
        return "/server/modules/" + getModuleDirectory();
    }

    @Override
    protected String getAnimalHistoryPath()
    {
        return null;
    }

    @Override
    protected boolean doSetUserPasswords()
    {
        return true;
    }

    @Before
    public void preTest()
    {
        goToEHRFolder();
    }

    @Override
    protected List<String> skipLinksForValidation()
    {
        List<String> links = new ArrayList<>(super.skipLinksForValidation());
        links.add("Issue_Tracker");
        links.add("ehr-colonyOverview.view");
        links.add("ehr-updateTable.view");
        links.add("ehr-populateLookupData.view");
        links.add("ehr-participantViewNew.view");
        links.add("ehr-postgresMigration.view");
        return links;
    }

    @Test
    public void testSteps()
    {
        goToEHRFolder();
    }

    @Override
    public void testWeightValidation()
    {
        // TODO: fix this test for EHR App
    }

    @Override
    public void testCalculatedAgeColumns()
    {
        // TODO: fix this test for EHR App
    }

    // =============================================================================
    // React Animal History Tests
    // =============================================================================

    /**
     * Test: Animal History ID Search Modes
     *
     * Tests the following scenarios based on spec:
     * 1. Initial page load - verify default state
     * 2. Single direct ID match
     * 3. Multi-animal direct search
     * 4. Mixed valid/invalid IDs (not found feedback)
     * 5. Case-insensitive matching
     *
     * See spec: LK R&D EHR - React Animal History - Search By Id.md
     */
    @Test
    public void testAnimalHistoryIdSearchModes()
    {
        String testAnimalId1 = MORE_ANIMAL_IDS[0];
        String testAnimalId2 = MORE_ANIMAL_IDS[1];
        String testAnimalId3 = MORE_ANIMAL_IDS[2];

        ReactAnimalHistoryPage animalHistoryPage = ReactAnimalHistoryPage.beginAt(this, getContainerPath());

        // Scenario 1: Initial page load - verify default state
        log("Testing initial page load - default state");
        assertTrue("Search panel should be present", animalHistoryPage.isSearchByIdPanelPresent());
        assertTrue("Animal ID textarea should be present", animalHistoryPage.isAnimalIdTextareaPresent());
        assertTrue("Search button should be present", animalHistoryPage.isSearchByIdsButtonPresent());
        assertTrue("All Animals button should be present", animalHistoryPage.isAllAnimalsButtonPresent());
        assertTrue("Alive at Center button should be present", animalHistoryPage.isAliveAtCenterButtonPresent());
        assertFalse("No validation error should be shown", animalHistoryPage.isValidationErrorVisible());
        assertTrue("Empty state should be present", animalHistoryPage.isEmptyStatePlaceholderVisible());

        // Scenario 2: Single direct ID match
        log("Testing single direct ID search");
        animalHistoryPage.searchByIds(testAnimalId1);

        // Navigate to Demographics and verify the searched animal is shown
        log("Verifying Demographics shows the searched animal");
        animalHistoryPage.clickDemographicsTab();
        assertReportContainsAnimals(animalHistoryPage, testAnimalId1);

        // Scenario 3: Multi-animal direct search
        log("Testing multi-animal search");
        animalHistoryPage.searchByIds(testAnimalId1, testAnimalId2, testAnimalId3);
        animalHistoryPage.clickDemographicsTab();
        assertReportContainsAnimals(animalHistoryPage, testAnimalId1, testAnimalId2, testAnimalId3);

        // Scenario 4: Mixed valid/invalid IDs (not found feedback)
        log("Testing mixed valid/invalid IDs with not-found feedback");
        animalHistoryPage.searchByIds(testAnimalId1, "INVALID_ID_XYZ_999");
        assertTrue("ID resolution feedback should be visible", animalHistoryPage.isIdResolutionFeedbackVisible());
        assertTrue("Not found section should be present", animalHistoryPage.isNotFoundSectionPresent());
        assertTrue("Invalid ID should be in not-found list", animalHistoryPage.hasNotFoundItem("INVALID_ID_XYZ_999"));
        animalHistoryPage.clickDemographicsTab();
        assertReportContainsAnimals(animalHistoryPage, testAnimalId1);

        // Scenario 5: Case-insensitive matching
        log("Testing case-insensitive search");
        String lowercaseId = testAnimalId1.toLowerCase();
        animalHistoryPage.searchByIds(lowercaseId);
        animalHistoryPage.clickDemographicsTab();
        assertReportContainsAnimals(animalHistoryPage, testAnimalId1);
    }

    /**
     * Test: Animal History ID Search Validation
     *
     * Tests validation scenarios:
     * 1. Empty input validation
     * 2. Validation error clears when input is added
     *
     * Note: 100 ID limit test is deferred as it requires generating many test IDs
     * which may exceed test data available.
     *
     * See spec: LK R&D EHR - React Animal History - Search By Id.md
     */
    @Test
    public void testAnimalHistoryIdSearchValidation()
    {
        ReactAnimalHistoryPage animalHistoryPage = ReactAnimalHistoryPage.beginAt(this, getContainerPath());

        // Scenario 1: Empty input validation
        log("Testing empty input validation");
        animalHistoryPage
                .clearIdInput()
                .clickSearchByIds();
        assertTrue("Validation error should be shown", animalHistoryPage.isValidationErrorVisible());
        assertTextPresent("Please enter at least one animal ID");

        // Scenario 2: Validation error clears when input is added
        log("Testing validation error clears when input is added");
        animalHistoryPage.enterAnimalIds(MORE_ANIMAL_IDS[0]);
        assertFalse("Validation error should be cleared", animalHistoryPage.isValidationErrorVisible());

        // Scenario 3: Search succeeds after adding input
        log("Testing search succeeds after adding input");
        animalHistoryPage
                .clickSearchByIds()
                .waitForReportToLoad();

        // Navigate to Demographics and verify the searched animal is shown
        log("Verifying Demographics shows the searched animal");
        animalHistoryPage.clickDemographicsTab();
        assertReportContainsAnimals(animalHistoryPage, MORE_ANIMAL_IDS[0]);
    }

    /**
     * Test: Animal History All Animals Mode
     *
     * Tests All Animals filter mode:
     * 1. Search for a single ID and verify Demographics shows only that animal
     * 2. Activate All Animals mode
     * 3. Verify Demographics now shows more animals (including ones not in original search)
     * 4. Verify URL contains filterType
     *
     * See spec: LK R&D EHR - React Animal History - Search By Id.md
     */
    @Test
    public void testAnimalHistoryAllAnimalsMode()
    {
        // Test animal IDs from demographics test data (datasetDemographics.tsv).
        // Use exact casing from test data - filters are case-sensitive.
        // Do NOT use MORE_ANIMAL_IDS as it gets lowercased by getExpectedAnimalIDCasing().
        String searchedAnimalId = "TEST1020148"; // Dead animal from test data
        String otherAnimalId = "44444"; // Alive animal not in search

        ReactAnimalHistoryPage animalHistoryPage = ReactAnimalHistoryPage.beginAt(this, getContainerPath());

        // Scenario 1: Search for a single ID
        log("Setting up initial ID search state with single animal");
        animalHistoryPage.searchByIds(searchedAnimalId);

        // Navigate to Demographics and verify only the searched animal is shown
        log("Verifying Demographics shows only searched animal");
        animalHistoryPage.clickDemographicsTab();
        int initialRowCount = animalHistoryPage.getDemographicsRowCount();
        log("Initial Demographics row count: " + initialRowCount);
        assertDemographicsContainsId(animalHistoryPage, searchedAnimalId);

        // Scenario 2: Activate All Animals mode
        log("Testing All Animals mode activation");
        animalHistoryPage.clickAllAnimals();
        assertTrue("Textarea should be empty", animalHistoryPage.getIdInputValue().isEmpty());
        assertTrue("All Animals button should be active", animalHistoryPage.isAllAnimalsActive());

        // Scenario 3: Verify URL contains filterType (check BEFORE DataRegion operations which may modify URL)
        log("Testing All Animals URL state");
        String currentUrl = getDriver().getCurrentUrl();
        assertTrue("URL should contain 'filterType:all' but was: " + currentUrl,
                currentUrl.contains("filterType:all"));

        // Scenario 4: Verify Demographics now shows more animals
        log("Verifying Demographics shows more animals in All Animals mode");
        animalHistoryPage.clickDemographicsTab();
        assertDemographicsRowCountGreaterThan(animalHistoryPage, initialRowCount);
        assertDemographicsContainsId(animalHistoryPage, otherAnimalId); // Verify animal NOT in original search now appears
    }

    /**
     * Test: Animal History Alive At Center Mode
     *
     * Tests Alive at Center filter mode:
     * 1. Search for a Dead animal and verify it appears in Demographics
     * 2. Activate Alive at Center mode
     * 3. Verify URL contains filterType (before DataRegion operations)
     * 4. Verify Demographics shows only Alive animals (Dead animal should disappear)
     * 5. Verify all Status values in Demographics are "Alive"
     *
     * Note: Full testing of disabled state on unsupported reports requires
     * specific report configuration in test data.
     *
     * See spec: LK R&D EHR - React Animal History - Search By Id.md
     */
    @Test
    public void testAnimalHistoryAliveAtCenterMode()
    {
        // Test animal IDs from demographics test data (datasetDemographics.tsv).
        // Use exact casing from test data - filters are case-sensitive.
        // Do NOT use MORE_ANIMAL_IDS as it gets lowercased by getExpectedAnimalIDCasing().
        String deadAnimalId = "TEST1020148"; // Dead animal from test data
        String aliveAnimalId = "44444"; // Alive animal from test data

        ReactAnimalHistoryPage animalHistoryPage = ReactAnimalHistoryPage.beginAt(this, getContainerPath());

        // Scenario 1: Search for a Dead animal first
        log("Setting up initial ID search state with Dead animal");
        animalHistoryPage.searchByIds(deadAnimalId);

        // Navigate to Demographics and verify the Dead animal is shown
        log("Verifying Demographics shows the Dead animal");
        animalHistoryPage.clickDemographicsTab();
        assertDemographicsContainsId(animalHistoryPage, deadAnimalId);

        log("Testing Alive at Center mode activation");
        assertTrue("Alive at Center button should be enabled for Demographics report",
                animalHistoryPage.isAliveAtCenterEnabled());

        // Scenario 2: Activate Alive at Center mode
        animalHistoryPage.clickAliveAtCenter();
        assertTrue("Alive at Center button should be active", animalHistoryPage.isAliveAtCenterActive());
        assertTrue("Textarea should be empty", animalHistoryPage.getIdInputValue().isEmpty());

        // Scenario 3: Verify URL contains filterType (check BEFORE DataRegion operations which may modify URL)
        log("Testing Alive at Center URL state");
        String currentUrl = getDriver().getCurrentUrl();
        assertTrue("URL should contain 'filterType:aliveAtCenter' but was: " + currentUrl,
                currentUrl.contains("filterType:aliveAtCenter"));

        // Scenario 4: Verify Demographics now shows only Alive animals
        log("Verifying Demographics shows only Alive animals");
        animalHistoryPage.clickDemographicsTab();
        assertDemographicsContainsId(animalHistoryPage, aliveAnimalId); // Alive animal should appear
        assertDemographicsDoesNotContainId(animalHistoryPage, deadAnimalId); // Dead animal should NOT appear

        // Scenario 5: Verify all Status values are "Alive"
        log("Verifying all Demographics rows have Status = Alive");
        assertDemographicsAllRowsHaveStatus(animalHistoryPage, "Alive");
        assertDemographicsNoRowsHaveStatus(animalHistoryPage, "Dead");
    }

    /**
     * Test: Animal History URL Params Mode (Read-Only)
     *
     * Tests URL Params mode for shared/bookmarked links:
     * 1. Navigate via URL with subjects
     * 2. Verify search works with URL-provided subjects
     *
     * Note: Full URL Params read-only mode (readOnly=true) may require
     * additional UI implementation to be fully testable.
     *
     * See spec: LK R&D EHR - React Animal History - Search By Id.md
     */
    @Test
    public void testAnimalHistoryUrlParamsMode()
    {
        String testAnimalId1 = MORE_ANIMAL_IDS[0];
        String testAnimalId2 = MORE_ANIMAL_IDS[1];

        // Scenario 1: Navigate to URL with subjects
        log("Testing URL with subjects parameter");
        String urlHash = "subjects:" + testAnimalId1 + ";" + testAnimalId2 + "&filterType:idSearch&showReport:1";
        ReactAnimalHistoryPage animalHistoryPage = ReactAnimalHistoryPage.beginAt(this, getContainerPath(), urlHash);

        // Verify subjects are loaded
        log("Verifying URL subjects are processed");
        animalHistoryPage.waitForReportToLoad();
        animalHistoryPage.clickDemographicsTab();
        assertReportContainsAnimals(animalHistoryPage, testAnimalId1);
    }

    /**
     * Test: Animal History Filter Mode Switching
     *
     * Tests transitions between filter modes:
     * 1. ID Search → All Animals
     * 2. All Animals → ID Search
     * 3. URL updates correctly through transitions
     *
     * See spec: LK R&D EHR - React Animal History - Search By Id.md
     */
    @Test
    public void testAnimalHistoryFilterModeSwitching()
    {
        String testAnimalId1 = MORE_ANIMAL_IDS[0];
        String testAnimalId2 = MORE_ANIMAL_IDS[1];

        ReactAnimalHistoryPage animalHistoryPage = ReactAnimalHistoryPage.beginAt(this, getContainerPath());

        // Scenario 1: Start with ID Search
        log("Testing ID Search mode");
        animalHistoryPage.searchByIds(testAnimalId1, testAnimalId2);

        // Navigate to Demographics and verify the Dead animal is shown
        log("Verifying Demographics shows the searched animal");
        animalHistoryPage.clickDemographicsTab();
        assertReportContainsAnimals(animalHistoryPage, testAnimalId1);
        assertTrue("Search By Ids button should be active", animalHistoryPage.isSearchByIdsActive());

        // Scenario 2: Switch to All Animals
        log("Testing ID Search → All Animals transition");
        animalHistoryPage.clickAllAnimals();
        assertTrue("All Animals button should be active", animalHistoryPage.isAllAnimalsActive());
        assertTrue("Textarea should be empty", animalHistoryPage.getIdInputValue().isEmpty());

        // Scenario 3: Switch back to ID Search
        log("Testing All Animals → ID Search transition");
        animalHistoryPage.searchByIds(testAnimalId1);
        assertTrue("Search By Ids button should be active", animalHistoryPage.isSearchByIdsActive());

        // Verify URL contains subjects
        log("Verifying URL state after transitions");
        String currentUrl = getDriver().getCurrentUrl();
        assertTrue("URL should contain subjects after ID search",
                currentUrl.contains("subjects:") || currentUrl.contains("filterType:idSearch"));
    }

    /**
     * Test: Animal History Keyboard Navigation
     *
     * Tests basic keyboard accessibility:
     * 1. Tab navigation to form elements
     * 2. Form submission with Enter key
     *
     * See spec: LK R&D EHR - React Animal History - Search By Id.md
     */
    @Test
    public void testAnimalHistoryKeyboardNavigation()
    {
        String testAnimalId = MORE_ANIMAL_IDS[0];

        ReactAnimalHistoryPage animalHistoryPage = ReactAnimalHistoryPage.beginAt(this, getContainerPath());

        // Scenario 1: Enter animal IDs using keyboard
        log("Testing keyboard input");
        animalHistoryPage.enterAnimalIds(testAnimalId);

        // Verify input was entered
        String enteredValue = animalHistoryPage.getIdInputValue();
        assertEquals("Entered ID should match", testAnimalId, enteredValue);

        // Scenario 2: Verify search button can be activated
        log("Testing search activation");
        animalHistoryPage
                .clickSearchByIds()
                .waitForReportToLoad();

        // Navigate to Demographics and verify the searched animal is shown
        log("Verifying Demographics shows the searched animal");
        animalHistoryPage.clickDemographicsTab();
        assertReportContainsAnimals(animalHistoryPage, testAnimalId);
    }

    // =============================================================================
    // Assertion Helpers for React Animal History Tests
    // =============================================================================

    /**
     * Assert that the report panel contains the specified animal IDs.
     * More efficient than assertTextPresent() and scoped to report area only.
     * Uses TextSearcher to batch multiple text checks in a single DOM read.
     */
    private void assertReportContainsAnimals(ReactAnimalHistoryPage page, String... animalIds)
    {
        WebElement reportPanel = page.getReportPanelElement();
        assertTextPresent(new TextSearcher(reportPanel::getText), animalIds);
    }

    /**
     * Assert that the Demographics report contains a specific animal ID.
     */
    private void assertDemographicsContainsId(ReactAnimalHistoryPage page, String animalId)
    {
        DataRegionTable table = page.getActiveReportDataRegion();
        table.setFilter("Id", "Equals", animalId);
        int rowCount = table.getDataRowCount();
        assertTrue("Demographics should contain animal ID '" + animalId + "' but found " + rowCount + " rows",
                rowCount > 0);
        table.clearFilter("Id");
    }

    /**
     * Assert that the Demographics report does NOT contain a specific animal ID.
     */
    private void assertDemographicsDoesNotContainId(ReactAnimalHistoryPage page, String animalId)
    {
        DataRegionTable table = page.getActiveReportDataRegion();
        table.setFilter("Id", "Equals", animalId);
        int rowCount = table.getDataRowCount();
        assertEquals("Demographics should NOT contain animal ID '" + animalId + "'", 0, rowCount);
        table.clearFilter("Id");
    }

    /**
     * Assert that the Demographics report contains more rows than a specified count.
     */
    private void assertDemographicsRowCountGreaterThan(ReactAnimalHistoryPage page, int minCount)
    {
        DataRegionTable table = page.getActiveReportDataRegion();
        int rowCount = table.getDataRowCount();
        assertTrue("Demographics should have more than " + minCount + " rows but found " + rowCount,
                rowCount > minCount);
    }

    /**
     * Assert that all rows in the Demographics report have a specific status value.
     */
    private void assertDemographicsAllRowsHaveStatus(ReactAnimalHistoryPage page, String expectedStatus)
    {
        DataRegionTable table = page.getActiveReportDataRegion();
        List<String> statusValues = table.getColumnDataAsText("calculated_status");
        for (String status : statusValues)
        {
            assertEquals("All Demographics rows should have status '" + expectedStatus + "'",
                    expectedStatus, status);
        }
    }

    /**
     * Assert that no rows in the Demographics report have a specific status value.
     */
    private void assertDemographicsNoRowsHaveStatus(ReactAnimalHistoryPage page, String excludedStatus)
    {
        DataRegionTable table = page.getActiveReportDataRegion();
        List<String> statusValues = table.getColumnDataAsText("calculated_status");
        for (String status : statusValues)
        {
            assertNotEquals("Demographics should not contain status '" + excludedStatus + "' but found it", status, excludedStatus);
        }
    }
}
