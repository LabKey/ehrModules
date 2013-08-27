/*
 * Copyright (c) 2012-2013 LabKey Corporation
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

import org.junit.Assert;
import org.labkey.remoteapi.Connection;
import org.labkey.remoteapi.query.DeleteRowsCommand;
import org.labkey.remoteapi.query.InsertRowsCommand;
import org.labkey.remoteapi.query.SaveRowsResponse;
import org.labkey.test.BaseWebDriverTest;
import org.labkey.test.Locator;
import org.labkey.test.ModulePropertyValue;
import org.labkey.test.TestTimeoutException;
import org.labkey.test.tests.SimpleApiTestWD;
import org.labkey.test.util.AdvancedSqlTest;
import org.labkey.test.util.EHRTestHelper;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.PasswordUtil;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;

import java.io.File;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * User: bimber
 * Date: 11/27/12
 * Time: 2:22 PM
 */
abstract public class AbstractEHRTest extends SimpleApiTestWD implements AdvancedSqlTest
{
    protected String PROJECT_NAME = "EHR_TestProject";
    protected String FOLDER_NAME = "EHR";
    protected String CONTAINER_PATH = getProjectName() + "/" + FOLDER_NAME;
    protected String STUDY_ZIP = "/sampledata/study/EHR Study Anon.zip";
    protected static final String STUDY_ZIP_NO_DATA = "/sampledata/study/EHR Study Anon Small.zip";

    protected static final String PROJECT_ID = "640991"; // project with one participant
    protected static final String DUMMY_PROTOCOL = "dummyprotocol"; // need a protocol to create table entry
    protected static final String PROJECT_MEMBER_ID = "test2312318"; // PROJECT_ID's single participant
    protected static final String ROOM_ID = "6824778"; // room of PROJECT_MEMBER_ID
    protected static final String CAGE_ID = "4434662"; // cage of PROJECT_MEMBER_ID
    protected static final String ROOM_ID2 = "2043365";

    protected static final String AREA_ID = "A1/AB190"; // arbitrary area
    protected static final String PROTOCOL_PROJECT_ID = "795644"; // Project with exactly 3 members
    protected static final String PROTOCOL_ID = "protocol101";
    protected static final String[] PROTOCOL_MEMBER_IDS = {"test3997535", "test4551032", "test5904521"}; //{"test2008446", "test3804589", "test4551032", "test5904521", "test6390238"}; // Protocol members, sorted ASC alphabetically
    protected static final String[] MORE_ANIMAL_IDS = {"test1020148","test1099252","test1112911","test727088","test4564246"}; // Some more, distinct, Ids
    protected static final String DEAD_ANIMAL_ID = "test9118022";
    protected static final String TASK_TITLE = "Test weight task";
    protected static final String MPR_TASK_TITLE = "Test MPR task";

    protected static EHRUser DATA_ADMIN = new EHRUser("admin@ehrstudy.test", "EHR Administrators", EHRRole.DATA_ADMIN);
    protected static EHRUser REQUESTER = new EHRUser("requester@ehrstudy.test", "EHR Requestors", EHRRole.REQUESTER);
    protected static EHRUser BASIC_SUBMITTER = new EHRUser("basicsubmitter@ehrstudy.test", "EHR Basic Submitters", EHRRole.BASIC_SUBMITTER);
    protected static EHRUser FULL_SUBMITTER = new EHRUser("fullsubmitter@ehrstudy.test", "EHR Full Submitters", EHRRole.FULL_SUBMITTER);
    protected static EHRUser REQUEST_ADMIN = new EHRUser("request_admin@ehrstudy.test", "EHR Request Admins", EHRRole.REQUEST_ADMIN);
    protected static EHRUser FULL_UPDATER = new EHRUser("full_updater@ehrstudy.test", "EHR Full Updaters", EHRRole.FULL_UPDATER);

    protected static final DateFormat DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd");

    //xpath fragment
    public static final String VISIBLE = "not(ancestor-or-self::*[contains(@style,'visibility: hidden') or contains(@class, 'x-hide-display')])";

