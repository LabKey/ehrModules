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
import org.labkey.test.WebDriverWrapper;
import org.labkey.test.components.Component;
import org.labkey.test.components.WebDriverComponent;
import org.labkey.test.components.html.Input;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.labkey.test.components.html.Input.Input;

public class FilterSelect extends WebDriverComponent<FilterSelect.ElementCache>
{
    final WebElement _el;
    final WebDriver _driver;

    public FilterSelect(WebElement element, WebDriver driver)
    {
        _el = element;
        _driver = driver;
    }

    static public FilterSelectFinder finder(WebDriver driver)
    {
        return new FilterSelectFinder(driver);
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

    public boolean isOpen()
    {
        String caretClass = elementCache().toggle.getAttribute("class");
        return caretClass.contains("fa-caret-down"); // if it's closed, it will be fa-caret-right
    }

    public FilterSelect open()
    {
        if (!isOpen())
            elementCache().toggle.click();
        getWrapper().waitFor(()-> isOpen(), 1000);
        return this;
    }

    public FilterSelect close()
    {
        if (isOpen())
            elementCache().toggle.click();
        getWrapper().waitFor(()-> !isOpen(), 1000);
        return this;
    }

    public FilterSelect setFilter(String value)
    {
        elementCache().input.set(value);
        getWrapper().waitFor(()-> elementCache().options()
                        .stream()
                        .allMatch((a)-> a.getText().contains(value))
                , 2000);
        return this;
    }

    public FilterSelect selectItem(String itemText)
    {
        open();
        WebElement item = elementCache().option(itemText);
        getWrapper().scrollIntoView(item);
        getWrapper().fireEvent(item, WebDriverWrapper.SeleniumEvent.mouseover);
        if (Locator.tagWithClass("i", "fa fa-check").findElementOrNull(item) == null)
            item.click();
        return this;
    }

    public FilterSelect deselectItem(String itemText)
    {
        WebElement item = elementCache().option(itemText);
        getWrapper().scrollIntoView(item);
        if (Locator.tagWithClass("i", "fa fa-check").findElementOrNull(item) != null)
            item.click();
        return this;
    }

    public List<String> getSelections()
    {
        close();
        WebElement selectionsContainer = Locator.tagWithClass("div", "data-search__row_selected")
                .childTag("div")
                .findElementOrNull(getComponentElement());
        if (null==selectionsContainer)
            return new ArrayList<>();

        return Arrays.asList(selectionsContainer.getText().split(","));
    }

    @Override
    protected ElementCache newElementCache()
    {
        return new ElementCache();
    }

    protected class ElementCache extends Component.ElementCache
    {
        Input input = Input(Locator.tagWithName("input", "query-search-input"), getDriver())
                .findWhenNeeded(this);
        WebElement toggle = Locator.tagWithClassContaining("i", "searchinput-caret")
                .findWhenNeeded(this);

        WebElement option(String text)
        {
            return Locator.tagWithClassContaining("button", "list-group-item")
                    .withChild(Locator.tagContainingText("div", text))
                    .findElement(getComponentElement());
        }
        List<WebElement> options()
        {
            return Locator.tagWithClassContaining("button", "list-group-item").findElements(getComponentElement());
        }
    }

    public static class FilterSelectFinder extends WebDriverComponent.WebDriverComponentFinder<FilterSelect, FilterSelectFinder>
    {
        private Locator _locator;

        private FilterSelectFinder(WebDriver driver)
        {
            super(driver);
            _locator = Locator.tagWithClass("div", "query-search--container");
        }

        public FilterSelectFinder withName(String name)   // finds the row based on key column's 'title' attribute
        {
            _locator = Locator.tagWithClass("div", "query-search--container").withDescendant(
                    Locator.tagWithName("input", name));
            return this;
        }

        @Override
        protected FilterSelect construct(WebElement el, WebDriver driver)
        {
            return new FilterSelect(el, driver);
        }

        @Override
        protected Locator locator()
        {
            return _locator;
        }
    }
}