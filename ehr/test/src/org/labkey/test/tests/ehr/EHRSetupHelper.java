/*
 * Copyright (c) 2018-2019 LabKey Corporation
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
package org.labkey.test.tests.ehr;

import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;

public class EHRSetupHelper
{
    private BaseWebDriverTest _test;
    private String _projectName;
    private String _folderName;
    private String _modulePath;
    private String _containerPath;

    public EHRSetupHelper(BaseWebDriverTest test, String projectName, String folderName, String modulePath, String containerPath)
    {
        this(test, projectName);
        _folderName = folderName;
        _modulePath = modulePath;
        _containerPath = containerPath;
    }

    public EHRSetupHelper(BaseWebDriverTest test, String projectName)
    {
        _test = test;
        _projectName = projectName;
    }

    public void loadEHRTableDefinitions()
    {
        _test.goToProjectHome();
        if (_folderName != null && _projectName == "TNPRC")
            _test.clickFolder(_folderName);
        else
            _test.clickFolder(_projectName);

        _test.beginAt(_test.getCurrentContainerPath() + "/tnprc_ehr-ehrSettings.view?");
        _test.clickButton("Load EHR table definitions", 0);
        _test.waitForElement(Locator.tagWithClass("span", "x4-window-header-text").withText("Success"));
        _test.assertExt4MsgBox("EHR tables updated successfully.", "OK");

        _test.clickButton("Load EHR_Lookup table definitions", 0);
        _test.waitForElement(Locator.tagWithClass("span", "x4-window-header-text").withText("Success"));
        _test.assertExt4MsgBox("EHR_Lookups tables updated successfully.", "OK");
    }
}
