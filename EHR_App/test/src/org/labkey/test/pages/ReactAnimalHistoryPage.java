package org.labkey.test.pages;

import org.labkey.test.Locator;
import org.labkey.test.WebDriverWrapper;
import org.labkey.test.WebTestHelper;
import org.labkey.test.util.DataRegionTable;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.List;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.labkey.test.util.DataRegionTable.DataRegion;

/**
 * Page wrapper for the React-based Animal History page (participantViewNew).
 * Automates the React Animal History Search By Id functionality.
 */
public class  ReactAnimalHistoryPage extends LabKeyPage<ReactAnimalHistoryPage.ElementCache>
{
    public ReactAnimalHistoryPage(WebDriver driver)
    {
        super(driver);
    }

    /**
     * Navigate to the React Animal History page for the given container.
     */
    public static ReactAnimalHistoryPage beginAt(WebDriverWrapper driver, String containerPath)
    {
        driver.beginAt(WebTestHelper.buildURL("ehr", containerPath, "participantViewNew"));
        return new ReactAnimalHistoryPage(driver.getDriver());
    }

    /**
     * Navigate to the React Animal History page with URL hash parameters.
     */
    public static ReactAnimalHistoryPage beginAt(WebDriverWrapper driver, String containerPath, String urlHash)
    {
        String url = WebTestHelper.buildURL("ehr", containerPath, "participantViewNew") + "#" + urlHash;
        driver.beginAt(url);
        return new ReactAnimalHistoryPage(driver.getDriver());
    }

    @Override
    protected void waitForPage()
    {
        waitForElement(Locators.SEARCH_BY_ID_PANEL, WAIT_FOR_JAVASCRIPT);
    }

    // =========================================================================
    // Input Methods
    // =========================================================================

    /**
     * Enter animal IDs into the textarea.
     */
    public ReactAnimalHistoryPage enterAnimalIds(String... ids)
    {
        waitForElement(Locators.ANIMAL_ID_TEXTAREA);
        setFormElement(Locators.ANIMAL_ID_TEXTAREA, String.join(",", ids));
        return this;
    }

    /**
     * Clear the animal ID textarea.
     */
    public ReactAnimalHistoryPage clearIdInput()
    {
        waitForElement(Locators.ANIMAL_ID_TEXTAREA);
        setFormElement(Locators.ANIMAL_ID_TEXTAREA, "");
        return this;
    }

    /**
     * Get the current value of the animal ID textarea.
     */
    public String getIdInputValue()
    {
        return getFormElement(Locators.ANIMAL_ID_TEXTAREA);
    }

    // =========================================================================
    // Button Click Methods
    // =========================================================================

    /**
     * Click the Search By Ids button and wait for results.
     */
    public ReactAnimalHistoryPage clickSearchByIds()
    {
        click(Locators.SEARCH_BY_IDS_BUTTON);
        waitForSearchComplete();
        return this;
    }

    /**
     * Click the All Animals filter button and wait for reports to load.
     */
    public ReactAnimalHistoryPage clickAllAnimals()
    {
        click(Locators.ALL_ANIMALS_BUTTON);
        waitForReportPanelToLoad();
        return this;
    }

    /**
     * Click the All Alive at Center filter button and wait for reports to load.
     */
    public ReactAnimalHistoryPage clickAliveAtCenter()
    {
        click(Locators.ALIVE_AT_CENTER_BUTTON);
        waitForReportPanelToLoad();
        return this;
    }

    /**
     * Click a report tab by name.
     */
    public ReactAnimalHistoryPage clickReportTab(String tabName)
    {
        Locator tab = Locators.REPORT_TAB.containing(tabName);
        click(tab);
        waitForElement(Locators.REPORT_TARGET);
        return this;
    }

    /**
     * Click a category tab by name (e.g., "General", "Clinical", etc.).
     */
    public ReactAnimalHistoryPage clickCategoryTab(String categoryName)
    {
        Locator tab = Locators.CATEGORY_TAB.containing(categoryName);
        click(tab);
        sleep(500); // Allow tab switch
        return this;
    }