    protected EHRTestHelper _helper = new EHRTestHelper(this);

    @Override
    public String getAssociatedModuleDirectory()
    {
        return "server/customModules/ehr";
    }

    @Override
    protected String getProjectName()
    {
        return PROJECT_NAME;
    }

    public String getContainerPath()
    {
        return CONTAINER_PATH;
    }

    @Override
    public boolean enableLinkCheck()
    {
        if ( super.enableLinkCheck() )
            log("EHR test has too many hard coded links and special actions to crawl effectively. Skipping crawl.");
        return false;
    }

    @Override
    public void validateQueries(boolean validateSubfolders)
    {
        //NOTE: the queries are also validated as part of study import
        //also, validation takes place on the project root, while the EHR and required datasets are loaded into a subfolder
        log("Skipping query validation.");
    }

    @Override
    protected Pattern[] getIgnoredElements()
    {
        return new Pattern[] {
                Pattern.compile("qcstate", Pattern.CASE_INSENSITIVE),//qcstate IDs aren't predictable
                Pattern.compile("stacktrace", Pattern.CASE_INSENSITIVE)
        };
    }

    @Override
    protected File[] getTestFiles()
    {
        return new File[0];
    }

    @Override
    public void doCleanup(boolean afterTest) throws TestTimeoutException
    {
        long startTime = System.currentTimeMillis();
        deleteProject(getProjectName(), afterTest);
        if(isTextPresent(getProjectName()))
        {
            log("Wait extra long for folder to finish deleting.");
            while (isElementPresent(Locator.linkWithText(getProjectName())) && System.currentTimeMillis() - startTime < 300000) // 5 minutes max.
            {
                sleep(5000);
                refresh();
            }
            if (!isElementPresent(Locator.linkWithText(getProjectName())))
                log("Test Project deleted in " + (System.currentTimeMillis() - startTime) + "ms");
            else
                Assert.fail("Test Project not finished deleting after 5 minutes");
        }

        deleteUsers(afterTest,
                DATA_ADMIN.getEmail(),
                REQUESTER.getEmail(),
                BASIC_SUBMITTER.getEmail(),
                REQUEST_ADMIN.getEmail(),
                FULL_UPDATER.getEmail(),
                FULL_SUBMITTER.getEmail());

        try{deleteRecords();}catch(Throwable ignored){}
    }

    @LogMethod
    protected void initProject() throws Exception
    {
        _containerHelper.createProject(getProjectName(), null);
        createSubfolder(getProjectName(), getProjectName(), FOLDER_NAME, "EHR", null);

        setEHRModuleProperties();
        createUsersandPermissions();  //note: we create the users prior to study import, b/c that user is used by TableCustomizers

        beginAt(getBaseURL()+"/ehr/"+getContainerPath()+"/populateInitialData.view");
        clickButton("Delete All", 0);
        waitForElement(Locator.xpath("//div[text() = 'Delete Complete']"), 200000);
        clickButton("Populate All", 0);
        waitForElement(Locator.xpath("//div[text() = 'Populate Complete']"), 200000);

        //these tables do not have a container field, so are not deleted when the test project is deleted
        clickButton("Delete Data From SNOMED", 0);
        waitForElement(Locator.xpath("//div[text() = 'Delete Complete']"), 200000);
        clickButton("Populate SNOMED Table", 0);
        waitForElement(Locator.xpath("//div[text() = 'Populate Complete']"), 200000);

        goToModule("Study");
        importStudyFromZip(new File(getLabKeyRoot(), STUDY_ZIP));
        try
        {
            deleteRecords();
            populateRecords();
        }
        catch (Throwable e)
        {
            //ignore for now
            log("There was an error");
        }

        log("Remove all webparts");
        goToEHRFolder();
        addWebPart("Quick Search");

        //note: this expects the study to already have been imported
        setupStudyPermissions();
        defineQCStates();
    }

