package org.labkey.test.components.ehr.panel;

import org.labkey.test.components.ext4.widgets.SearchPanel;
import org.openqa.selenium.WebDriver;

public class AnimalSearchPanel extends SearchPanel
{
    public AnimalSearchPanel(WebDriver driver)
    {
        this(DEFAULT_TITLE, driver);
    }

    public AnimalSearchPanel(String title, WebDriver driver)
    {
        super(title, "ehr-animalsearchpanel-", driver);
    }
}
