/*
 * Copyright (c) 2016-2019 LabKey Corporation
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
package org.labkey.test.pages.ehr;

import org.apache.commons.collections4.BidiMap;
import org.apache.commons.collections4.bidimap.DualTreeBidiMap;
import org.labkey.test.Locator;
import org.labkey.test.WebDriverWrapper;
import org.labkey.test.WebTestHelper;
import org.labkey.test.pages.LabKeyPage;
import org.labkey.test.util.DataRegionTable;
import org.labkey.test.util.Maps;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import static org.labkey.test.util.DataRegionTable.DataRegion;

public class ParticipantViewPage<EC extends ParticipantViewPage.ElementCache> extends LabKeyPage<EC>
{
    public static final String REPORT_TAB_SIGNAL = "LDK_reportTabLoaded";
    public static final String REPORT_PANEL_SIGNAL = "LDK_reportPanelLoaded";

    public static final int LONG_REPORT_WAIT = 10000;

    protected static final Locator.XPathLocator categoryPanel = Locator.tagWithId("div", "bs-category-tabs-list");
    protected static final Locator.XPathLocator categoryPanelTabs = categoryPanel.childTag("div").withClass("nav-bg").childTag("ul").withClass("nav").childTag("li").childTag("a");
    protected static final Locator.XPathLocator activeCategoryPanel = categoryPanel.childTag("div").withClass("tab-content").childTag("div").withClass("active");
    protected static final Locator.XPathLocator reportPanel = activeCategoryPanel.descendant(Locator.tagWithId("div", "bs-report-tabs-list"));
    protected static final Locator.XPathLocator reportPanelTabs = activeCategoryPanel.descendant(Locator.tag("ul").withClass("nav-pills")).childTag("li").childTag("a");
    protected static final Locator.XPathLocator activeReportTab = activeCategoryPanel.descendant(Locator.tag("ul").withClass("nav-pills")).childTag("li").withClass("active").childTag("a");
    protected static final Locator.XPathLocator activeReportPanel = reportPanel.childTag("div").withClass("tab-content").childTag("div").withClass("active").childTag("div");
    protected static final Locator.XPathLocator activeReportPanelContainer = activeReportPanel.descendant(Locator.tagWithAttributeContaining("div", "id", "innerCt"));

    private List longReports;

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
        ParticipantViewPage page = new ParticipantViewPage(driver.getDriver());
        page.ensureWaitForReports();
        return page;
    }

    // Add to this list (or override) to add additional wait for long running reports
    private List longRunningReports()
    {
        if (longReports == null)
        {
            longReports = Arrays.asList("Snapshot");
        }

        return longReports;
    }

    protected void ensureWaitForReports()
    {
        String active = getDriver().findElement(activeReportTab).getText();

        if (longRunningReports().contains(active))
        {
            sleep(LONG_REPORT_WAIT);
        }
    }

    @Override
    protected void waitForPage()
    {
        waitForElement(org.labkey.test.Locators.pageSignal(REPORT_PANEL_SIGNAL));
    }

    public ParticipantViewPage clickCategoryTab(String categoryLabel)
    {
        elementCache().findCategoryTab(categoryLabel).select();
        return this;
    }

    public ParticipantViewPage clickReportTab(String reportLabel)
    {
        elementCache().findReportTab(reportLabel).select();
        return this;
    }

    public WebElement getActiveReportPanel()
    {
        return activeReportPanel.findElementOrNull(getDriver());
    }

    public DataRegionTable getActiveReportDataRegion()
    {
        DataRegionTable dataRegionTable = DataRegion(getDriver()).timeout(60000).find(getActiveReportPanel());
        dataRegionTable.setAsync(true);
        shortWait().until(ExpectedConditions.visibilityOf(dataRegionTable.getComponentElement()));
        return dataRegionTable;
    }

    public List<DataRegionTable> getActiveReportDataRegions()
    {
        List<DataRegionTable> dataRegions = DataRegion(getDriver()).timeout(60000).findAll(getActiveReportPanel());
        for (DataRegionTable dataRegion : dataRegions)
        {
            dataRegion.setAsync(true);
        }
        return dataRegions;
    }

    public CategoryTab findCategoryTab(String category)
    {
        return elementCache().findCategoryTab(category);
    }

    public Map<Integer, CategoryTab> findCategoryTabs()
    {
        return elementCache().findCategoryTabs();
    }

    public ReportTab findReportTab(String reportLabel)
    {
        return elementCache().findReportTab(reportLabel);
    }

    public Map<Integer, ReportTab> getReportTabsForSelectedCategory()
    {
        return elementCache().getReportTabsForSelectedCategory();
    }

    @Override
    protected EC newElementCache()
    {
        return (EC) new ElementCache();
    }

    protected class ElementCache extends LabKeyPage.ElementCache
    {
        protected final BidiMap<String, Integer> categoryLabels = new DualTreeBidiMap<>();
        protected final Map<Integer, CategoryTab> categoryTabs = new TreeMap<>();
        protected final Map<String, BidiMap<String, Integer>> reportLabels = new TreeMap<>();
        protected final Map<String, Map<Integer, ReportTab>> reportTabs = new TreeMap<>();
        protected CategoryTab selectedCategory;

        // Ensure we're getting tab in active category
        private WebElement getReportTabElByName(String name)
        {
            return Locator.tagWithClass("div", "active").descendant(Locator.tagWithId("a", name.replace(" ", "") + "Tab")).findElement(this);
        }

        private WebElement getCategoryTabElByName(String name)
        {
            return Locator.tagWithId("a", name.replace(" ", "") + "Tab").findElement(this);
        }

        public CategoryTab findCategoryTab(String category)
        {
            if (!categoryLabels.containsKey(category))
            {
                WebElement tabEl = getCategoryTabElByName(category);
                CategoryTab tab = new CategoryTab(tabEl, category);
                categoryLabels.put(category, tab.getIndex());
                categoryTabs.put(tab.getIndex(), tab);
            }
            return findCategoryTabs().get(categoryLabels.get(category));
        }

        public ReportTab findReportTab(String reportLabel)
        {
            String selectedCategory = findSelectedCategory().getLabel();
            reportLabels.putIfAbsent(selectedCategory, new DualTreeBidiMap<>());

            if (!reportLabels.get(selectedCategory).containsKey(reportLabel))
            {
                reportTabs.put(selectedCategory, new TreeMap<>());

                WebElement tabEl = getReportTabElByName(reportLabel);
                ReportTab tab = new ReportTab(tabEl, reportLabel);
                reportLabels.get(selectedCategory).put(reportLabel, tab.getIndex());
                reportTabs.get(selectedCategory).put(tab.getIndex(), tab);
            }
            return getReportTabsForSelectedCategory().get(reportLabels.get(selectedCategory).get(reportLabel));
        }

        // null for category tabs, else found all report tabs for each listed category
        private final List<String> foundAllTabs = new ArrayList<>();
        public Map<Integer, CategoryTab> findCategoryTabs()
        {
            if (!foundAllTabs.contains(null))
            {
                foundAllTabs.add(null);
                List<WebElement> tabs = categoryPanelTabs.findElements(this);
                for (int i = 0; i < tabs.size(); i++)
                {
                    categoryTabs.putIfAbsent(i, new CategoryTab(tabs.get(i), i));
                }
            }
            return categoryTabs;
        }

        public Map<Integer, ReportTab> getReportTabsForSelectedCategory()
        {
            String selectedCategory = findSelectedCategory().getLabel();

            if (!foundAllTabs.contains(selectedCategory))
            {
                foundAllTabs.add(selectedCategory);
                reportTabs.putIfAbsent(selectedCategory, new TreeMap<>());
                reportLabels.putIfAbsent(selectedCategory, new DualTreeBidiMap<>());
                List<WebElement> tabs = reportPanelTabs.findElements(this);

                for (int i = 0; i < tabs.size(); i++)
                {
                    reportTabs.get(selectedCategory).putIfAbsent(i, new ReportTab(tabs.get(i), i));
                }
            }
            return reportTabs.get(selectedCategory);
        }

        CategoryTab findSelectedCategory()
        {
            if (selectedCategory != null && selectedCategory.isActive())
                return selectedCategory;

            for (CategoryTab categoryTab : findCategoryTabs().values())
            {
                if (categoryTab.isActive())
                {
                    selectedCategory = categoryTab;
                    return categoryTab;
                }
            }
            return null;
        }
    }

    public abstract class Tab
    {
        final WebElement _el;
        private String _label;
        private Integer _index;

        protected Tab(WebElement el)
        {
            _el = el;
        }

        protected Tab(WebElement el, String label)
        {
            this(el);
            _label = label;
        }

        protected Tab(WebElement el, Integer index)
        {
            this(el);
            _index = index;
        }

        public String getLabel()
        {
            if (_label == null)
                _label = _el.getText();
            return _label;
        }

        public Integer getIndex()
        {
            if (_index == null)
                _index = Locator.xpath("../preceding-sibling::a").findElements(_el).size();
            return _index;
        }

        public boolean isActive()
        {
            return _el.findElement(By.xpath("..")).getAttribute("class").contains("active");
        }

        @Override
        public String toString()
        {
            return getLabel();
        }

        public abstract void select();
    }

    public class CategoryTab extends Tab
    {
        protected CategoryTab(WebElement el)
        {
            super(el);
        }

        protected CategoryTab(WebElement el, String label)
        {
            super(el, label);
        }

        protected CategoryTab(WebElement el, Integer index)
        {
            super(el, index);
        }

        @Override
        public void select()
        {
            if (!isActive())
            {
                log("Selecting Category: " + getLabel());
                WebElement activeReportPanelEl = activeReportPanel.findElement(getDriver());
                scrollIntoView(_el);
                _el.click();
                shortWait().until(ExpectedConditions.invisibilityOfAllElements(Collections.singletonList(activeReportPanelEl)));
                elementCache().selectedCategory = this;
                reportPanelTabs.waitForElement(getDriver(), 10000);
                sleep(5000);
            }
            else
            {
                log("Category already selected: " + getLabel());
            }
        }
    }

    public class ReportTab extends Tab
    {
        protected ReportTab(WebElement el)
        {
            super(el);
        }

        protected ReportTab(WebElement el, String label)
        {
            super(el, label);
        }

        protected ReportTab(WebElement el, Integer index)
        {
            super(el, index);
        }

        private boolean isJsReport()
        {
            return isElementPresent(Locator.tagWithId("div", "reporttype-js"));
        }

        private boolean isOtherReport()
        {
            return isElementPresent(Locator.tagWithId("div", "reporttype-report"));
        }

        @Override
        public void select()
        {
            if (!isActive())
            {
                log("Selecting Report: " + getLabel());
                scrollIntoView(_el);
                doAndWaitForRepeatedPageSignal(_el::click, REPORT_TAB_SIGNAL, Duration.ofSeconds(2), longWait());
                _ext4Helper.waitForMaskToDisappear(30000);
                activeReportPanelContainer.waitForElement(getDriver(), 10000);
                sleep(5000);
            }
            else
            {
                log("Report already selected: " + getLabel());
            }
        }
    }
}