    protected void setEHRModuleProperties()
    {
        //set dummy values first, to test the admin UI
        ModulePropertyValue dummyValue = new ModulePropertyValue("EHR", "/" +  getProjectName(), "EHRStudyContainer", "/fakeContainer");
        setModuleProperties(Arrays.asList(dummyValue));

        ModulePropertyValue prop = new ModulePropertyValue("EHR", "/" + getProjectName(), "EHRStudyContainer", "/" + getContainerPath());
        ModulePropertyValue prop2 = new ModulePropertyValue("EHR", "/" + getProjectName(), "EHRAdminUser", DATA_ADMIN._email);
        ModulePropertyValue prop3 = new ModulePropertyValue("EHR", "/" + getProjectName(), "DefaultAnimalHistoryReport", "abstract");
        setModuleProperties(Arrays.asList(prop, prop2, prop3));
    }

    @LogMethod
    protected void populateRecords() throws Exception
    {
        log("Inserting initial records into EHR hard tables");

        Connection cn = new Connection(getBaseURL(), PasswordUtil.getUsername(), PasswordUtil.getPassword());

        //first ehr.protocol
        InsertRowsCommand insertCmd = new InsertRowsCommand("ehr", "protocol");
        Map<String,Object> rowMap = new HashMap<>();
        rowMap.put("protocol", PROTOCOL_ID);
        insertCmd.addRow(rowMap);
        rowMap = new HashMap<>();
        rowMap.put("protocol", DUMMY_PROTOCOL);
        insertCmd.addRow(rowMap);
        SaveRowsResponse saveResp = insertCmd.execute(cn, getContainerPath());

        //then ehr.project
        insertCmd = new InsertRowsCommand("ehr", "project");
        rowMap = new HashMap<>();
        rowMap.put("project", PROTOCOL_PROJECT_ID);
        rowMap.put("protocol", PROTOCOL_ID);
        insertCmd.addRow(rowMap);
        rowMap = new HashMap<>();
        rowMap.put("project", PROJECT_ID);
        rowMap.put("protocol", DUMMY_PROTOCOL);
        insertCmd.addRow(rowMap);
        saveResp = insertCmd.execute(cn, getContainerPath());

        //then ehr_lookups.rooms
        insertCmd = new InsertRowsCommand("ehr_lookups", "rooms");
        rowMap = new HashMap<>();
        rowMap.put("room", ROOM_ID);
        insertCmd.addRow(rowMap);
        rowMap = new HashMap<>();
        rowMap.put("room", ROOM_ID2);
        insertCmd.addRow(rowMap);
        saveResp = insertCmd.execute(cn, getContainerPath());
    }

    @LogMethod
    protected void deleteRecords() throws Exception
    {
        log("Deleting initial records from EHR hard tables");

        Connection cn = new Connection(getBaseURL(), PasswordUtil.getUsername(), PasswordUtil.getPassword());

        //first ehr.protocol
        DeleteRowsCommand deleteCmd = new DeleteRowsCommand("ehr", "protocol");
        Map<String,Object> rowMap = new HashMap<>();
        rowMap.put("protocol", PROTOCOL_ID);
        deleteCmd.addRow(rowMap);
        rowMap = new HashMap<>();
        rowMap.put("protocol", DUMMY_PROTOCOL);
        deleteCmd.addRow(rowMap);
        SaveRowsResponse deleteResp = deleteCmd.execute(cn, getContainerPath());

        //then ehr.project
        deleteCmd = new DeleteRowsCommand("ehr", "project");
        rowMap = new HashMap<>();
        rowMap.put("project", PROTOCOL_PROJECT_ID);
        rowMap.put("protocol", PROTOCOL_ID);
        deleteCmd.addRow(rowMap);
        rowMap = new HashMap<>();
        rowMap.put("project", PROJECT_ID);
        rowMap.put("protocol", DUMMY_PROTOCOL);
        deleteCmd.addRow(rowMap);
        deleteResp = deleteCmd.execute(cn, getContainerPath());

        //then ehr_lookups.room
        deleteCmd = new DeleteRowsCommand("ehr_lookups", "rooms");
        rowMap = new HashMap<>();
        rowMap.put("room", ROOM_ID);
        deleteCmd.addRow(rowMap);
        rowMap = new HashMap<>();
        rowMap.put("room", ROOM_ID2);
        deleteCmd.addRow(rowMap);
        deleteResp = deleteCmd.execute(cn, getContainerPath());
    }

