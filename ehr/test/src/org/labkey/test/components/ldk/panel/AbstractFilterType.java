/*
 * Copyright (c) 2016-2017 LabKey Corporation
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
package org.labkey.test.components.ldk.panel;

import org.labkey.test.Locator;
import org.labkey.test.components.WebDriverComponent;
import org.labkey.test.components.ext4.RadioButton;
import org.labkey.test.components.ext4.Window;
import org.labkey.test.pages.ehr.AnimalHistoryPage;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import static org.labkey.test.components.ext4.RadioButton.RadioButton;

public abstract class AbstractFilterType<A extends AnimalHistoryPage> extends WebDriverComponent
{
    public static final String FILTER_SIGNAL = "filterTypeUpdate";

    private final A _page;
    private WebElement _el;

    protected AbstractFilterType(A page)
    {
        _page = page;
    }

    @Override
    protected WebDriver getDriver()
    {
        return _page.getDriver();
    }

    public A getPage()
    {
        return _page;
    }

    @Override
    public WebElement getComponentElement()
    {
        if (_el == null)
            _el = Locator.tag("div").attributeStartsWith("id", getIdPrefix()).waitForElement(_page.getDriver(), 10000);
        return _el;
    }

    protected abstract String getRadioName();

    protected abstract String getIdPrefix();

    public <F> F select()
    {
        final RadioButton radioButton = RadioButton().locatedBy(Locator.name(getRadioName())).find(getDriver());
        if (!radioButton.isChecked())
        {
            getWrapper().doAndWaitForPageSignal(radioButton::check, FILTER_SIGNAL);
        }
        _el = null;
        return (F) this;
    }

    public A refreshReport()
    {
        return (A) _page.refreshReport();
    }

    public Window refreshReportError()
    {
        return _page.refreshReportError();
    }
}
