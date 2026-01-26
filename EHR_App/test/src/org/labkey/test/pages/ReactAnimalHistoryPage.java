package org.labkey.test.pages;

import org.apache.commons.lang3.StringUtils;
import org.labkey.test.Locator;
import org.labkey.test.WebDriverWrapper;
import org.labkey.test.WebTestHelper;
import org.labkey.test.util.DataRegionTable;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.util.Optional;

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
        setFormElement(elementCache().animalIdTextarea, String.join(",", ids));
        return this;
    }

    /**
     * Clear the animal ID textarea.
     */
    public ReactAnimalHistoryPage clearIdInput()
    {
        setFormElement(elementCache().animalIdTextarea, "");
        return this;
    }

    /**
     * Get the current value of the animal ID textarea.
     */
    public String getIdInputValue()
    {
        return getFormElement(elementCache().animalIdTextarea);
    }

    // =========================================================================
    // Button Click Methods
    // =========================================================================

    /**
     * Click the Search By Ids button and wait for results.
     */
    public ReactAnimalHistoryPage clickSearchByIds()
    {
        elementCache().searchByIdsButton.click();
        waitForSearchComplete();
        return this;
    }

    /**
     * Convenience method to clear input, enter animal IDs, click search, and wait for report to load.
     * Combines clearIdInput(), enterAnimalIds(), clickSearchByIds(), and waitForReportToLoad().
     */
    public ReactAnimalHistoryPage searchByIds(String... ids)
    {
        clearIdInput();
        enterAnimalIds(ids);
        clickSearchByIds();
        waitForReportToLoad();
        return this;
    }

    /**
     * Click the All Animals filter button and wait for reports to load.
     */
    public ReactAnimalHistoryPage clickAllAnimals()
    {
        doAndWaitForReportToRefresh(() -> elementCache().allAnimalsButton.click());
        return this;
    }

    /**
     * Click the All Alive at Center filter button and wait for reports to load.
     */
    public ReactAnimalHistoryPage clickAliveAtCenter()
    {
        doAndWaitForReportToRefresh(() -> elementCache().aliveAtCenterButton.click());
        return this;
    }

    /**
     * Click a report tab by name.
     */
    public ReactAnimalHistoryPage clickReportTab(String tabName)
    {
        selectTab(Locators.REPORT_TAB.withText(tabName).findElement(getDriver()));
        return this;
    }

    /**
     * Click a category tab by name (e.g., "General", "Clinical", etc.).
     */
    public ReactAnimalHistoryPage clickCategoryTab(String categoryName)
    {
        selectTab(Locators.CATEGORY_TAB.withText(categoryName).findElement(getDriver()));
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
     * Get the report panel WebElement for scoped text searches.
     * Use with TextSearcher to efficiently batch multiple text checks.
     */
    public WebElement getReportPanelElement()
    {
        return waitForElement(Locators.REPORT_TARGET);
    }

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
        WebElement reportTarget = Locators.REPORT_TARGET.refindWhenNeeded(getDriver());
        DataRegion(getDriver()).timeout(5000).waitFor(reportTarget);
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
        longWait().withMessage("Search did not complete (button ready and results present).")
            .until(d -> {
                boolean buttonReady = !elementCache().searchByIdsButton.getText().contains("Searching");
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
        Locators.REPORT_TARGET.waitForElement(longWait());
        return this;
    }

    // =========================================================================
    // Private Helper Methods
    // =========================================================================

    /**
     * Select the specified tab and wait for the report panel to refresh.
     * No-op if tab is already active.
     */
    private void selectTab(final WebElement tabEl)
    {
        if (!StringUtils.trimToEmpty(tabEl.getDomAttribute("class")).contains("active"))
        {
            doAndWaitForReportToRefresh(tabEl::click);
        }
    }

    /**
     * Execute an action and wait for the report content to refresh.
     * Waits for existing report element to become stale, then waits for new content.
     */
    private void doAndWaitForReportToRefresh(Runnable runnable)
    {
        Locator.CssLocator reportContentLoc = ((Locator.CssLocator) Locators.REPORT_TARGET).child("div");
        Optional<WebElement> existingReport = reportContentLoc.findOptionalElement(getDriver());
        runnable.run();
        existingReport.ifPresent(reportEl -> {
            shortWait().until(ExpectedConditions.stalenessOf(reportEl));
            waitForElement(reportContentLoc);
        });
    }

    // =========================================================================
    // State Check Methods
    // =========================================================================

    /**
     * Check if the search panel is present.
     */
    public boolean isSearchByIdPanelPresent()
    {
        return isElementPresent(Locators.SEARCH_BY_ID_PANEL);
    }

    /**
     * Check if the animal ID textarea is present.
     */
    public boolean isAnimalIdTextareaPresent()
    {
        return isElementPresent(Locators.ANIMAL_ID_TEXTAREA);
    }

    /**
     * Check if the Search By Ids button is present.
     */
    public boolean isSearchByIdsButtonPresent()
    {
        return isElementPresent(Locators.SEARCH_BY_IDS_BUTTON);
    }

    /**
     * Check if the All Animals button is present.
     */
    public boolean isAllAnimalsButtonPresent()
    {
        return isElementPresent(Locators.ALL_ANIMALS_BUTTON);
    }

    /**
     * Check if the Alive at Center button is present.
     */
    public boolean isAliveAtCenterButtonPresent()
    {
        return isElementPresent(Locators.ALIVE_AT_CENTER_BUTTON);
    }

    /**
     * Check if the not-found feedback section is present.
     */
    public boolean isNotFoundSectionPresent()
    {
        return isElementPresent(Locators.NOT_FOUND_SECTION_TITLE);
    }

    /**
     * Check if a specific item is in the not-found list.
     */
    public boolean hasNotFoundItem(String item)
    {
        return isElementPresent(Locators.NOT_FOUND_ITEMS.withText(item));
    }

    /**
     * Check if the Search By Ids button is active.
     */
    public boolean isSearchByIdsActive()
    {
        return isElementPresent(Locators.SEARCH_BY_IDS_BUTTON_ACTIVE);
    }

    /**
     * Check if the All Animals button is active.
     */
    public boolean isAllAnimalsActive()
    {
        return isElementPresent(Locators.ALL_ANIMALS_BUTTON_ACTIVE);
    }

    /**
     * Check if the Alive at Center button is active.
     */
    public boolean isAliveAtCenterActive()
    {
        return isElementPresent(Locators.ALIVE_AT_CENTER_BUTTON_ACTIVE);
    }

    /**
     * Check if the Alive at Center button is enabled (not disabled).
     */
    public boolean isAliveAtCenterEnabled()
    {
        return isElementPresent(Locators.ALIVE_AT_CENTER_BUTTON_ENABLED);
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
        waitForElement(Locators.EMPTY_STATE_PLACEHOLDER);
        return isElementPresent(Locators.EMPTY_STATE_PLACEHOLDER);
    }

    /**
     * Get the current row count in the Demographics report.
     */
    public int getDemographicsRowCount()
    {
        DataRegionTable table = getActiveReportDataRegion();
        return table.getDataRowCount();
    }

    // =========================================================================
    // Element Cache
    // =========================================================================

    @Override
    protected ElementCache newElementCache()
    {
        return new ElementCache();
    }

    public class ElementCache extends LabKeyPage<ElementCache>.ElementCache
    {
        final WebElement searchByIdPanel = Locators.SEARCH_BY_ID_PANEL.findWhenNeeded(this);
        final WebElement animalIdTextarea = Locators.ANIMAL_ID_TEXTAREA.findWhenNeeded(this);
        final WebElement searchByIdsButton = Locators.SEARCH_BY_IDS_BUTTON.findWhenNeeded(this);
        final WebElement allAnimalsButton = Locators.ALL_ANIMALS_BUTTON.findWhenNeeded(this);
        final WebElement aliveAtCenterButton = Locators.ALIVE_AT_CENTER_BUTTON.findWhenNeeded(this);
        // Note: reportTarget, idResolutionFeedback, validationError, emptyStatePlaceholder
        // are dynamic elements that appear/disappear and should not be cached
    }

    /**
     * CSS selectors for React Animal History components.
     */
    public static class Locators
    {
        public static final Locator SEARCH_BY_ID_PANEL = Locator.css(".search-by-id-panel");
        public static final Locator ANIMAL_ID_TEXTAREA = Locator.css(".animal-id-input");
        public static final Locator SEARCH_BY_IDS_BUTTON = Locator.css(".search-button");
        public static final Locator SEARCH_BY_IDS_BUTTON_ACTIVE = Locator.css(".search-button.active");
        public static final Locator ALL_ANIMALS_BUTTON = Locator.css(".filter-button.all-animals");
        public static final Locator ALL_ANIMALS_BUTTON_ACTIVE = Locator.css(".filter-button.all-animals.active");
        public static final Locator ALIVE_AT_CENTER_BUTTON = Locator.css(".filter-button.alive-at-center");
        public static final Locator ALIVE_AT_CENTER_BUTTON_ACTIVE = Locator.css(".filter-button.alive-at-center.active");
        public static final Locator ALIVE_AT_CENTER_BUTTON_ENABLED = Locator.css(".filter-button.alive-at-center:not(:disabled)");
        public static final Locator REPORT_TARGET = Locator.css(".tabbed-report-panel .report-target");
        public static final Locator ID_RESOLUTION_FEEDBACK = Locator.css(".id-resolution-feedback");
        public static final Locator RESOLVED_SECTION_TITLE = Locator.css(".id-resolution-feedback .section-title.resolved");
        public static final Locator NOT_FOUND_SECTION_TITLE = Locator.css(".id-resolution-feedback .section-title.not-found");
        public static final Locator RESOLVED_ITEMS = Locator.css(".id-resolution-feedback .section .items .resolved-item");
        public static final Locator NOT_FOUND_ITEMS = Locator.css(".id-resolution-feedback .section .items .not-found-item");
        public static final Locator CATEGORY_TAB = Locator.css(".tabbed-report-panel .category-tabs button");
        public static final Locator REPORT_TAB = Locator.css(".tabbed-report-panel .report-tabs button");
        public static final Locator VALIDATION_ERROR = Locator.css(".search-by-id-panel .validation-error");
        public static final Locator EMPTY_STATE_PLACEHOLDER = Locator.css(".tabbed-report-panel .empty-state-placeholder");
    }
}