    protected void assertNoErrorText()
    {
        String[] texts = new String[]{"error", "Error", "ERROR", "failed", "Failed", "Invalid", "invalid"};
        String visibleText = findVisibleText(texts);
        Assert.assertTrue("Error text found: " + visibleText, visibleText == null);
    }

    /**
     * Checks if any text is visible on the page
     * @param texts Exact, case-sensitive strings to check for
     * @return The first string among texts if any are found; null if none are found
     */
    public String findVisibleText(String... texts)
    {
        if(texts==null || texts.length == 0)
            return null;

        String source = getBodyText();

        for (String text : texts)
        {
            text = text.replace("&", "&amp;");
            text = text.replace("<", "&lt;");
            text = text.replace(">", "&gt;");
            if (source.contains(text))
                return text;
        }
        return null;
    }

    @LogMethod
    protected void defineQCStates()
    {
        log("Define QC states for EHR study");

        beginAt("/ehr/" + getContainerPath() + "/ensureQCStates.view");
        clickButton("OK");

        goToEHRFolder();
        goToManageStudy();
        clickAndWait(Locator.linkWithText("Manage Dataset QC States"));

        selectOptionByValue(Locator.name("showPrivateDataByDefault"), "true");
        clickButton("Done");
    }

    @LogMethod
    protected void createUsersandPermissions() throws Exception
    {
        enableEmailRecorder();

        DATA_ADMIN.setUserId(_helper.createUserAPI(DATA_ADMIN.getEmail(), getProjectName()));
        REQUESTER.setUserId(_helper.createUserAPI(REQUESTER.getEmail(), getProjectName()));
        BASIC_SUBMITTER.setUserId(_helper.createUserAPI(BASIC_SUBMITTER.getEmail(), getProjectName()));
        FULL_SUBMITTER.setUserId(_helper.createUserAPI(FULL_SUBMITTER.getEmail(), getProjectName()));
        FULL_UPDATER.setUserId(_helper.createUserAPI(FULL_UPDATER.getEmail(), getProjectName()));
        REQUEST_ADMIN.setUserId(_helper.createUserAPI(REQUEST_ADMIN.getEmail(), getProjectName()));

        _helper.createPermissionsGroupAPI(DATA_ADMIN.getGroup(), getProjectName(), DATA_ADMIN.getUserId());
        _helper.createPermissionsGroupAPI(REQUESTER.getGroup(), getProjectName(), REQUESTER.getUserId());
        _helper.createPermissionsGroupAPI(BASIC_SUBMITTER.getGroup(), getProjectName(), BASIC_SUBMITTER.getUserId());
        _helper.createPermissionsGroupAPI(FULL_SUBMITTER.getGroup(), getProjectName(), FULL_SUBMITTER.getUserId());
        _helper.createPermissionsGroupAPI(FULL_UPDATER.getGroup(), getProjectName(), FULL_UPDATER.getUserId());
        _helper.createPermissionsGroupAPI(REQUEST_ADMIN.getGroup(), getProjectName(), REQUEST_ADMIN.getUserId());

        goToEHRFolder();

        enterPermissionsUI();
        if (!getContainerPath().equals(getProjectName()))
            uncheckInheritedPermissions();

        setPermissions(DATA_ADMIN.getGroup(), "Editor");
        setPermissions(DATA_ADMIN.getGroup(), "EHR Data Entry");
        setPermissions(REQUESTER.getGroup(), "Editor");
        setPermissions(REQUESTER.getGroup(), "EHR Data Entry");
        setPermissions(BASIC_SUBMITTER.getGroup(), "Editor");
        setPermissions(BASIC_SUBMITTER.getGroup(), "EHR Data Entry");
        setPermissions(FULL_SUBMITTER.getGroup(), "Editor");
        setPermissions(FULL_SUBMITTER.getGroup(), "EHR Data Entry");
        setPermissions(FULL_UPDATER.getGroup(), "Editor");
        setPermissions(FULL_UPDATER.getGroup(), "EHR Data Entry");
        setPermissions(REQUEST_ADMIN.getGroup(), "Editor");
        setPermissions(REQUEST_ADMIN.getGroup(), "EHR Data Entry");
        savePermissions();
    }

