package org.labkey.test.tests;

import org.jetbrains.annotations.Nullable;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.remoteapi.Connection;
import org.labkey.test.Locator;
import org.labkey.test.TestFileUtils;
import org.labkey.test.WebTestHelper;
import org.labkey.test.categories.EHR;
import org.labkey.test.tests.ehr.AbstractGenericEHRTest;
import org.labkey.test.util.PostgresOnlyTest;

import java.io.File;

@Category({EHR.class})
public class EHR_AppTest extends AbstractGenericEHRTest implements PostgresOnlyTest
{
    private static final String PROJECT_NAME = "EHR App";
    private static final String FOLDER_NAME = "EHR";
    private final EHRAppTestSetupHelper _setupHelper = new EHRAppTestSetupHelper(this, getProjectName(), FOLDER_NAME, getModulePath(), getContainerPath());

    @Override
    protected String getProjectName()
    {
        return PROJECT_NAME;
    }

    @Override
    public void importStudy()
    {
        File path = new File(TestFileUtils.getLabKeyRoot(), getModulePath() + "/resources/referenceStudy");
        importFolderByPath(path, getContainerPath(), 1);
        path = TestFileUtils.getSampleData("EHR_App/study");
        importFolderByPath(path, getContainerPath(), 2);
    }

    @Override
    protected void populateInitialData() throws Exception
    {
        _setupHelper.populateInitialData(this);
    }

    @Override
    protected void populateRoomRecords() throws Exception
    {
        _setupHelper.populateRoomRecords();
    }

    public void importFolderByPath(File path, String containerPath, int finishedJobsExpected)
    {
        setPipelineRoot(path.getPath(), false);

        beginAt(WebTestHelper.getBaseURL() + "/pipeline-status/" + containerPath + "/begin.view");
        clickButton("Process and Import Data", defaultWaitForPage);
        _fileBrowserHelper.expandFileBrowserRootNode();
        _fileBrowserHelper.checkFileBrowserFileCheckbox("folder.xml");
        _fileBrowserHelper.selectImportDataAction("Import Folder");

        Locator cb = Locator.checkboxByName("validateQueries");
        waitForElement(cb);
        uncheckCheckbox(cb);
        clickButton("Start Import");

        waitForPipelineJobsToComplete(finishedJobsExpected, "Folder import", false, MAX_WAIT_SECONDS * 2500);
    }

    @Override
    protected File getStudyPolicyXML()
    {
        return TestFileUtils.getSampleData("EHR_AppEHRStudyPolicy.xml");
    }

    @BeforeClass
    public static void setupProject() throws Exception
    {
        EHR_AppTest init = (EHR_AppTest) getCurrentTest();
        init.doSetup();
    }

    private void doSetup() throws Exception
    {
        initProject("EHR App");
        goToEHRFolder();
    }

    @Override
    public BrowserType bestBrowser()
    {
        return BrowserType.CHROME;
    }

    @Override
    protected String getModuleDirectory()
    {
        return "ehrModules/EHR_App";
    }

    @Override
    public String getModulePath()
    {
        return "/server/modules/" + getModuleDirectory();
    }

    @Override
    protected String getAnimalHistoryPath()
    {
        return null;
    }

    @Override
    protected boolean doSetUserPasswords()
    {
        return true;
    }

    @Before
    public void preTest()
    {
        goToEHRFolder();
    }

    @Test
    public void testSteps()
    {
        goToEHRFolder();
    }


}
