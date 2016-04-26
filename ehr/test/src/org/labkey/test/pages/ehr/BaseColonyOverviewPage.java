package org.labkey.test.pages.ehr;

import org.labkey.test.Locator;
import org.labkey.test.WebDriverWrapper;
import org.labkey.test.WebTestHelper;
import org.labkey.test.components.Component;
import org.labkey.test.components.ComponentElements;
import org.labkey.test.pages.LabKeyPage;
import org.labkey.test.selenium.LazyWebElement;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public abstract class BaseColonyOverviewPage extends LabKeyPage
{
    protected Elements _elements;

    public BaseColonyOverviewPage(WebDriver driver)
    {
        super(driver);
    }

    private Elements elements()
    {
        if (_elements == null)
            _elements = new Elements();
        return _elements;
    }

    protected void clickTab(String tab)
    {
        _ext4Helper.clickExt4Tab(tab);
    }

    protected WebElement getActiveTabPanel()
    {
        return Locator.tagWithClass("div", "x4-tabpanel-child").notHidden().findElement(getDriver());
    }

    protected abstract class OverviewTab extends Component
    {
        private final WebElement el;

        protected OverviewTab(WebElement el)
        {
            this.el = el;
        }

        @Override
        public final WebElement getComponentElement()
        {
            return el;
        }
    }

    protected class Elements extends ComponentElements
    {
        @Override
        protected SearchContext getContext()
        {
            return getDriver();
        }


    }
}