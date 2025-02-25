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
package org.labkey.test.pages.snd;

import org.labkey.test.Locator;
import org.labkey.test.WebDriverWrapper;
import org.labkey.test.WebTestHelper;
import org.labkey.test.components.html.BootstrapMenu;
import org.labkey.test.components.html.Checkbox;
import org.labkey.test.components.html.Input;
import org.labkey.test.components.snd.PackageViewerResult;
import org.labkey.test.pages.LabKeyPage;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class PackageListPage extends LabKeyPage<PackageListPage.ElementCache>
{
    public PackageListPage(WebDriver driver)
    {
        super(driver);
    }

    public static PackageListPage beginAt(WebDriverWrapper driver)
    {
        return beginAt(driver, driver.getCurrentContainerPath());
    }

    public static PackageListPage beginAt(WebDriverWrapper driver, String containerPath)
    {
        driver.beginAt(WebTestHelper.buildURL("snd", containerPath, "app") + "#/packages");
        PackageListPage plp = new PackageListPage(driver.getDriver());
        plp.waitForPageLoad();
        return plp;
    }

    public void waitForPageLoad()
    {
        waitForElement(elementCache().activeTitle);
    }

    public EditPackagePage clickNewPackage()
    {
        elementCache().newPackageButton.click();

        return new EditPackagePage(getDriver());
    }

    public PackageListPage showDrafts(boolean set)
    {
        Checkbox.Checkbox(elementCache().showDraftsLoc)
                .timeout(WAIT_FOR_JAVASCRIPT)
                .findWhenNeeded(elementCache().container)
                .set(set);
        return this;
    }

    public EditCategoriesPage clickEditCategories()
    {
        Locator.id("package-actions").waitForElement(elementCache().container, 4000).click();
        Locator listItem = Locator.xpath("//ul/li/a[text()='Edit Categories']");
        waitForElement(listItem).click();
        return new EditCategoriesPage(getDriver());
    }

    public PackageListPage setSearchFilter(String searchExpression)
    {
        elementCache().searchFilter.set(searchExpression);
        return this;
    }

    public PackageViewerResult getPackage(String partialText)
    {
        return PackageViewerResult.finder(getDriver()).containingText(partialText)
                .timeout(4000).findWhenNeeded(elementCache().container);
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
        WebElement searchHeader = Locator.tagWithClass("div", "package-viewer__header")
                .refindWhenNeeded(container);
        WebElement newPackageButton = Locator.button("New Package").findWhenNeeded(searchHeader)
                .withTimeout(WAIT_FOR_JAVASCRIPT);
        Locator showDraftsLoc = Locator.tagWithClassContaining("div", "packages-show_drafts")
                .withText("Show drafts")
                .descendant("input");
        Input searchFilter = Input.Input(Locator.input("packageSearch"), getDriver())
                .timeout(WAIT_FOR_JAVASCRIPT)
                .findWhenNeeded(container);
        Locator activeTitle = Locator.tagWithClassContaining("div", "package_viewer__results--active")
                .child("h4")
                .withText("Active");
    }
}