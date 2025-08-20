/*
 * Copyright (c) 2017 LabKey Corporation
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
import org.labkey.test.components.bootstrap.ModalDialog;
import org.labkey.test.components.snd.CategoryEditRow;
import org.labkey.test.pages.LabKeyPage;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

import java.util.List;

public class EditCategoriesPage extends LabKeyPage<EditCategoriesPage.ElementCache>
{
    public EditCategoriesPage(WebDriver driver)
    {
        super(driver);
    }

    public static EditCategoriesPage beginAt(WebDriverWrapper driver)
    {
        return beginAt(driver, driver.getCurrentContainerPath());
    }

    public static EditCategoriesPage beginAt(WebDriverWrapper driver, String containerPath)
    {
        driver.beginAt(WebTestHelper.buildURL("snd", containerPath, "categories"));
        return new EditCategoriesPage(driver.getDriver());
    }

    public EditCategoriesPage addCategory(String category, boolean active)
    {
        elementCache().addCategoriesBtn.click();
        CategoryEditRow newCategory = CategoryEditRow.finder(getDriver()).withEmptyDescription().find();
        newCategory
                .setDescription(category)
                .setActive(active);
        return this;
    }

    public CategoryEditRow getCategory(String category)
    {
        return CategoryEditRow.finder(getDriver()).withDescription(category).timeout(3000).findOrNull();
    }

    public EditCategoriesPage deleteCategory(String category)
    {
        CategoryEditRow toDelete = CategoryEditRow.finder(getDriver())
                .withDescription(category).timeout(4000).find();
        toDelete.delete();
        return this;
    }

    public List<CategoryEditRow> getAllCategories()
    {
        return CategoryEditRow.finder(getDriver()).findAll();
    }

    public EditCategoriesPage clickSave()
    {
        return clickSave(false);
    }

    public EditCategoriesPage clickSaveAndConfirmDelete()
    {
        return clickSave(true);
    }

    public EditCategoriesPage clickSave(boolean confirmDelete)
    {
        shortWait().until(ExpectedConditions.elementToBeClickable(elementCache().saveButton)).click();
        if (confirmDelete)
        {
            new ModalDialog.ModalDialogFinder(getDriver())
                .withBodyTextContaining("Are you sure you want to delete row").find()
                .dismiss("Submit Changes");
        }
        shortWait().until(ExpectedConditions.stalenessOf(elementCache().saveButton));
        clearCache();
        return new EditCategoriesPage(getDriver());
    }

    public PackageListPage clickCancel()
    {
        shortWait().until(ExpectedConditions.elementToBeClickable(elementCache().cancelButton)).click();
        shortWait().until(ExpectedConditions.stalenessOf(elementCache().cancelButton));
        return new PackageListPage(getDriver());
    }

    @Override
    protected ElementCache newElementCache()
    {
        return new ElementCache();
    }

    protected class ElementCache extends LabKeyPage.ElementCache
    {
        // TODO: Add other elements that are on the page
        WebElement addCategoriesBtn = Locator.tag("div").containing("Add Category")
                .withChild(Locator.tagWithClass("i", "fa-plus-circle"))
                .findWhenNeeded(getDriver()).withTimeout(4000);
        WebElement cancelButton = Locator.button("Cancel").findWhenNeeded(getDriver()).withTimeout(4000);
        WebElement saveButton = Locator.button("Save").findWhenNeeded(getDriver()).withTimeout(4000);
    }
}