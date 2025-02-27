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
import org.labkey.test.pages.snd.EditPackagePage;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class PackageViewerResult extends WebDriverComponent<PackageViewerResult.ElementCache>
{
    final WebElement _el;
    final WebDriver _driver;

    public PackageViewerResult(WebElement element, WebDriver driver)
    {
        _el = element;
        _driver = driver;
    }

    public static PackageViewerResultFinder finder(WebDriver driver)
    {
        return new PackageViewerResultFinder(driver);
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

    public EditPackagePage clickEdit()
    {
        elementCache().editLink.click();
        return new EditPackagePage(getDriver());
    }

    public EditPackagePage clickView()
    {
        elementCache().viewLink.click();
        return new EditPackagePage(getDriver());
    }

    public EditPackagePage clickClone()
    {
        elementCache().cloneLink.click();
        return new EditPackagePage(getDriver());
    }

    @Override
    protected ElementCache newElementCache()
    {
        return new ElementCache();
    }

    protected class ElementCache extends Component.ElementCache
    {
        WebElement viewLink = Locator.tagWithClassContaining("a", "package-row_icon")
                .withChild(Locator.tagWithClass("i", "fa fa-eye"))
                .findWhenNeeded(getComponentElement());
        WebElement editLink = Locator.tagWithClassContaining("a", "package-row_icon")
                .withChild(Locator.tagWithClass("i", "fa fa-pencil"))
                .findWhenNeeded(getComponentElement());
        WebElement cloneLink = Locator.tagWithClassContaining("a", "package-row_icon")
                .withChild(Locator.tagWithClass("i", "fa fa-files-o"))
                .findWhenNeeded(getComponentElement());
    }

    public static class PackageViewerResultFinder extends WebDriverComponent.WebDriverComponentFinder<PackageViewerResult, PackageViewerResultFinder>
    {
        private Locator _locator;

        private PackageViewerResultFinder(WebDriver driver)
        {
            super(driver);
            _locator = Locator.tagWithClassContaining("div", "package_viewer__result");
        }

        public PackageViewerResultFinder containingText(String partialText)
        {
            _locator = Locator.tagWithClassContaining("div", "package-row").withDescendant(
                    Locator.tagContainingText("div", partialText));
            return this;
        }
        public PackageViewerResultFinder withText(String fullText)
        {
            _locator = Locator.tagWithClassContaining("div", "package-row").withDescendant(
                    Locator.tagWithText("div", fullText));
            return this;
        }

        @Override
        protected PackageViewerResult construct(WebElement el, WebDriver driver)
        {
            return new PackageViewerResult(el, driver);
        }

        @Override
        protected Locator locator()
        {
            return _locator;
        }
    }
}