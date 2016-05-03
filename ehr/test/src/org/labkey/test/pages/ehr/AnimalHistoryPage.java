/*
 * Copyright (c) 2015-2016 LabKey Corporation
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
package org.labkey.test.pages.ehr;

import org.labkey.test.WebDriverWrapper;
import org.labkey.test.WebTestHelper;
import org.labkey.test.util.DataRegionTable;
import org.labkey.test.util.Ext4Helper;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.WebDriverWait;


public class AnimalHistoryPage extends ParticipantViewPage
{
    public AnimalHistoryPage(WebDriver driver)
    {
        super(driver);
    }

    public static AnimalHistoryPage beginAt(WebDriverWrapper test)
    {
        return beginAt(test, test.getCurrentContainerPath());
    }

    public static AnimalHistoryPage beginAt(WebDriverWrapper test, String containerPath)
    {
        test.beginAt(WebTestHelper.buildURL("ehr", containerPath, "animalHistory"));
        return new AnimalHistoryPage(test.getDriver());
    }

    public void refreshReport()
    {
        doAndWaitForPageSignal(
                () -> doAndWaitForPageSignal(
                        () -> waitAndClick(Ext4Helper.Locators.ext4Button("Refresh")),
                        REPORT_TAB_SIGNAL, new WebDriverWait(getDriver(), 60)),
                DataRegionTable.UPDATE_SIGNAL, new WebDriverWait(getDriver(), 60));
    }
}