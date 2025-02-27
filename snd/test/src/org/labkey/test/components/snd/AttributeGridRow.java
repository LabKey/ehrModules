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
import org.labkey.test.components.html.Checkbox;
import org.labkey.test.components.html.Input;
import org.labkey.test.components.html.SelectWrapper;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;

import static org.labkey.test.components.html.Input.Input;

public class AttributeGridRow extends WebDriverComponent<AttributeGridRow.ElementCache>
{
    final WebElement _el;
    final WebDriver _driver;

    public AttributeGridRow(WebElement element, WebDriver driver)
    {
        _el = element;          // componentElement will the a TR
        _driver = driver;
    }

    static public AttributeGridRowFinder finder(AttributesGrid grid)
    {
        return new AttributeGridRowFinder(grid);
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

    public AttributeGridRow setDataType(String dataType)
    {
        elementCache().dataTypeSelect.selectByVisibleText(dataType);
        return this;
    }

    public String getDataType()
    {
        return elementCache().dataTypeSelect.getFirstSelectedOption().getText();
    }

    public AttributeGridRow selectLookupKey(String key)
    {
        elementCache().lookupKeySelect.selectByVisibleText(key);
        if (!key.equals(""))
        {
            getWrapper().waitForElement(elementCache().DEFAULT_VALUE_SELECT);
        }
        else
        {
            getWrapper().waitForElement(elementCache().DEFAULT_VALUE_INPUT);
        }

        return this;
    }

    public String getLookupKey()
    {
        return elementCache().lookupKeySelect.getFirstSelectedOption().getText();
    }

    public AttributeGridRow setLabel(String dataType)
    {
        elementCache().labelInput.set(dataType);
        return this;
    }

    public String getLabel()
    {
        return elementCache().labelInput.get();
    }

    public AttributeGridRow setMin(int min)
    {
        elementCache().minInput.set(Integer.toString(min));
        return this;
    }

    public String getMin()
    {
        return elementCache().minInput.get();
    }

    public AttributeGridRow setMax(int min)
    {
        elementCache().maxInput.set(Integer.toString(min));
        return this;
    }

    public String getMax()
    {
        return elementCache().maxInput.get();
    }

    public AttributeGridRow setDefault(String defaultValue)
    {
        elementCache().defaultValueInput.set(defaultValue);
        return this;
    }

    public String getDefault()
    {
        return elementCache().defaultValueInput.get();
    }

    public AttributeGridRow setDefaultLookup(String defaultValue)
    {
        elementCache().defaultValueSelect.selectByVisibleText(defaultValue);
        return this;
    }

    public String getDefaultLookup()
    {
        return elementCache().defaultValueSelect.getFirstSelectedOption().getText();
    }

    public AttributeGridRow selectOrder(String order)   // values: "Move Up", "Move Down"
    {
        elementCache().orderSelect.selectByVisibleText(order);
        return this;
    }

    public AttributeGridRow setRequired(boolean required)   // values: "Move Up", "Move Down"
    {
        elementCache().requiredBox.set(required);
        return this;
    }

    public boolean getRequired()
    {
        return elementCache().requiredBox.get();
    }

    public AttributeGridRow setRedactedText(String text)
    {
        elementCache().redactedTextInput.set(text);
        return this;
    }

    public String getRedactedText()
    {
        return elementCache().redactedTextInput.get();
    }

    @Override
    protected ElementCache newElementCache()
    {
        return new ElementCache();
    }

    protected class ElementCache extends Component.ElementCache
    {
        Locator DEFAULT_VALUE_SELECT = Locator.xpath("//div/select[contains(@name, 'defaultValue')]");
        Locator DEFAULT_VALUE_INPUT = Locator.xpath("//div/input[contains(@name, 'defaultValue')]");

        Select lookupKeySelect = SelectWrapper.Select(Locator.xpath("//div/select[contains(@name, '_lookupKey')]"))
                .findWhenNeeded(getComponentElement());
        Select dataTypeSelect = SelectWrapper.Select(Locator.xpath("//div/select[contains(@name, '_rangeURI')]"))
                .findWhenNeeded(getComponentElement());
        Input labelInput = Input(Locator.xpath("//div/input[contains(@name, '_label')]"), getDriver())
                .findWhenNeeded(getComponentElement());
        Input minInput = Input(Locator.xpath("//div/input[contains(@name, '_min')]"), getDriver()
        ).findWhenNeeded(getComponentElement());
        Input maxInput = Input(Locator.xpath("//div/input[contains(@name, '_max')]"), getDriver())
                .findWhenNeeded(getComponentElement());
        Input defaultValueInput = Input(DEFAULT_VALUE_INPUT, getDriver())
                .findWhenNeeded(getComponentElement());
        Select defaultValueSelect = SelectWrapper.Select(DEFAULT_VALUE_SELECT)
                .findWhenNeeded(getComponentElement());
        Select orderSelect = SelectWrapper.Select(Locator.xpath("//div/select[contains(@name, '_sortOrder')]"))
                .findWhenNeeded(getComponentElement());
        org.labkey.test.components.html.Checkbox requiredBox = Checkbox.Checkbox(Locator.xpath("//span/input[contains(@name, '_required')]"))
                .findWhenNeeded(getComponentElement());
        Input redactedTextInput = Input(Locator.xpath("//div/input[contains(@name, '_redactedText')]"), getDriver())
                .findWhenNeeded(getComponentElement());
    }

    public static class AttributeGridRowFinder extends WebDriverComponent.WebDriverComponentFinder<AttributeGridRow, AttributeGridRowFinder>
    {
        private Locator _locator;
        private AttributesGrid _grid;

        private AttributeGridRowFinder(AttributesGrid grid)
        {
            super(grid.getDriver());
            _grid = grid;
        }

        public AttributeGridRowFinder withKey(String key)   // finds the row based on key column's 'title' attribute
        {
            _locator = Locator.tag("tbody").childTag("tr").withDescendant(
                    Locator.tagWithClass("div", "input-row").withAttribute("title", key));
            return this;
        }

        @Override
        protected AttributeGridRow construct(WebElement el, WebDriver driver)
        {
            return new AttributeGridRow(el, driver);
        }

        @Override
        protected Locator locator()
        {
            return _locator;
        }
    }
}