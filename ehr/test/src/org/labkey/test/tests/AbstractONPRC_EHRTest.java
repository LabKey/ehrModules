/*
 * Copyright (c) 2014 LabKey Corporation
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

import org.apache.commons.lang3.StringUtils;
import org.labkey.test.Locator;
import org.labkey.test.TestFileUtils;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.PasswordUtil;
import org.labkey.test.util.ext4cmp.Ext4CmpRef;
import org.labkey.test.util.ext4cmp.Ext4FieldRef;

import java.io.File;
import java.util.Arrays;
import java.util.Collection;

/**

 */
public class AbstractONPRC_EHRTest extends AbstractEHRTest
{
    protected static final String REFERENCE_STUDY_PATH = "/server/customModules/onprc_ehr/resources/referenceStudy";
    protected static final String GENETICS_PIPELINE_LOG_PATH = REFERENCE_STUDY_PATH + "/kinship/EHR Kinship Calculation/kinship.txt.log";
    protected static final String ID_PREFIX = "_testid";

    @Override
    protected void createProjectAndFolders()
    {
        _containerHelper.createProject(getProjectName(), "ONPRC EHR");
    }

    @Override
    protected void goToEHRFolder()
    {
        goToProjectHome();
    }

    @Override
    @LogMethod
    protected void initProject() throws Exception
    {
        super.initProject();

        //this applies the standard property descriptors, creates indexes, etc.
        // NOTE: this currently will log an error from DataSetDefinition whenever we create a new column.  This really isnt a bug, so ignore
        checkLeaksAndErrors();
        beginAt(getBaseURL() + "/ehr/" + getContainerPath() + "/ensureDatasetProperties.view");
        waitAndClickAndWait(Locator.lkButton("OK"));
        resetErrors();

        cacheIds(Arrays.asList(MORE_ANIMAL_IDS));
    }

    protected void cacheIds(Collection<String> ids)
    {
        beginAt(getBaseURL() + "/ehr/" + getContainerPath() + "/getDemographics.view?ids=" + StringUtils.join(ids, "&ids="));
        waitForText("\"" + ids.iterator().next() + "\" : {");

        goToProjectHome();
    }

    protected void setupNotificationService()
    {
        //set general settings
        beginAt(getBaseURL() + "/ldk/" + getContainerPath() + "/notificationAdmin.view");
        _helper.waitForCmp("field[fieldLabel='Notification User']");
        Ext4FieldRef.getForLabel(this, "Notification User").setValue(PasswordUtil.getUsername());
        Ext4FieldRef.getForLabel(this, "Reply Email").setValue("fakeEmail@fakeDomain.com");
        Ext4CmpRef btn = _ext4Helper.queryOne("button[text='Save']", Ext4CmpRef.class);
        btn.waitForEnabled();
        waitAndClick(Ext4Helper.Locators.ext4Button("Save"));
        waitForElement(Ext4Helper.ext4Window("Success"));
        waitAndClickAndWait(Ext4Helper.Locators.ext4Button("OK"));
    }

    @Override
    protected void populateInitialData()
    {
        beginAt(getBaseURL() + "/onprc_ehr/" + getContainerPath() + "/populateData.view");

        clickButton("Delete Data From Lookup Sets", 0);
        waitForElement(Locator.tagContainingText("div", "Delete Complete"), 200000);
        clickButton("Populate Lookup Sets", 0);
        waitForElement(Locator.tagContainingText("div", "Populate Complete"), 200000);
        sleep(2000);

        clickButton("Delete Data From Procedures", 0);
        waitForElement(Locator.tagContainingText("div", "Delete Complete"), 200000);
        clickButton("Populate Procedures", 0);
        waitForElement(Locator.tagContainingText("div", "Populate Complete"), 200000);
        sleep(2000);

        clickButton("Delete All", 0);
        waitForElement(Locator.tagContainingText("div", "Delete Complete"), 200000);
        clickButton("Populate All", 0);
        waitForElement(Locator.tagContainingText("div", "Populate Complete"), 200000);

        //NOTE: this is excluded from populate all since it changes rarely
        clickButton("Delete Data From SNOMED Codes", 0);
        waitForElement(Locator.tagContainingText("div", "Delete Complete"), 200000);
        clickButton("Populate SNOMED Codes", 0);
        waitForElement(Locator.tagContainingText("div", "Populate Complete"), 200000);

        //also populate templates
        beginAt(getBaseURL() + "/onprc_ehr/" + getContainerPath() + "/populateTemplates.view");

        clickButton("Delete Data From Form Templates", 0);
        waitForElement(Locator.tagContainingText("div", "Delete Complete"), 200000);
        clickButton("Populate Form Templates", 0);
        waitForElement(Locator.tagContainingText("div", "Populate Complete"), 200000);

        clickButton("Delete Data From Formulary", 0);
        waitForElement(Locator.tagContainingText("div", "Delete Complete"), 200000);
        clickButton("Populate Formulary", 0);
        waitForElement(Locator.tagContainingText("div", "Populate Complete"), 200000);
    }

    @Override
    protected void doStudyImport()
    {
        File path = new File(TestFileUtils.getLabKeyRoot(), REFERENCE_STUDY_PATH);
        setPipelineRoot(path.getPath());

        goToModule("Pipeline");
        clickButton("Process and Import Data", defaultWaitForPage);

        _fileBrowserHelper.expandFileBrowserRootNode();
        _fileBrowserHelper.checkFileBrowserFileCheckbox("study.xml");

        if (isTextPresent("Reload Study"))
            _fileBrowserHelper.selectImportDataAction("Reload Study");
        else
            _fileBrowserHelper.selectImportDataAction("Import Study");

        if (skipStudyImportQueryValidation())
        {
            Locator cb = Locator.checkboxByName("validateQueries");
            waitForElement(cb);
            uncheckCheckbox(cb);
        }

        clickButton("Start Import"); // Validate queries page
        waitForPipelineJobsToComplete(1, "Study import", false, MAX_WAIT_SECONDS * 2500); //onprc_billing test has a lot of queries
    }

    @Override
    protected String getStudyPolicyXML()
    {
        return "/sampledata/study/onprcEHRStudyPolicy.xml";
    }
}