    /**
     * Click the Demographics tab under General category.
     * Navigates to General category first if not already there.
     */
    public ReactAnimalHistoryPage clickDemographicsTab()
    {
        clickCategoryTab("General");
        clickReportTab("Demographics");
        waitForDataRegionToLoad();
        return this;
    }

    // =========================================================================
    // Data Region Methods
    // =========================================================================

    /**
     * Get the DataRegionTable from the active report panel.
     * Use this to interact with standard LabKey data grids in reports.
     */
    public DataRegionTable getActiveReportDataRegion()
    {
        WebElement reportTarget = Locators.REPORT_TARGET.findElement(getDriver());
        DataRegionTable dataRegionTable = DataRegion(getDriver()).timeout(60000).find(reportTarget);
        dataRegionTable.setAsync(true);
        return dataRegionTable;
    }

    /**
     * Wait for the DataRegion in the report to fully load.
     */
    public ReactAnimalHistoryPage waitForDataRegionToLoad()
    {
        waitForElement(Locators.REPORT_TARGET);
        // Wait for data region to appear and stabilize
        longWait().until(d -> {
            try
            {
                WebElement reportTarget = Locators.REPORT_TARGET.findElement(getDriver());
                return DataRegion(getDriver()).timeout(5000).find(reportTarget) != null;
            }
            catch (Exception e)
            {
                return false;
            }
        });
        sleep(500); // Allow grid to stabilize
        return this;
    }

    // =========================================================================
    // Wait Methods
    // =========================================================================

    /**
     * Wait for search to complete (button stops showing "Searching..." and results appear).
     */
    public ReactAnimalHistoryPage waitForSearchComplete()
    {
        longWait().until(d -> {
            boolean buttonReady = !getText(Locators.SEARCH_BY_IDS_BUTTON).contains("Searching");
            boolean hasResults = isElementPresent(Locators.REPORT_TARGET) ||
                    isElementPresent(Locators.ID_RESOLUTION_FEEDBACK) ||
                    isElementPresent(Locators.VALIDATION_ERROR);
            return buttonReady && hasResults;
        });
        return this;
    }

    /**
     * Wait for report content to load.
     */
    public ReactAnimalHistoryPage waitForReportToLoad()
    {
        longWait().until(d -> isElementPresent(Locators.REPORT_TARGET));
        return this;
    }

    /**
     * Wait for the report panel to fully load, including category tabs.
     * Used after filter mode changes (All Animals, Alive at Center).
     */
    public ReactAnimalHistoryPage waitForReportPanelToLoad()
    {
        // Wait for the report target area to appear
        longWait().until(d -> isElementPresent(Locators.REPORT_TARGET));
        // Wait for category tabs to be present (indicates panel is fully rendered)
        longWait().until(d -> isElementPresent(Locators.CATEGORY_TAB));
        sleep(500); // Allow panel to stabilize after load
        return this;
    }

    /**
     * Allow URL hash to be processed after navigation.
     */
    public ReactAnimalHistoryPage waitForUrlHashProcessing()
    {
        sleep(1000);
        return this;
    }

    // =========================================================================
    // State Check Methods
    // =========================================================================

    /**
     * Check if the Search By Ids button is active.
     */
    public boolean isSearchByIdsActive()
    {
        return isElementPresent(Locator.css(".search-button.active"));
    }

    /**
     * Check if the All Animals button is active.
     */
    public boolean isAllAnimalsActive()
    {
        return isElementPresent(Locator.css(".filter-button.all-animals.active"));
    }

    /**
     * Check if the Alive at Center button is active.
     */
    public boolean isAliveAtCenterActive()
    {
        return isElementPresent(Locator.css(".filter-button.alive-at-center.active"));
    }

    /**
     * Check if the Alive at Center button is enabled (not disabled).
     */
    public boolean isAliveAtCenterEnabled()
    {
        return isElementPresent(Locator.css(".filter-button.alive-at-center:not(:disabled)"));
    }

