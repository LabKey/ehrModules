/*
 * Copyright (c) 2017-2019 LabKey Corporation
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
import org.labkey.test.components.snd.AttributesGrid;
import org.labkey.test.components.snd.FilterSelect;
import org.labkey.test.components.snd.SuperPackageRow;
import org.labkey.test.pages.LabKeyPage;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.util.List;

import static org.junit.Assert.assertTrue;

public class EditPackagePage extends LabKeyPage<EditPackagePage.ElementCache>
{
    public EditPackagePage(WebDriver driver)
    {
        super(driver);
    }

    public static EditPackagePage beginAt(WebDriverWrapper driver)
    {
        return beginAt(driver, driver.getCurrentContainerPath());
    }

    public static EditPackagePage beginAt(WebDriverWrapper driver, String containerPath)
    {
        driver.beginAt(WebTestHelper.buildURL("controller", containerPath, "action"));
        return new EditPackagePage(driver.getDriver());
    }

    @Override
    protected void waitForPage()
    {
        waitFor(()-> {
            try{
                return elementCache().grid.getComponentElement().isDisplayed();
            } catch (NoSuchElementException retry){return false;}
        }, WAIT_FOR_JAVASCRIPT);
    }

    public PackageListPage clickBackToPackagesButton()
    {
        elementCache().backToPackagesBtn.click();

        return new PackageListPage(getDriver());
    }

    public EditPackagePage setDescription(String description)
    {
        setFormElement(elementCache().descriptionEdit, description);
        return this;
    }

    public String getDescription()
    {
        return elementCache().descriptionEdit.getAttribute("value");
    }

    public EditPackagePage setNarrative(String description)
    {
        setFormElement(elementCache().narrativeTextArea, description);
        elementCache().parseAttributesButton.click();
        return this;
    }

    public String getNarrative()
    {
        return elementCache().narrativeTextArea.getText();
    }

    public AttributesGrid getAttributesGrid()
    {
        return elementCache().grid;
    }

    public FilterSelect getCategoriesSelect()
    {
        return elementCache().categoryPicker;
    }

    public EditPackagePage filterAvailablePackage(String filter)
    {
        setFormElement(elementCache().packageSearchFilterInput, filter);

        // block until all rows in the searchContainer contain the filter expression
        waitFor(()-> !SuperPackageRow.finder(getDriver())
                .findAll(elementCache().querySearchContainer)
                .stream()
                .noneMatch((a)-> !a.getLabel().contains(filter))
                , 2000);

        return this;
    }

    public EditPackagePage setPrimitivesOnlyCheckBox(boolean set)
    {
        new Checkbox(elementCache().primitivesOnlyCheckBox).set(set);
        return this;
    }

    public List<SuperPackageRow> getAvailablePackages()
    {
        return SuperPackageRow.finder(getDriver()).timeout(4000)
                .findAll(elementCache().querySearchContainer);
    }

    public SuperPackageRow getAvailablePackage(String partialDescription)
    {
        return SuperPackageRow.finder(getDriver()).timeout(4000)
                .withPartialDescription(partialDescription).findWhenNeeded(elementCache().querySearchContainer);
    }

    public List<SuperPackageRow> getAssignedPackages()
    {
        return SuperPackageRow.finder(getDriver())
                .findAll(elementCache().assignedPackageContainer);
    }

    public SuperPackageRow getAssignedPackage(String partialDescription)
    {
        return SuperPackageRow.finder(getDriver()).timeout(4000)
                .withPartialDescription(partialDescription).find(elementCache().assignedPackageContainer);
    }

    public String getAssignedPackageText(String packageDescription)
    {
        getAssignedPackage(packageDescription).select();
        waitFor(()-> Locator.tagWithClass("div", "data-search__row")
                .findElementOrNull(elementCache().selectedPackageNarrativeViewPane) != null, 2000);

        return Locator.tagWithClass("div", "data-search__row")
                .findElement(elementCache().selectedPackageNarrativeViewPane).getText();
    }

    public PackageListPage clickSave()
    {
        scrollIntoView(elementCache().saveButton);
        waitFor(()-> elementCache().saveButton.getAttribute("disabled")==null,
                "'Save' button is disabled", 2000);
        elementCache().saveButton.click();
        PackageListPage plp = new PackageListPage(getDriver());
        plp.waitForPageLoad();
        return plp;
    }

    public PackageListPage clickCancel()
    {
        elementCache().cancelButton.click();
        return new PackageListPage(getDriver());
    }

    public PackageListPage clickSaveAsDraft()
    {
        waitFor(()-> elementCache().saveAsDraftButton.getAttribute("disabled")==null,
                "'Save as Draft' button is disabled", 2000);
        elementCache().saveAsDraftButton.click();
        PackageListPage plp = new PackageListPage(getDriver());
        plp.waitForPageLoad();
        return plp;
    }

    public PackageListPage clickSubmitForReview()
    {
        waitFor(()-> elementCache().submitForReveiwButton.getAttribute("disabled")==null,
                "'Submit for Review' button is disabled", 2000);
        elementCache().submitForReveiwButton.click();
        shortWait().until(ExpectedConditions.stalenessOf(elementCache().submitForReveiwButton));
        return new PackageListPage(getDriver());
    }

    @Override
    protected ElementCache newElementCache()
    {
        return new ElementCache();
    }

    protected class ElementCache extends LabKeyPage.ElementCache
    {
        WebElement appContainer = Locator.tagWithId("div", "app").findWhenNeeded(this);
        WebElement backToPackagesBtn = Locator.tagWithClass("i", "fa fa-arrow-circle-left").parent() // parent is <a href="#/packages"
                .withChild(Locator.tagWithText("h4", "Packages")).findWhenNeeded(getDriver());

        WebElement panelHeading = Locator.tagWithClass("div", "panel-heading").findWhenNeeded(appContainer);
        WebElement panelBody = Locator.tagWithClass("div", "panel-body").findWhenNeeded(appContainer);

        // container for description, narrative
        WebElement packageEditPanel = Locator.xpath("//div[@class='col-xs-8']")
                .withDescendant(Locator.tagWithClass("label", "control-label").withText("Package Id"))
                .findWhenNeeded(getDriver());
        WebElement descriptionEdit = Locator.tagWithClass("input", "form-control")
                .withAttribute("name", "description")
                .findWhenNeeded(packageEditPanel);
        WebElement narrativeTextArea = Locator.tagWithClass("textarea", "form-control")
                .findWhenNeeded(packageEditPanel);
        WebElement parseAttributesButton = Locator.tagWithClass("button", "btn btn-default")
                .withChild((Locator.tagWithClassContaining("i", "attributes__parse-button")))
                .refindWhenNeeded(getDriver());

        // container for narrative attributes grid
        WebElement packageAttributesPanel = Locator.tagWithClass("div", "row")
                .withDescendant(Locator.tagContainingText("strong", "Attributes"))
                .findWhenNeeded(panelBody);

        AttributesGrid grid = new AttributesGrid(
                Locator.tag("div")
                        .withChild(Locator.tagWithText("strong", "Attributes"))
                        .followingSibling("div").withDescendant(Locator.tag("table"))
                        .refindWhenNeeded(getDriver()).withTimeout(4000),
                getDriver());

        WebElement categoryEditPanel = Locator.xpath("//div[@class='col-xs-4']")
                .withDescendant(Locator.tagWithClass("label", "control-label").withText("Categories"))
                .findWhenNeeded(getDriver()).withTimeout(4000);
        FilterSelect categoryPicker = FilterSelect.finder(getDriver())
                .findWhenNeeded(categoryEditPanel);


        // TODO: Available Packages summary (add package)
        WebElement querySearchContainer = Locator.tagWithClass("div", "query-search--container")
                .withDescendant(Locator.tagWithClassContaining("span", "data-search__container"))
                .findWhenNeeded(getDriver()).withTimeout(4000);
        WebElement packageSearchFilterInput = Locator.input("packageSearch")
                .findWhenNeeded(querySearchContainer).withTimeout(4000);
        WebElement primitivesOnlyCheckBox = Locator.tagWithAttribute("input", "type", "checkbox")
                .findWhenNeeded(querySearchContainer).withTimeout(4000);
        // TODO: Assigned Packages summary  (remove package)
        WebElement assignedPackageContainer = Locator.tagWithClassContaining("div", "assigned_packages")
                .findWhenNeeded(getDriver()).withTimeout(4000);

        WebElement selectedPackageNarrativeViewPane = Locator.tagWithClassContaining("div", "assigned_package_narrative")
                .findWhenNeeded(getDriver()).withTimeout(4000);

        WebElement cancelButton = Locator.tagWithId("button", "cancelButton").findWhenNeeded(getDriver());
        WebElement saveButton = Locator.tagWithId("button", "save").findWhenNeeded(getDriver());
        WebElement saveAsDraftButton = Locator.tagWithId("button","saveAsDraft").findWhenNeeded(getDriver());
        WebElement submitForReveiwButton = Locator.tagWithId("button", "submitReview").findWhenNeeded(getDriver());
    }
}