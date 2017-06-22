/*
 * Copyright (c) 2016-2017 LabKey Corporation
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
        }

        protected final DataRegionTable assignedFundedDataRegion = DataRegionTable.DataRegion(getDriver()).find(this);

        public DataRegionTable getAssignedFundedDataRegion()
        {
            return assignedFundedDataRegion;
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