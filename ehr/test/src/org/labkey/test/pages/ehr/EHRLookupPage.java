/*
 * Copyright (c) 2024-2026 LabKey Corporation
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
import org.labkey.test.components.ui.grids.QueryGrid;
import org.labkey.test.pages.LabKeyPage;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.StaleElementReferenceException;

public class EHRLookupPage extends LabKeyPage<EHRLookupPage.ElementCache>
{
    public EHRLookupPage(WebDriverWrapper driver)
    {
        super(driver);
        waitForPage();
    }
    @Override
    public void waitForPage()
    {
        waitFor(() -> {
            try
            {
                return elementCache().queryGrid.isLoaded();
            }
            catch (NoSuchElementException | StaleElementReferenceException retry)
            {
                return false;
            }
        }, "the ehr look up page did not initialize", 10_000);
    }

    public QueryGrid getQueryGrid()
    {
        return elementCache().queryGrid;
    }

    @Override
    protected EHRLookupPage.ElementCache newElementCache()
    {
        return new EHRLookupPage.ElementCache();
    }

    protected class ElementCache extends LabKeyPage.ElementCache
    {
        public static final Locator pageTitle = Locator.tagWithText("h3", "EHR Lookups Page");
        QueryGrid queryGrid = new QueryGrid.QueryGridFinder(getDriver()).find();
    }
}