    protected void goToEHRFolder()
    {
        clickProject(getProjectName());
        clickFolder(FOLDER_NAME);
    }

    protected void setupStudyPermissions() throws Exception
    {
        enterPermissionsUI();
        _ext4Helper.clickTabContainingText("Study Security");
        waitAndClickButton("Study Security");

        checkRadioButton(getAnimalHistoryRadioButtonLocator(DATA_ADMIN.getGroup(), "READOWN"));
        checkRadioButton(getAnimalHistoryRadioButtonLocator(REQUESTER.getGroup(), "READOWN"));
        checkRadioButton(getAnimalHistoryRadioButtonLocator(BASIC_SUBMITTER.getGroup(), "READOWN"));
        checkRadioButton(getAnimalHistoryRadioButtonLocator(FULL_SUBMITTER.getGroup(), "READOWN"));
        checkRadioButton(getAnimalHistoryRadioButtonLocator(FULL_UPDATER.getGroup(), "READOWN"));
        checkRadioButton(getAnimalHistoryRadioButtonLocator(REQUEST_ADMIN.getGroup(), "READOWN"));
        clickAndWait(Locator.id("groupUpdateButton"));

        //"set all to..." combo-boxes don't work through _selenium.
        log("Set per-dataset permissions individually");
        setPDP(DATA_ADMIN);
        setPDP(BASIC_SUBMITTER);
        setPDP(FULL_SUBMITTER);
        setPDP(FULL_UPDATER);
        setPDP(REQUESTER);
        setPDP(REQUEST_ADMIN);

        waitFor(new BaseWebDriverTest.Checker()
        {
            public boolean check()
            {
                return "EHR Data Admin".equals(getSelectedOptionText(Locator.name("dataset.1061", 0))) &&
                        "EHR Basic Submitter".equals(getSelectedOptionText(Locator.name("dataset.1061", 1))) &&
                        "EHR Full Submitter".equals(getSelectedOptionText(Locator.name("dataset.1061", 2))) &&
                        "EHR Full Updater".equals(getSelectedOptionText(Locator.name("dataset.1061", 3))) &&
                        "EHR Request Admin".equals(getSelectedOptionText(Locator.name("dataset.1061", 4))) &&
                        "EHR Requestor".equals(getSelectedOptionText(Locator.name("dataset.1061", 5)));
            }
        }, "Per-dataset permission not set", WAIT_FOR_JAVASCRIPT);

        clickButton("Save");
    }

    @LogMethod
    public void setEhrUserPasswords()
    {
        setInitialPassword(DATA_ADMIN.getEmail(), PasswordUtil.getPassword());
        setInitialPassword(REQUESTER.getEmail(), PasswordUtil.getPassword());
        setInitialPassword(BASIC_SUBMITTER.getEmail(), PasswordUtil.getPassword());
        setInitialPassword(FULL_SUBMITTER.getEmail(), PasswordUtil.getPassword());
        setInitialPassword(FULL_UPDATER.getEmail(), PasswordUtil.getPassword());
        setInitialPassword(REQUEST_ADMIN.getEmail(), PasswordUtil.getPassword());
    }