    /**
     * Check if ID resolution feedback is visible.
     */
    public boolean isIdResolutionFeedbackVisible()
    {
        return isElementPresent(Locators.ID_RESOLUTION_FEEDBACK);
    }

    /**
     * Check if a validation error is visible.
     */
    public boolean isValidationErrorVisible()
    {
        return isElementPresent(Locators.VALIDATION_ERROR);
    }

    /**
     * Check if the empty state placeholder is visible.
     */
    public boolean isEmptyStatePlaceholderVisible()
    {
        return isElementPresent(Locators.EMPTY_STATE_PLACEHOLDER);
    }

    // =========================================================================
    // Assertion Methods
    // =========================================================================

    /**
     * Assert that the Search By Id panel is present with all expected elements.
     */
    public ReactAnimalHistoryPage assertDefaultStatePresent()
    {
        assertElementPresent(Locators.SEARCH_BY_ID_PANEL);
        assertElementPresent(Locators.ANIMAL_ID_TEXTAREA);
        assertElementPresent(Locators.SEARCH_BY_IDS_BUTTON);
        assertElementPresent(Locators.ALL_ANIMALS_BUTTON);
        assertElementPresent(Locators.ALIVE_AT_CENTER_BUTTON);
        return this;
    }

    /**
     * Assert that the report target area contains an animal ID.
     */
    public ReactAnimalHistoryPage assertReportContainsAnimal(String animalId)
    {
        waitForElement(Locators.REPORT_TARGET);
        assertTextPresent(animalId);
        return this;
    }

    /**
     * Assert that the report target area does not contain an animal ID.
     */
    public ReactAnimalHistoryPage assertReportDoesNotContainAnimal(String animalId)
    {
        waitForElement(Locators.REPORT_TARGET);
        assertTextNotPresent(animalId);
        return this;
    }

    /**
     * Assert that ID resolution feedback is visible or not.
     */
    public ReactAnimalHistoryPage assertIdResolutionVisible(boolean shouldBeVisible)
    {
        if (shouldBeVisible)
        {
            assertElementPresent(Locators.ID_RESOLUTION_FEEDBACK);
        }
        else
        {
            assertElementNotPresent(Locators.ID_RESOLUTION_FEEDBACK);
        }
        return this;
    }

    /**
     * Assert that a resolved alias is shown (inputId -> resolvedId with aliasType).
     */
    public ReactAnimalHistoryPage assertResolvedAliasContains(String inputId, String resolvedId, String aliasType)
    {
        assertElementPresent(Locators.RESOLVED_SECTION_TITLE);
        Locator resolvedItem = Locators.RESOLVED_ITEMS.containing(inputId);
        assertElementPresent(resolvedItem);
        assertTextPresent(resolvedId);
        return this;
    }

    /**
     * Assert that a direct match is shown in the resolved section.
     */
    public ReactAnimalHistoryPage assertResolvedContains(String directId)
    {
        assertElementPresent(Locators.RESOLVED_SECTION_TITLE);
        Locator resolvedItem = Locators.RESOLVED_ITEMS.containing(directId);
        assertElementPresent(resolvedItem);
        return this;
    }

    /**
     * Assert that a not-found ID is shown.
     */
    public ReactAnimalHistoryPage assertNotFoundContains(String id)
    {
        assertElementPresent(Locators.NOT_FOUND_SECTION_TITLE);
        Locator notFoundItem = Locators.NOT_FOUND_ITEMS.containing(id);
        assertElementPresent(notFoundItem);
        return this;
    }

    /**
     * Assert that a validation error is shown with the expected message.
     */
    public ReactAnimalHistoryPage assertValidationErrorShown(String expectedMessage)
    {
        waitForElement(Locators.VALIDATION_ERROR);
        assertTextPresent(expectedMessage);
        return this;
    }

