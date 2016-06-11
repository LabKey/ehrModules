package org.labkey.test.pages.ehr;

import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.WebDriverWrapper;
import org.labkey.test.WebTestHelper;
import org.labkey.test.pages.LabKeyPage;
import org.labkey.test.util.DataRegionTable;
import org.labkey.test.util.Maps;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ParticipantViewPage extends LabKeyPage
{
    public static final String REPORT_TAB_SIGNAL = "LDK_reportTabLoaded";
    public static final String REPORT_PANEL_SIGNAL = "LDK_reportPanelLoaded";
    private Elements _elements;

    public ParticipantViewPage(WebDriver driver)
    {
        super(driver);
    }

    public static ParticipantViewPage beginAt(WebDriverWrapper driver, String participantId)
    {
        return beginAt(driver, driver.getCurrentContainerPath(), participantId);
    }

    public static ParticipantViewPage beginAt(WebDriverWrapper driver, String containerPath, String participantId)
    {
        driver.beginAt(WebTestHelper.buildURL("ehr", containerPath, "participantView", Maps.of("participantId", participantId)));
        return new ParticipantViewPage(driver.getDriver());
    }

    @Override
    protected void waitForPage()
    {
        waitForElement(Locators.pageSignal("LDK_reportPanelLoaded"));
    }

    public ParticipantViewPage clickCategoryTab(String categoryTab)
    {
        return clickCategoryTab(elements().findCategoryTab(categoryTab));
    }

    public ParticipantViewPage clickCategoryTab(WebElement categoryTab)
    {
        categoryTab.click();
        return this;
    }

    public ParticipantViewPage clickReportTab(String reportLabel)
    {
        return clickReportTab(elements().findReportTab(reportLabel));
    }

    public ParticipantViewPage clickReportTab(WebElement reportTab)
    {
        if (!reportTab.getAttribute("class").contains("active"))
        {
            try
            {
                doAndWaitForPageSignal(reportTab::click, REPORT_TAB_SIGNAL);
            }
            catch (StaleElementReferenceException ignore) // Tab signal might fire more than once
            {
                reportTab.isDisplayed(); // Make sure it was actually the signal that was stale
            }
            _ext4Helper.waitForMaskToDisappear();
        }
        return this;
    }

    public DataRegionTable getActiveReportDataRegion(BaseWebDriverTest test)
    {
        WebElement el = DataRegionTable.Locators.dataRegion().notHidden().waitForElement(getDriver(), 30000);
        return new DataRegionTable(test, el);
    }

    public Elements elements()
    {
        if (null == _elements)
            _elements = newElements();
        return _elements;
    }

    protected Elements newElements()
    {
        return new Elements();
    }

    protected void clearCache()
    {
        _elements = null;
    }

    public class Elements extends LabKeyPage.ElementCache
    {
        private Map<String, WebElement> categoryTabs = new HashMap<>();
        private Map<String, Map<String, WebElement>> reportTabsByCategory = new HashMap<>();

        WebElement findCategoryTab(String category)
        {
            return findCategoryTabs().get(category);
        }

        WebElement findReportTab(String reportLabel)
        {
            return findReportTabs().get(reportLabel);
        }

        public Map<String, WebElement> findCategoryTabs()
        {
            if (categoryTabs.isEmpty())
            {
                List<WebElement> tabs = Locators.categoryTab.findElements(this);
                List<String> tabLabels = getTexts(tabs);
                for (int i = 0; i < tabs.size(); i++)
                {
                    if (categoryTabs.containsKey(tabLabels.get(i)))
                        throw new IllegalStateException(String.format("Duplicate categories named '%s'", tabLabels.get(i)));
                    categoryTabs.put(tabLabels.get(i), tabs.get(i));
                }
            }

            return categoryTabs;
        }

        public Map<String, WebElement> findReportTabs()
        {
            String selectedCategory = findSelectedCategory().getText();
            if (!reportTabsByCategory.containsKey(selectedCategory))
            {
                List<WebElement> tabs = Locators.reportTab.findElements(this);
                List<String> tabLabels = getTexts(tabs);
                Map<String, WebElement> tabMap = new HashMap<>();
                for (int i = 0; i < tabs.size(); i++)
                {
                    String reportTab = tabLabels.get(i);
                    if (reportTab.isEmpty()) // Report tabs for inactive categories exist, but contain no text
                        continue;
                    if (tabMap.containsKey(reportTab))
                        throw new IllegalStateException(String.format("Duplicate reports named '%s' in category '%s'", reportTab, selectedCategory));
                    tabMap.put(reportTab, tabs.get(i));
                }
                reportTabsByCategory.put(selectedCategory, tabMap);
            }

            return reportTabsByCategory.get(selectedCategory);
        }

        WebElement findSelectedCategory()
        {
            return Locators.categoryTab.append(".x4-tab-active").findElement(this);
        }

        WebElement findSelectedReport()
        {
            List<WebElement> tabs = Locators.reportTab.append(".x4-tab-active").findElements(this);
            for (WebElement tab : tabs)
            {
                if (!tab.getText().isEmpty())
                    return tab;
            }

            return null;
        }
    }

    static class Locators extends LabKeyPage.Locators
    {
        static Locator.CssLocator categoryTab = Locator.css(".category-tab-bar .x4-tab");
        static Locator.CssLocator reportTab = Locator.css(".report-tab-bar .x4-tab");
    }
}