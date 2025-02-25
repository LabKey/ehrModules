/*
 * Copyright (c) 2017-2018 LabKey Corporation
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
package org.labkey.test.components.snd;

import org.labkey.test.Locator;
import org.labkey.test.components.Component;
import org.labkey.test.components.WebDriverComponent;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.List;

public class AttributesGrid extends WebDriverComponent<AttributesGrid.ElementCache>
{
    final WebElement _el;
    final WebDriver _driver;

    public AttributesGrid(WebElement element, WebDriver driver)
    {
        _el = element;
        _driver = driver;
    }

    @Override
    public WebElement getComponentElement()
    {
        return _el;
    }

    @Override
    public WebDriver getDriver()
    {
        return _driver;
    }

    public AttributesGrid waitForRows(Integer expectedRowCount)
    {
        getWrapper().waitFor(()->  getRows().size() == expectedRowCount,
                "expected number of rows [" + expectedRowCount.toString() + "] did not appear in time",
                4000);
        return this;
    }


    public List<WebElement> getHeaderCells()
    {
        return elementCache().getHeaderCells();
    }

    public List<WebElement> getRows()
    {
        return elementCache().getRows();
    }

    public AttributeGridRow getRow(String key)
    {
        return elementCache().getRow(key);
    }

    @Override
    protected ElementCache newElementCache()
    {
        return new ElementCache();
    }

    protected class ElementCache extends Component.ElementCache
    {
        public List<WebElement> getRows()
        {
            return Locators.rows.findElements(getComponentElement());
        }

        public AttributeGridRow getRow(String key)
        {
            return AttributeGridRow.finder(AttributesGrid.this).withKey(key)
                    .timeout(4000).find(getComponentElement());
        }

        public List<WebElement> getHeaderCells()
        {
            return Locators.headerCells.findElements(getComponentElement());
        }
    }

    public static class Locators
    {
        public static final Locator rows = Locator.css("tbody tr");
        public static final Locator headerCells = Locator.xpath("//thead/tr/th/strong");
    }
}