    /**
     * Assert that no validation error is shown.
     */
    public ReactAnimalHistoryPage assertNoValidationError()
    {
        assertElementNotPresent(Locators.VALIDATION_ERROR);
        return this;
    }

    /**
     * Assert that the empty state placeholder is shown.
     */
    public ReactAnimalHistoryPage assertEmptyStatePlaceholderShown()
    {
        waitForElement(Locators.EMPTY_STATE_PLACEHOLDER);
        return this;
    }

    /**
     * Assert that the Search By Ids button is active.
     */
    public ReactAnimalHistoryPage assertSearchByIdsActive()
    {
        assertElementPresent(Locator.css(".search-button.active"));
        return this;
    }

    /**
     * Assert that the All Animals button is active.
     */
    public ReactAnimalHistoryPage assertAllAnimalsActive()
    {
        assertElementPresent(Locator.css(".filter-button.all-animals.active"));
        return this;
    }

    /**
     * Assert that the Alive at Center button is active.
     */
    public ReactAnimalHistoryPage assertAliveAtCenterActive()
    {
        assertElementPresent(Locator.css(".filter-button.alive-at-center.active"));
        return this;
    }

    /**
     * Assert that the textarea is empty.
     */
    public ReactAnimalHistoryPage assertTextareaEmpty()
    {
        String textareaValue = getFormElement(Locators.ANIMAL_ID_TEXTAREA);
        assertTrue("Textarea should be empty", textareaValue.isEmpty());
        return this;
    }

    /**
     * Assert that the current URL contains a specific string.
     */
    public ReactAnimalHistoryPage assertUrlContains(String expectedContent)
    {
        String currentUrl = getDriver().getCurrentUrl();
        assertTrue("URL should contain '" + expectedContent + "' but was: " + currentUrl,
                currentUrl.contains(expectedContent));
        return this;
    }

    // =========================================================================
    // Demographics Report Assertions
    // =========================================================================

    /**
     * Assert that the Demographics report contains a specific animal ID.
     * Filters the grid by ID column and verifies at least one row exists.
     */
    public ReactAnimalHistoryPage assertDemographicsContainsId(String animalId)
    {
        DataRegionTable table = getActiveReportDataRegion();
        table.setFilter("Id", "Equals", animalId);
        int rowCount = table.getDataRowCount();
        assertTrue("Demographics should contain animal ID '" + animalId + "' but found " + rowCount + " rows",
                rowCount > 0);
        table.clearFilter("Id");
        return this;
    }

    /**
     * Assert that the Demographics report does NOT contain a specific animal ID.
     * Filters the grid by ID column and verifies no rows exist.
     */
    public ReactAnimalHistoryPage assertDemographicsDoesNotContainId(String animalId)
    {
        DataRegionTable table = getActiveReportDataRegion();
        table.setFilter("Id", "Equals", animalId);
        int rowCount = table.getDataRowCount();
        assertTrue("Demographics should NOT contain animal ID '" + animalId + "' but found " + rowCount + " rows",
                rowCount == 0);
        table.clearFilter("Id");
        return this;
    }

    /**
     * Assert that the Demographics report contains more rows than a specified count.
     * Useful for verifying All Animals mode shows more than just searched IDs.
     */
    public ReactAnimalHistoryPage assertDemographicsRowCountGreaterThan(int minCount)
    {
        DataRegionTable table = getActiveReportDataRegion();
        int rowCount = table.getDataRowCount();
        assertTrue("Demographics should have more than " + minCount + " rows but found " + rowCount,
                rowCount > minCount);
        return this;
    }

    /**
     * Get the current row count in the Demographics report.
     */
    public int getDemographicsRowCount()
    {
        DataRegionTable table = getActiveReportDataRegion();
        return table.getDataRowCount();
    }

