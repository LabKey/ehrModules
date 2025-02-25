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
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import static org.labkey.test.BaseWebDriverTest.WAIT_FOR_JAVASCRIPT;

public class SuperPackageRow extends WebDriverComponent<SuperPackageRow.ElementCache>
{
    final WebElement _el;
    final WebDriver _driver;

    public SuperPackageRow(WebElement element, WebDriver driver)
    {
        _el = element;
        _driver = driver;
    }

    static public SuperPackageRowFinder finder(WebDriver driver)
    {
        return new SuperPackageRowFinder(driver);
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

    public boolean isSelected()
    {
        return getComponentElement().getAttribute("class").contains("superpackage-selected-row");
    }

    public SuperPackageRow select() // note: this 'selection' behavior is expressed among assigned packages, not among available packages
    {
        if (!isSelected())
            newElementCache().desc.click();
        getWrapper().waitFor(()-> isSelected(),
                "row item never became selected",2000);
        return this;
    }

    public String getLabel()
    {
        return newElementCache().desc.getText();
    }

    public SuperPackageRow clickMenuItem(String menuText)
    {
       getWrapper().fireEvent(newElementCache().menuToggle, WebDriverWrapper.SeleniumEvent.mouseover);
       newElementCache().menuToggle.click();
       // wait for the menu to expand
       getWrapper().waitFor(()-> newElementCache().menuToggle.getAttribute("class").contains("open"), 1000);
       Locator menuItem = Locator.tagWithAttribute("li", "role", "presentation")
               .child(Locator.tagWithAttribute("a", "role", "menuitem")
                       .containing(menuText));
       WebElement itemToClick = menuItem.waitForElement(getComponentElement(), 2000);
       getWrapper().fireEvent(newElementCache().menuToggle, WebDriverWrapper.SeleniumEvent.mouseover);
       getWrapper().waitFor(()-> itemToClick.isEnabled(), 2000);
       itemToClick.click();
       // wait for the menu to collapse (or disappear, if 'remove' was the action')
       getWrapper().waitFor(()-> {
           try
           {
               return newElementCache().menuToggle.getAttribute("aria-expanded").equals("false");
           }catch (StaleElementReferenceException sere){return true;}
           }, 1000);
       return this;
    }

    @Override
    protected ElementCache newElementCache()
    {
        return new ElementCache();
    }

    protected class ElementCache extends Component.ElementCache
    {
        public WebElement menuToggle = Locator.tagWithClassContaining("div", "btn-group") // sometimes dropdown, dropup
                        .child(Locator.id("superpackage-actions"))
                        .findWhenNeeded(getComponentElement()).withTimeout(WAIT_FOR_JAVASCRIPT);

        public WebElement menuList = Locator.tagWithAttribute("ul", "role", "menu")
                .findWhenNeeded(getComponentElement()).withTimeout(1000);


        public  WebElement desc = Locators.desc.findWhenNeeded(getComponentElement()).withTimeout(4000);
    }

    public static class Locators
    {
        public static Locator.XPathLocator desc = Locator.tagWithClass("div", "pull-left");
        public static Locator.XPathLocator body = Locator.tagWithClassContaining("div", "superpackage-row")
                .withChild(desc);
    }

    public static class SuperPackageRowFinder extends WebDriverComponent.WebDriverComponentFinder<SuperPackageRow, SuperPackageRowFinder>
    {
        private Locator _locator;

        private SuperPackageRowFinder(WebDriver driver)
        {
            super(driver);
            _locator = Locators.body;
        }

        public SuperPackageRowFinder withDescription(String description)
        {
            _locator = Locators.body.withChild(Locators.desc.withText(description));
            return this;
        }

        public SuperPackageRowFinder withPartialDescription(String partialDescription)
        {
            _locator = Locators.body.withChild(Locators.desc.containing(partialDescription));
            return this;
        }

        @Override
        protected SuperPackageRow construct(WebElement el, WebDriver driver)
        {
            return new SuperPackageRow(el, driver);
        }

        @Override
        protected Locator locator()
        {
            return _locator;
        }
    }
}