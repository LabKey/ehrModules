/*
 * Copyright (c) 2013 LabKey Corporation
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
package org.labkey.test.tests;

import org.junit.experimental.categories.Category;
import org.labkey.test.TestTimeoutException;
import org.labkey.test.categories.EHR;
import org.labkey.test.categories.External;
import org.labkey.test.categories.ONPRC;
import org.labkey.test.util.SqlserverOnlyTest;

import java.io.File;

/**
 * User: bimber
 * Date: 1/25/13
 * Time: 4:31 PM
 */
@Category({External.class, EHR.class, ONPRC.class})
public class ONPRC_EHRTest extends AbstractEHRTest
{
    protected String PROJECT_NAME = "ONPRC_EHR_TestProject";

    @Override
    protected String getProjectName()
    {
        return PROJECT_NAME;
    }

    @Override
    public String getContainerPath()
    {
        return PROJECT_NAME;
    }

    @Override
    protected void goToEHRFolder()
    {
        clickProject(getProjectName());
    }

    public void runUITests() throws Exception
    {
        setupTest();

        // for now, this test will import the ONPRC reference study
        // and run query validation.  most test coverage is part of main EHR tests,
        // but this does provide some valuable additional coverage
    }

    public void setupTest() throws Exception
    {
        _containerHelper.createProject(PROJECT_NAME, "ONPRC EHR");

        setEHRModuleProperties();

        //note: we create the users prior to study import, b/c that user is used by TableCustomizers
        createUsersandPermissions();

        File path = new File(getLabKeyRoot());
        path = new File(path, "/server/customModules/onprc_ehr/resources/referenceStudy");
        setPipelineRoot(path.getPath());
        importStudy();

        defineQCStates();
    }

    protected void importStudy()
    {
        goToModule("Pipeline");
        waitAndClickButton("Process and Import Data");

        _extHelper.selectFileBrowserRoot();
        _extHelper.clickFileBrowserFileCheckbox("study.xml");

        if (isTextPresent("Reload Study"))
            selectImportDataAction("Reload Study");
        else
            selectImportDataAction("Import Study");

        waitForPipelineJobsToFinish(1);
    }

    @Override
    public void doCleanup(boolean afterTest) throws TestTimeoutException
    {
        super.doCleanup(afterTest);
    }
}
