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
        if (_projectName.equalsIgnoreCase("CNPRC"))
            _test.beginAt(_test.getCurrentContainerPath() + "/cnprc_ehr-ehrSettings.view?");
        else
            _test.beginAt(_test.getCurrentContainerPath() + "/tnprc_ehr-ehrSettings.view?");
        _test.clickButton("Load EHR table definitions", 0);
        _test.waitForElement(Locator.tagWithClass("span", "x4-window-header-text").withText("Success"));
        _test.assertExt4MsgBox("EHR tables updated successfully.", "OK");

        _test.clickButton("Load EHR_Lookup table definitions", 0);
        _test.waitForElement(Locator.tagWithClass("span", "x4-window-header-text").withText("Success"));
        _test.assertExt4MsgBox("EHR_Lookups tables updated successfully.", "OK");
    }
}
