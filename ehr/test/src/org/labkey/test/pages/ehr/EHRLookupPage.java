package org.labkey.test.pages.ehr;



import org.labkey.test.Locator;
import org.labkey.test.WebDriverWrapper;
import org.labkey.test.components.ui.grids.QueryGrid;
import org.labkey.test.pages.LabKeyPage;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.StaleElementReferenceException;

public class EHRLookupPage extends LabKeyPage<EHRLookupPage.ElementCache>
{
    public EHRLookupPage(WebDriverWrapper driver)
    {
        super(driver);
    }
    public void waitForPage()
    {
        waitFor(() -> {
            try
            {
                return elementCache().queryGrid.isLoaded();
            }
            catch (NoSuchElementException | StaleElementReferenceException retry)
            {
                return false;
            }
        }, "the ehr look up page did not initialize", 10_000);
    }

    public QueryGrid getQueryGrid()
    {
        return elementCache().queryGrid;
    }

    @Override
    protected EHRLookupPage.ElementCache newElementCache()
    {
        return new EHRLookupPage.ElementCache();
    }

    protected class ElementCache extends LabKeyPage.ElementCache
    {
        public static final Locator pageTitle = Locator.tagWithText("h3", "EHR Lookups Page");
        QueryGrid queryGrid = new QueryGrid.QueryGridFinder(getDriver()).find();
    }
}
