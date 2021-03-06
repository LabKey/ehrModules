/*
 * Copyright (c) 2017-2019 LabKey Corporation
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

import org.labkey.test.Locator;
import org.labkey.test.WebDriverWrapper;
import org.labkey.test.WebTestHelper;
import org.labkey.test.components.html.Table;
import org.labkey.test.util.DataRegionTable;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class ColonyOverviewPage extends BaseColonyOverviewPage
{
    public ColonyOverviewPage(WebDriver driver)
    {
        super(driver);
    }

    public static ColonyOverviewPage beginAt(WebDriverWrapper driver)
    {
        return beginAt(driver, driver.getCurrentContainerPath());
    }

    public static ColonyOverviewPage beginAt(WebDriverWrapper driver, String containerPath)
    {
        driver.beginAt(WebTestHelper.buildURL("ehr", containerPath, "colonyOverview"));
        return new ColonyOverviewPage(driver.getDriver());
    }

    public void clickPopulationCompositionTab()
    {
        clickTab("Population Composition");
        //TODO: return new PopulationCompositionTab(getActiveTabPanel());
    }

    public void clickSpfColonyTab()
    {
        clickTab("SPF Colony");
    }

    public void clickHousingSummaryTab()
    {
        clickTab("Housing Summary");
    }

    public WebElement clickCcsColonyTab()
    {
        clickTab("Clinical Case Summary");
        return getActiveTabPanel();
    }

    public WebElement clickUtilizationColonyTab()
    {
        clickTab("Utilization Summary");
        return getActiveTabPanel();
    }

    public BaboonColonyTab clickBaboonColonyTab()
    {
        clickTab("Baboon Colony");
        return new BaboonColonyTab(getActiveTabPanel());
    }

    public class BaboonColonyTab extends OverviewTab
    {
        protected BaboonColonyTab(WebElement el)
        {
            super(el);
            waitForElementToDisappear(Locator.byClass("labkey-data-region-loading-mask-panel"), 2 * WAIT_FOR_JAVASCRIPT);
        }

        protected final DataRegionTable assignedFundedDataRegion = colonyDataRegion("Assigned (funded)");
        protected final DataRegionTable activeIacucDataRegion = colonyDataRegion("Active IACUC Assignments");
        protected final DataRegionTable colonyUseDataRegion = colonyDataRegion("Breeding/Colony Use");
        protected final DataRegionTable unassignedDataRegion = colonyDataRegion("Unassigned");
        protected final DataRegionTable ageClassDataRegion = colonyDataRegion("Age Classes (in years)");

        private DataRegionTable colonyDataRegion(String webPartTitle)
        {
            WebElement panel = Locator.byClass("ldk-wp").withDescendant(Locator.tag("span")
                    .withAttribute("title", webPartTitle)).findWhenNeeded(this);
            return DataRegionTable.DataRegion(getDriver()).findWhenNeeded(panel);
        }

        public DataRegionTable getAssignedFundedDataRegion()
        {
            return assignedFundedDataRegion;
        }

        public DataRegionTable getActiveIacucDataRegion()
        {
            return activeIacucDataRegion;
        }
    }

    public class PopulationCompositionTab extends OverviewTab
    {
        protected PopulationCompositionTab(WebElement el)
        {
            super(el);
        }

        protected final Table populationTable = new Table(getDriver(), getComponentElement());
    }
}