    public void setPDP(EHRUser user)
    {
        int col = getElementCount(Locator.xpath("//table[@id='datasetSecurityFormTable']//th[.='" + user.getGroup() + "']/preceding-sibling::*"));

        //see if we can use the top toggle
        Select el = new Select(getDriver().findElement(By.xpath("//table[@id='datasetSecurityFormTable']/tbody/tr[" + 2 + "]/td[" + col + "]//select")));
        el.selectByValue(user.getRole().toString());
        sleep(250);

//        int rowCt = getTableRowCount("datasetSecurityFormTable");
//        for (int i = 3; i <= rowCt; i++) // xpath indexing is 1 based
//        {
//            selectOptionByText(Locator.xpath("//table[@id='datasetSecurityFormTable']/tbody/tr[" + i + "]/td[" + col + "]//select"), user.getRole().toString());
//        }
    }

    public Locator getAnimalHistoryRadioButtonLocator(String groupName, String setting)
    {
        //not sure why the radios are in TH elements, but they are...
        return Locator.xpath("//form[@id='groupUpdateForm']/table/tbody/tr/td[text()='"
                + groupName + "']/../th/input[@value='" + setting + "']");
    }

    public static class EHRUser
    {
        private final String _email;
        private final String _groupName;
        private final EHRRole _role;
        private Integer _userId = null;


        public EHRUser(String email, String groupName, EHRRole role)
        {
            _email = email;
            _groupName = groupName;
            _role = role;
        }

        public String getEmail()
        {
            return _email;
        }

        public Integer getUserId()
        {
            return _userId;
        }

        public void setUserId(Integer userId)
        {
            _userId = userId;
        }

        public String getGroup()
        {
            return _groupName;
        }

        public EHRRole getRole()
        {
            return _role;
        }
    }

    public static class Permission
    {
        EHRRole role;
        EHRQCState qcState;
        String action;
        public Permission(EHRRole role, EHRQCState qcState, String action)
        {
            this.role = role;
            this.qcState = qcState;
            this.action = action;
        }

        @Override
        public boolean equals(Object other)
        {
            return other.getClass().equals(Permission.class) &&
                    this.role == ((Permission)other).role &&
                    this.qcState == ((Permission)other).qcState &&
                    this.action.equals(((Permission)other).action);
        }
    }

    public static enum EHRRole
    {
        DATA_ADMIN ("EHR Data Admin"),
        REQUESTER ("EHR Requestor"),
        BASIC_SUBMITTER ("EHR Basic Submitter"),
        FULL_SUBMITTER ("EHR Full Submitter"),
        FULL_UPDATER ("EHR Full Updater"),
        REQUEST_ADMIN ("EHR Request Admin");
        private final String name;
        private EHRRole (String name)
        {this.name = name;}
        public String toString()
        {return name;}
    }

    public static enum EHRQCState
    {
        ABNORMAL("Abnormal", "Value is abnormal", true, false, false),
        COMPLETED("Completed", "Data has been approved for public release", true, false, false),
        DELETE_REQUESTED("Delete Requested", "Records are requested to be deleted", true, true, false),
        IN_PROGRESS("In Progress", "Draft Record, not public", false, true, false),
        REQUEST_APPROVED("Request: Approved", "Request has been approved", true, true, true),
        //REQUEST_COMPLETE("Request: Complete", "Request has been completed", true, false, true),
        REQUEST_DENIED("Request: Denied", "Request has been denied", true, false, true),
        REQUEST_PENDING("Request: Pending", "Part of a request that has not been approved", false, false, true),
        REQUEST_SAMPLE_DELIVERED("Request: Sample Delivered", "Request where the sample is delivered", false, false, true),
        REVIEW_REQUIRED("Review Required", "Review is required prior to public release", false, false, false),
        SCHEDULED("Scheduled", "Record is scheduled, but not performed", true, true, false);

        public final String label;
        public final String description;
        public final boolean publicData;

        public final boolean draftData;
        public final boolean isRequest;

        EHRQCState(String label, String description, boolean publicData, boolean draftData, boolean isRequest)
        {
            this.label = label;
            this.description = description;
            this.publicData = publicData;
            this.draftData = draftData;
            this.isRequest = isRequest;
        }
    }
}
