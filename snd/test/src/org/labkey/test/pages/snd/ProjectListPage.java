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

package org.labkey.test.pages.snd;

import org.labkey.test.Locator;
import org.labkey.test.WebDriverWrapper;
import org.labkey.test.WebTestHelper;
import org.labkey.test.components.html.Checkbox;
import org.labkey.test.components.html.Input;
import org.labkey.test.components.snd.ProjectViewerResult;
import org.labkey.test.pages.LabKeyPage;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class ProjectListPage extends LabKeyPage<ProjectListPage.ElementCache>
{
    public ProjectListPage(WebDriver driver)
    {
        super(driver);
    }

    public static ProjectListPage beginAt(WebDriverWrapper driver)
    {
        return beginAt(driver, driver.getCurrentContainerPath());
    }

    public static ProjectListPage beginAt(WebDriverWrapper driver, String containerPath)
    {
        driver.beginAt(WebTestHelper.buildURL("snd", containerPath, "app") + "#/Projects");
        return new ProjectListPage(driver.getDriver());
    }

    public EditProjectPage clickNewProject()
    {
        elementCache().newProjectButton.click();

        return new EditProjectPage(getDriver());
    }

    public ProjectListPage showDrafts(boolean set)
    {
        Checkbox.Checkbox(elementCache().showDraftsLoc)
                .timeout(WAIT_FOR_JAVASCRIPT)
                .findWhenNeeded(elementCache().container)
                .set(set);

        if (set)
            waitForDraftsLoad();
        return this;
    }

    public ProjectListPage showNotActive(boolean set)
    {
        Checkbox.Checkbox(elementCache().showNotActiveLoc)
                .timeout(WAIT_FOR_JAVASCRIPT)
                .findWhenNeeded(elementCache().container)
                .set(set);

        if (set)
            waitForNotActiveLoad();

        return this;
    }

    public ProjectListPage setSearchFilter(String searchExpression)
    {
        elementCache().searchFilter.set(searchExpression);
        return this;
    }

    public void waitForPageLoad()
    {
        waitForElement(elementCache().activeTitle);
    }

    public void waitForDraftsLoad()
    {
        waitForElement(elementCache().draftsTitle);
    }

    public void waitForNotActiveLoad()
    {
        waitForElement(elementCache().notActiveTitle);
    }

    public void waitForDeleteSuccess()
    {
        waitForTextToDisappear("successfully removed");
    }

    public ProjectViewerResult getProject(String partialText)
    {
        return ProjectViewerResult.finder(getDriver()).containingText(partialText)
                .timeout(4000).findWhenNeeded(elementCache().container);
    }

    public boolean isProjectPresent(String partialDescription)
    {
        return null != ProjectViewerResult.finder(getDriver()).containingText(partialDescription)
                .timeout(4000).findOrNull(elementCache().container);
    }

    @Override
    protected ElementCache newElementCache()
    {
        return new ElementCache();
    }

    protected class ElementCache extends LabKeyPage.ElementCache
    {

        WebElement container = Locator.tagWithClass("div", "query-search--container")
                .refindWhenNeeded(this).withTimeout(WAIT_FOR_JAVASCRIPT);
        WebElement searchHeader = Locator.tagWithClass("div", "project-viewer__header")
                .refindWhenNeeded(container);
        WebElement newProjectButton = Locator.button("New Project").findWhenNeeded(searchHeader)
                .withTimeout(WAIT_FOR_JAVASCRIPT);
        Locator showDraftsLoc = Locator.tagWithClassContaining("div", "projects-show_drafts")
                .withText("Show Drafts")
                .child("input");
        Locator showNotActiveLoc = Locator.tagWithClassContaining("div", "projects-show_not_active")
                .withText("Show Not Active")
                .child("input");
        Locator activeTitle = Locator.tagWithClassContaining("div", "project_viewer__results--active")
                .child("h4")
                .withText("Active");
        Locator draftsTitle = Locator.tagWithClassContaining("div", "project_viewer__results--drafts")
                .child("h4")
                .withText("Drafts");
        Locator notActiveTitle = Locator.tagWithClassContaining("div", "project_viewer__results--drafts")
                .child("h4")
                .withText("Not Active");
        Input searchFilter = Input.Input(Locator.input("projectSearch"), getDriver())
                .timeout(WAIT_FOR_JAVASCRIPT)
                .findWhenNeeded(container);
    }
}