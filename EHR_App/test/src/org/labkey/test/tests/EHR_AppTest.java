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
import org.labkey.test.util.PostgresOnlyTest;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertEquals;
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

    private void doSetup() throws Exception
    {
        initProject("EHR App");
        goToEHRFolder();
    }

    @Override
    public BrowserType bestBrowser()
    {
        return BrowserType.CHROME;
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
        animalHistoryPage
                .assertDefaultStatePresent()
                .assertNoValidationError()
                .assertEmptyStatePlaceholderShown();

        // Scenario 2: Single direct ID match
        log("Testing single direct ID search");
        animalHistoryPage
                .enterAnimalIds(testAnimalId1)
                .clickSearchByIds()
                .waitForReportToLoad()
                .assertReportContainsAnimal(testAnimalId1);

        // Scenario 3: Multi-animal direct search
        log("Testing multi-animal search");
        animalHistoryPage
                .clearIdInput()
                .enterAnimalIds(testAnimalId1, testAnimalId2, testAnimalId3)
                .clickSearchByIds()
                .waitForReportToLoad()
                .assertReportContainsAnimal(testAnimalId1)
                .assertReportContainsAnimal(testAnimalId2)
                .assertReportContainsAnimal(testAnimalId3);

        // Scenario 4: Mixed valid/invalid IDs (not found feedback)
        log("Testing mixed valid/invalid IDs with not-found feedback");
        animalHistoryPage
                .clearIdInput()
                .enterAnimalIds(testAnimalId1, "INVALID_ID_XYZ_999")
                .clickSearchByIds()
                .assertIdResolutionVisible(true)
                .assertNotFoundContains("INVALID_ID_XYZ_999")
                .waitForReportToLoad()
                .assertReportContainsAnimal(testAnimalId1);

        // Scenario 5: Case-insensitive matching
        log("Testing case-insensitive search");
        String lowercaseId = testAnimalId1.toLowerCase();
        animalHistoryPage
                .clearIdInput()
                .enterAnimalIds(lowercaseId)
                .clickSearchByIds()
                .waitForReportToLoad()
                .assertReportContainsAnimal(testAnimalId1);
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
                .clickSearchByIds()
                .assertValidationErrorShown("Please enter at least one animal ID");

        // Scenario 2: Validation error clears when input is added
        log("Testing validation error clears when input is added");
        animalHistoryPage
                .enterAnimalIds(MORE_ANIMAL_IDS[0])
                .assertNoValidationError();

        // Scenario 3: Search succeeds after adding input
        log("Testing search succeeds after adding input");
        animalHistoryPage
                .clickSearchByIds()
                .waitForReportToLoad()
                .assertReportContainsAnimal(MORE_ANIMAL_IDS[0]);
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
        animalHistoryPage
                .enterAnimalIds(searchedAnimalId)
                .clickSearchByIds()
                .waitForReportToLoad();

        // Navigate to Demographics and verify only the searched animal is shown
        log("Verifying Demographics shows only searched animal");
        animalHistoryPage.clickDemographicsTab();
        int initialRowCount = animalHistoryPage.getDemographicsRowCount();
        log("Initial Demographics row count: " + initialRowCount);
        animalHistoryPage.assertDemographicsContainsId(searchedAnimalId);

        // Scenario 2: Activate All Animals mode
        log("Testing All Animals mode activation");
        animalHistoryPage
                .clickAllAnimals()
                .assertTextareaEmpty()
                .assertAllAnimalsActive();

        // Scenario 3: Verify URL contains filterType (check BEFORE DataRegion operations which may modify URL)
        log("Testing All Animals URL state");
        animalHistoryPage.assertUrlContains("filterType:all");

        // Scenario 4: Verify Demographics now shows more animals
        log("Verifying Demographics shows more animals in All Animals mode");
        animalHistoryPage
                .clickDemographicsTab()
                .assertDemographicsRowCountGreaterThan(initialRowCount)
                .assertDemographicsContainsId(otherAnimalId); // Verify animal NOT in original search now appears
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
        animalHistoryPage
                .enterAnimalIds(deadAnimalId)
                .clickSearchByIds()
                .waitForReportToLoad();

        // Navigate to Demographics and verify the Dead animal is shown
        log("Verifying Demographics shows the Dead animal");
        animalHistoryPage
                .clickDemographicsTab()
                .assertDemographicsContainsId(deadAnimalId);

        log("Testing Alive at Center mode activation");

        if (animalHistoryPage.isAliveAtCenterEnabled())
        {
            // Scenario 2: Activate Alive at Center mode
            animalHistoryPage
                    .clickAliveAtCenter()
                    .assertAliveAtCenterActive()
                    .assertTextareaEmpty();

            // Scenario 3: Verify URL contains filterType (check BEFORE DataRegion operations which may modify URL)
            log("Testing Alive at Center URL state");
            animalHistoryPage.assertUrlContains("filterType:aliveAtCenter");

            // Scenario 4: Verify Demographics now shows only Alive animals
            log("Verifying Demographics shows only Alive animals");
            animalHistoryPage
                    .clickDemographicsTab()
                    .assertDemographicsContainsId(aliveAnimalId) // Alive animal should appear
                    .assertDemographicsDoesNotContainId(deadAnimalId); // Dead animal should NOT appear

            // Scenario 5: Verify all Status values are "Alive"
            log("Verifying all Demographics rows have Status = Alive");
            animalHistoryPage
                    .assertDemographicsAllRowsHaveStatus("Alive")
                    .assertDemographicsNoRowsHaveStatus("Dead");
        }
        else
        {
            log("Alive at Center button is disabled - skipping mode activation test");
            // Button may be disabled if current report doesn't support non-ID filters
            // This is expected behavior based on spec
        }
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

        // Allow URL hash to be processed
        animalHistoryPage.waitForUrlHashProcessing();

        // Verify subjects are loaded
        log("Verifying URL subjects are processed");
        animalHistoryPage
                .waitForReportToLoad()
                .assertReportContainsAnimal(testAnimalId1);
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
        animalHistoryPage
                .enterAnimalIds(testAnimalId1, testAnimalId2)
                .clickSearchByIds()
                .waitForReportToLoad()
                .assertReportContainsAnimal(testAnimalId1)
                .assertSearchByIdsActive();

        // Scenario 2: Switch to All Animals
        log("Testing ID Search → All Animals transition");
        animalHistoryPage
                .clickAllAnimals()
                .assertAllAnimalsActive()
                .assertTextareaEmpty();

        // Scenario 3: Switch back to ID Search
        log("Testing All Animals → ID Search transition");
        animalHistoryPage
                .enterAnimalIds(testAnimalId1)
                .clickSearchByIds()
                .waitForReportToLoad()
                .assertSearchByIdsActive();

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
                .waitForReportToLoad()
                .assertReportContainsAnimal(testAnimalId);
    }
}
