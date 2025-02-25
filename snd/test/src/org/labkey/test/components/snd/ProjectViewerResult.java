/*
 * Copyright (c) 2018 LabKey Corporation
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
import org.labkey.test.pages.snd.EditProjectPage;
import org.labkey.test.pages.snd.ProjectListPage;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;


public class ProjectViewerResult extends WebDriverComponent<ProjectViewerResult.ElementCache>
{
    final WebElement _el;
    final WebDriver _driver;

    public ProjectViewerResult(WebElement element, WebDriver driver)
    {
        _el = element;
        _driver = driver;
    }

    public static ProjectViewerResultFinder finder(WebDriver driver)
    {
        return new ProjectViewerResultFinder(driver);
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

    public EditProjectPage clickEdit()
    {
        elementCache().editLink.click();
        return new EditProjectPage(getDriver());
    }

    public EditProjectPage clickView()
    {
        elementCache().viewLink.click();
        return new EditProjectPage(getDriver());
    }

    public EditProjectPage clickRevise()
    {
        elementCache().reviseLink.click();
        return new EditProjectPage(getDriver());
    }

    public ProjectListPage clickDelete()
    {
        elementCache().deleteLink.click();
        ProjectListPage page = new ProjectListPage(getDriver());
        return page;
    }

    @Override
    protected ElementCache newElementCache()
    {
        return new ElementCache();
    }

    protected class ElementCache extends Component.ElementCache
    {
        WebElement viewLink = Locator.tagWithClassContaining("a", "project-row_icon")
                .withChild(Locator.tagWithClass("i", "fa fa-eye"))
                .findWhenNeeded(getComponentElement());
        WebElement editLink = Locator.tagWithClassContaining("a", "project-row_icon")
                .withChild(Locator.tagWithClass("i", "fa fa-pencil"))
                .findWhenNeeded(getComponentElement());
        WebElement reviseLink = Locator.tagWithClassContaining("a", "project-row_icon")
                .withChild(Locator.tagWithClass("i", "fa fa-files-o"))
                .findWhenNeeded(getComponentElement());
        WebElement deleteLink = Locator.tagWithClass("i", "fa fa-times")
                .findWhenNeeded(getComponentElement());
    }

    public static class ProjectViewerResultFinder extends WebDriverComponent.WebDriverComponentFinder<ProjectViewerResult, ProjectViewerResultFinder>
    {
        private Locator _locator;

        private ProjectViewerResultFinder(WebDriver driver)
        {
            super(driver);
            _locator = Locator.tagWithClassContaining("div", "project_viewer__result");
        }

        public ProjectViewerResultFinder containingText(String partialText)
        {
            _locator = Locator.tagWithClassContaining("div", "project-row").withDescendant(
                    Locator.tagContainingText("div", partialText));
            return this;
        }
        public ProjectViewerResultFinder withText(String fullText)
        {
            _locator = Locator.tagWithClassContaining("div", "project-row").withDescendant(
                    Locator.tagWithText("div", fullText));
            return this;
        }

        @Override
        protected ProjectViewerResult construct(WebElement el, WebDriver driver)
        {
            return new ProjectViewerResult(el, driver);
        }

        @Override
        protected Locator locator()
        {
            return _locator;
        }
    }
}