    /**
     * Assert that all rows in the Demographics report have a specific status value.
     * Used to verify Alive at Center mode only shows "Alive" animals.
     */
    public ReactAnimalHistoryPage assertDemographicsAllRowsHaveStatus(String expectedStatus)
    {
        DataRegionTable table = getActiveReportDataRegion();
        List<String> statusValues = table.getColumnDataAsText("calculated_status");
        for (String status : statusValues)
        {
            assertTrue("All Demographics rows should have status '" + expectedStatus + "' but found '" + status + "'",
                    status.equals(expectedStatus));
        }
        return this;
    }

    /**
     * Assert that no rows in the Demographics report have a specific status value.
     * Used to verify Alive at Center mode does not show "Dead" animals.
     */
    public ReactAnimalHistoryPage assertDemographicsNoRowsHaveStatus(String excludedStatus)
    {
        DataRegionTable table = getActiveReportDataRegion();
        List<String> statusValues = table.getColumnDataAsText("calculated_status");
        for (String status : statusValues)
        {
            assertFalse("Demographics should not contain status '" + excludedStatus + "' but found it",
                    status.equals(excludedStatus));
        }
        return this;
    }

    // =========================================================================
    // Element Cache
    // =========================================================================

    @Override
    protected ElementCache newElementCache()
    {
        return new ElementCache();
    }

    public class ElementCache extends LabKeyPage.ElementCache
    {
        WebElement searchByIdPanel = Locators.SEARCH_BY_ID_PANEL.findWhenNeeded(this);
        WebElement animalIdTextarea = Locators.ANIMAL_ID_TEXTAREA.findWhenNeeded(this);
        WebElement searchByIdsButton = Locators.SEARCH_BY_IDS_BUTTON.findWhenNeeded(this);
        WebElement allAnimalsButton = Locators.ALL_ANIMALS_BUTTON.findWhenNeeded(this);
        WebElement aliveAtCenterButton = Locators.ALIVE_AT_CENTER_BUTTON.findWhenNeeded(this);
        WebElement reportTarget = Locators.REPORT_TARGET.findWhenNeeded(this);
        WebElement idResolutionFeedback = Locators.ID_RESOLUTION_FEEDBACK.findWhenNeeded(this);
        WebElement validationError = Locators.VALIDATION_ERROR.findWhenNeeded(this);
        WebElement emptyStatePlaceholder = Locators.EMPTY_STATE_PLACEHOLDER.findWhenNeeded(this);
    }

    /**
     * CSS selectors for React Animal History components.
     */
    public static class Locators
    {
        public static final Locator SEARCH_BY_ID_PANEL = Locator.css(".search-by-id-panel");
        public static final Locator ANIMAL_ID_TEXTAREA = Locator.css(".animal-id-input");
        public static final Locator SEARCH_BY_IDS_BUTTON = Locator.css(".search-button");
        public static final Locator ALL_ANIMALS_BUTTON = Locator.css(".filter-button.all-animals");
        public static final Locator ALIVE_AT_CENTER_BUTTON = Locator.css(".filter-button.alive-at-center");
        public static final Locator REPORT_TARGET = Locator.css(".tabbed-report-panel .report-target");
        public static final Locator ID_RESOLUTION_FEEDBACK = Locator.css(".id-resolution-feedback");
        public static final Locator RESOLVED_SECTION_TITLE = Locator.css(".id-resolution-feedback .section-title.resolved");
        public static final Locator NOT_FOUND_SECTION_TITLE = Locator.css(".id-resolution-feedback .section-title.not-found");
        public static final Locator RESOLVED_ITEMS = Locator.css(".id-resolution-feedback .section .items .resolved-item");
        public static final Locator NOT_FOUND_ITEMS = Locator.css(".id-resolution-feedback .section .items .not-found-item");
        public static final Locator CATEGORY_TAB = Locator.css(".tabbed-report-panel .category-tabs a");
        public static final Locator REPORT_TAB = Locator.css(".tabbed-report-panel .report-tabs a");
        public static final Locator VALIDATION_ERROR = Locator.css(".search-by-id-panel .validation-error");
        public static final Locator EMPTY_STATE_PLACEHOLDER = Locator.css(".tabbed-report-panel .empty-state-placeholder");
    }
}
