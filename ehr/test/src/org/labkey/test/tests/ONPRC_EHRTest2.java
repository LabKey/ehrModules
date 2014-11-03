package org.labkey.test.tests;

import org.apache.commons.lang3.StringUtils;
import org.json.JSONObject;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.remoteapi.query.Filter;
import org.labkey.remoteapi.query.InsertRowsCommand;
import org.labkey.remoteapi.query.SelectRowsCommand;
import org.labkey.remoteapi.query.SelectRowsResponse;
import org.labkey.test.Locator;
import org.labkey.test.TestTimeoutException;
import org.labkey.test.categories.EHR;
import org.labkey.test.categories.External;
import org.labkey.test.categories.ONPRC;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.Maps;
import org.labkey.test.util.PasswordUtil;
import org.labkey.test.util.RReportHelper;
import org.labkey.test.util.ext4cmp.Ext4CmpRef;
import org.labkey.test.util.ext4cmp.Ext4ComboRef;
import org.labkey.test.util.ext4cmp.Ext4FieldRef;
import org.labkey.test.util.ext4cmp.Ext4GridRef;
import org.testng.Assert;

import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;

@Category({External.class, EHR.class, ONPRC.class})
public class ONPRC_EHRTest2 extends AbstractONPRC_EHRTest
{
    private String PROJECT_NAME = "ONPRC_EHR_TestProject2";

    public ONPRC_EHRTest2()
    {

    }

    @Override
    protected String getProjectName()
    {
        return PROJECT_NAME;
    }

    @BeforeClass
    @LogMethod
    public static void doSetup() throws Exception
    {
        ONPRC_EHRTest2 initTest = new ONPRC_EHRTest2();
        initTest.doCleanup(false);

        initTest.initProject();
        initTest.createTestSubjects();
    }

//    @Override
//    public void doCleanup(boolean afterTest) throws TestTimeoutException
//    {
//
//    }

    @Override
    protected boolean doSetUserPasswords()
    {
        return true;
    }

    @Test
    public void flagsApiTest() throws Exception
    {
        //NOTE: auto-closing of active flags is also covered by assignment test, which updates condition

        //test housing condition
        final String flag1 = ensureFlagExists("Condition", "Cond1", "201");
        final String flag2 = ensureFlagExists("Condition", "Cond2", "202");

        getApiHelper().deleteAllRecords("study", "flags", new Filter("Id", SUBJECTS[0]));

        final Date date = new Date();
        InsertRowsCommand insertRowsCommand = new InsertRowsCommand("study", "flags");
        insertRowsCommand.addRow(new HashMap<String, Object>(){
            {
                put("Id", SUBJECTS[0]);
                put("date", prepareDate(date, -10, 0));
                put("flag", flag1);
            }
        });
        insertRowsCommand.execute(getApiHelper().getConnection(), getContainerPath());

        //expect success
        InsertRowsCommand insertRowsCommand2 = new InsertRowsCommand("study", "flags");
        insertRowsCommand2.addRow(new HashMap<String, Object>(){
            {
                put("Id", SUBJECTS[0]);
                put("date", prepareDate(date, -9, 0));
                put("flag", flag2);
            }
        });
        insertRowsCommand2.execute(getApiHelper().getConnection(), getContainerPath());

        //ensure single active flag
        SelectRowsCommand select1 = new SelectRowsCommand("study", "flags");
        select1.addFilter(new Filter("Id", SUBJECTS[0]));
        select1.addFilter(new Filter("flag", flag1));
        SelectRowsResponse resp1 = select1.execute(getApiHelper().getConnection(), getContainerPath());
        Assert.assertEquals(1, resp1.getRowCount().intValue());
        Assert.assertNotNull(resp1.getRows().get(0).get("enddate"));

        //expect failure
        getApiHelper().testValidationMessage(PasswordUtil.getUsername(), "study", "flags", new String[]{"Id", "date", "flag", "objectid", "_recordId"}, new Object[][]{
                {SUBJECTS[0], prepareDate(date, -5, 0), flag1, generateGUID(), "recordID"}
        }, Maps.of(
                "flag", Arrays.asList(
                    "ERROR: Cannot change condition to a lower code.  Animal is already: 202"
                )
        ));

        //test message is there is an overlapping matching flag
        getApiHelper().testValidationMessage(PasswordUtil.getUsername(), "study", "flags", new String[]{"Id", "date", "flag", "objectid", "_recordId"}, new Object[][]{
                {SUBJECTS[0], prepareDate(date, -5, 0), flag2, generateGUID(), "recordID"}
        }, Maps.of(
                "flag", Arrays.asList(
                        "INFO: There are already 1 active flag(s) of the same type spanning this date."
                )
        ), Maps.<String, Object>of("targetQC", null, "errorThreshold", "INFO"));
    }

    @Test
    public void arrivalFormTest() throws Exception
    {
        _helper.goToTaskForm("Arrival", "Submit Final", false);

        waitForElement(Ext4Helper.Locators.ext4Button("Submit Final"), WAIT_FOR_PAGE * 2);
        _ext4Helper.queryOne("button[text='Submit Final']", Ext4CmpRef.class).waitForEnabled();

        log("deleting existing records");
        getApiHelper().deleteAllRecords("study", "arrival", new Filter("Id", "2000;2001;2002;2003", Filter.Operator.IN));
        getApiHelper().deleteAllRecords("study", "birth", new Filter("Id", "2000;2001;2002;2003", Filter.Operator.IN));
        getApiHelper().deleteAllRecords("study", "demographics", new Filter("Id", "2000;2001;2002;2003", Filter.Operator.IN));

        log("testing add series window");
        Ext4GridRef grid = _helper.getExt4GridForFormSection("Arrivals");
        grid.clickTbarButton("Add Series of IDs");
        waitForElement(Ext4Helper.ext4Window("Enter Series of IDs"));
        Ext4FieldRef.getForLabel(this, "Starting Number").setValue("2000");
        Ext4FieldRef.getForLabel(this, "Total IDs").setValue("3");
        waitAndClick(Ext4Helper.ext4WindowButton("Enter Series of IDs", "Submit"));
        grid.waitForRowCount(3);
        Assert.assertEquals("2000", grid.getFieldValue(1, "Id"));
        Assert.assertEquals("2001", grid.getFieldValue(2, "Id"));
        Assert.assertEquals("2002", grid.getFieldValue(3, "Id"));
        grid.clickTbarButton("Select All");
        grid.waitForSelected(3);

        grid.clickTbarButton("More Actions");
        _ext4Helper.clickExt4MenuItem("Bulk Edit");
        waitForElement(Ext4Helper.ext4Window("Bulk Edit"));

        String source = "Boston";
        _helper.toggleBulkEditField("Source");

        _ext4Helper.queryOne("window field[fieldLabel=Source]", Ext4ComboRef.class).setComboByDisplayValue(source);

        String gender = "female";
        _helper.toggleBulkEditField("Gender");
        _ext4Helper.queryOne("window field[fieldLabel=Gender]", Ext4ComboRef.class).setComboByDisplayValue(gender);

        String species = "Rhesus";
        _helper.toggleBulkEditField("Species");
        _ext4Helper.queryOne("window field[fieldLabel=Species]", Ext4ComboRef.class).setComboByDisplayValue(species);

        String geographic_origin = INDIAN;
        _helper.toggleBulkEditField("Geographic Origin");
        _ext4Helper.queryOne("window field[fieldLabel='Geographic Origin']", Ext4ComboRef.class).setValue(geographic_origin);

        String birth = _df.format(new Date());
        _helper.toggleBulkEditField("Birth");
        _ext4Helper.queryOne("window field[fieldLabel=Birth]", Ext4ComboRef.class).setValue(birth);

        _helper.toggleBulkEditField("Room");
        _ext4Helper.queryOne("window field[fieldLabel=Room]", Ext4ComboRef.class).setValue(ROOMS[0]);

        waitAndClick(Ext4Helper.ext4Window("Bulk Edit").append(Ext4Helper.Locators.ext4Button("Submit")));
        waitForElement(Ext4Helper.ext4Window("Set Values"));
        waitAndClick(Ext4Helper.ext4Window("Set Values").append(Ext4Helper.Locators.ext4Button("Yes")));
        waitForElementToDisappear(Ext4Helper.ext4Window("Bulk Edit"));

        for (int i = 1;i<=3;i++)
        {
            Assert.assertEquals("bos", grid.getFieldValue(i, "source"));
            Assert.assertEquals("f", grid.getFieldValue(i, "gender"));
            Assert.assertEquals(species, grid.getFieldValue(i, "species"));
            Assert.assertEquals(geographic_origin, grid.getFieldValue(i, "geographic_origin"));
            Assert.assertEquals(ROOMS[0], grid.getFieldValue(i, "initialRoom"));
        }

        _ext4Helper.queryOne("button[text='Submit Final']", Ext4CmpRef.class).waitForEnabled();

        waitAndClick(_helper.getDataEntryButton("Submit Final"));
        waitForElement(Ext4Helper.ext4Window("Finalize Form"));
        waitAndClickAndWait(Ext4Helper.ext4Window("Finalize Form").append(Ext4Helper.Locators.ext4Button("Yes")));

        waitForElement(Locator.tagWithText("span", "Enter Data"));

        _helper.goToTaskForm("Arrival");

        grid = _helper.getExt4GridForFormSection("Arrivals");
        grid.clickTbarButton("Add");
        grid.waitForRowCount(1);
        final Ext4FieldRef field = grid.getActiveEditor(1, "Id");
        field.clickTrigger();
        waitFor(new Checker()
        {
            @Override
            public boolean check()
            {
                return field.getValue() != null && field.getValue().toString().equals("2003");
            }
        }, "Expected ID not set", WAIT_FOR_JAVASCRIPT);
        grid.completeEdit();

        _helper.discardForm();
    }

    @Test
    public void pairingObservationsTest()
    {
        _helper.goToTaskForm("Pairing Observations");

        //test whether pairid properly assigned, including when room/cage changed
        Ext4GridRef grid = _helper.getExt4GridForFormSection("Pairing Observations");
        _helper.addRecordToGrid(grid);
        grid.setGridCell(1, "Id", SUBJECTS[0]);
        grid.setGridCell(1, "lowestcage", "A1");
        grid.setGridCell(1, "room", ROOMS[0]);
        grid.setGridCell(1, "cage", "A1");

        _helper.addRecordToGrid(grid);
        grid.setGridCell(2, "Id", SUBJECTS[1]);
        grid.setGridCell(2, "lowestcage", "A1");
        grid.setGridCell(2, "room", ROOMS[0]);
        grid.setGridCell(2, "cage", "A1");

        Assert.assertEquals(grid.getFieldValue(1, "pairid"), grid.getFieldValue(2, "pairid"));

        //should update pairId
        grid.setGridCell(2, "room", ROOMS[2]);
        sleep(100);
        Assert.assertNotEquals(grid.getFieldValue(1, "pairid"), grid.getFieldValue(2, "pairid"));

        _helper.addRecordToGrid(grid);
        grid.setGridCell(3, "Id", SUBJECTS[2]);
        grid.setGridCell(3, "lowestcage", "A2");
        grid.setGridCell(3, "room", ROOMS[0]);
        grid.setGridCell(3, "cage", "A2");
        sleep(100);
        Assert.assertNotEquals(grid.getFieldValue(1, "pairid"), grid.getFieldValue(3, "pairid"));

        grid.setGridCell(3, "lowestcage", "A1");
        sleep(100);
        Assert.assertEquals(grid.getFieldValue(1, "pairid"), grid.getFieldValue(3, "pairid"));

        _helper.discardForm();
    }

    @Test
    public void managementTreatmentsTest() throws Exception
    {
        getApiHelper().deleteAllRecords("study", "demographics", new Filter("Id", SUBJECTS[0]));
        getApiHelper().deleteAllRecords("study", "treatment_order", new Filter("Id", SUBJECTS[0]));

        //create records
        log("Creating test subjects");
        JSONObject insertCommand = getApiHelper().prepareInsertCommand("study", "demographics", "lsid", new String[]{"Id", "Species", "Birth", "Gender", "date", "calculated_status"}, new Object[][]{
                {SUBJECTS[0], "Rhesus", (new Date()).toString(), "m", new Date(), "Alive"}
        });
        getApiHelper().doSaveRows(PasswordUtil.getUsername(), Collections.singletonList(insertCommand), getExtraContext(), true);

        goToProjectHome();
        waitAndClickAndWait(Locator.linkWithText("Animal History"));

        String query = "textfield[itemId=subjArea]";
        _helper.waitForCmp(query);
        Ext4FieldRef subjField = getAnimalHistorySubjField();
        subjField.setValue(SUBJECTS[0]);
        waitAndClick(Ext4Helper.ext4Tab("Clinical"));
        waitAndClick(Ext4Helper.ext4Tab("Clinical Snapshot"));

        // manage treatments
        click(Ext4Helper.Locators.ext4Button("Actions"));
        waitAndClick(Ext4Helper.ext4MenuItem("Manage Treatments"));

        waitForElement(Ext4Helper.ext4Window("Manage Treatments: " + SUBJECTS[0]));
        waitAndClick(Ext4Helper.Locators.ext4Button("Order Treatment"));
        waitAndClick(Ext4Helper.ext4MenuItem("Clinical Treatment"));

        waitForElement(Ext4Helper.ext4Window("Treatment Orders"));
        waitForElement(Ext4Helper.ext4Window("Treatment Orders").append(Locator.tagWithText("div", SUBJECTS[0])));
        sleep(200);
        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd kk:mm:ss");
        _ext4Helper.queryOne("window fieldcontainer[fieldLabel='End Date']", Ext4FieldRef.class).setValue(format.format(prepareDate(new Date(), 1, 11)));
        sleep(100);
        Assert.assertNotNull(_ext4Helper.queryOne("window fieldcontainer[fieldLabel='End Date']", Ext4FieldRef.class).getDateValue());
        getFieldInWindow("Center Project", Ext4FieldRef.class).getEval("expand()");
        waitAndClick(Locator.tag("li").append(Locator.tagContainingText("span", "Other")));
        waitForElement(Ext4Helper.ext4Window("Choose Project"));
        _ext4Helper.queryOne("window[title=Choose Project] [fieldLabel='Project']", Ext4ComboRef.class).setComboByDisplayValue(PROJECT_ID);
        waitAndClick(Ext4Helper.ext4Window("Choose Project").append(Ext4Helper.Locators.ext4ButtonEnabled("Submit")));

        Ext4FieldRef treatmentField = getFieldInWindow("Treatment", Ext4FieldRef.class);
        treatmentField.getEval("expand()");
        treatmentField.setValue("E-YY035");
        sleep(200);
        Ext4ComboRef combo = getFieldInWindow("Frequency", Ext4ComboRef.class);
        Assert.assertEquals("BID - AM/Night", combo.getDisplayValue());
        Assert.assertEquals("PO", getFieldInWindow("Route", Ext4FieldRef.class).getValue());
        Assert.assertEquals(32L, _ext4Helper.queryOne("window[title=Treatment Orders] [name='concentration']", Ext4FieldRef.class).getValue());
        Assert.assertEquals("mg/ml", _ext4Helper.queryOne("window[title=Treatment Orders] [name='conc_units']", Ext4FieldRef.class).getValue());
        Assert.assertEquals(8L, _ext4Helper.queryOne("window[title=Treatment Orders] [name='dosage']", Ext4FieldRef.class).getValue());
        Assert.assertEquals("mg/kg", _ext4Helper.queryOne("window[title=Treatment Orders] [name='dosage_units']", Ext4FieldRef.class).getValue());
        Assert.assertEquals("mg", _ext4Helper.queryOne("window[title=Treatment Orders] [name='amount_units']", Ext4FieldRef.class).getValue());
        Assert.assertEquals("mL", _ext4Helper.queryOne("window[title=Treatment Orders] [name='vol_units']", Ext4FieldRef.class).getValue());

        _ext4Helper.queryOne("window[title=Treatment Orders] [name='volume']", Ext4FieldRef.class).clickTrigger();
        waitForElement(Ext4Helper.ext4Window("Review Drug Amounts"));
        _ext4Helper.queryOne("field[fieldName=weight][recordIdx=0]", Ext4FieldRef.class).setValue(10);
        waitAndClick(Ext4Helper.ext4Window("Review Drug Amounts").append(Ext4Helper.Locators.ext4ButtonEnabled("Submit")));
        waitForElementToDisappear(Ext4Helper.ext4Window("Review Drug Amounts"));

        Assert.assertEquals(80L, _ext4Helper.queryOne("window[title=Treatment Orders] [name='amount']", Ext4FieldRef.class).getValue());

        waitAndClick(Ext4Helper.ext4Window("Treatment Orders").append(Ext4Helper.Locators.ext4ButtonEnabled("Submit")));
        waitForElementToDisappear(Ext4Helper.ext4Window("Treatment Orders"));
        waitForElement(Locator.tagContainingText("div", "2.5 mL / 80 mg"));  //proxy for record in grid
        waitAndClick(Locator.tag("img").withClass("x4-action-col-icon"));
        waitAndClick(Ext4Helper.ext4MenuItem("Edit Treatment").notHidden());
        waitForElement(Ext4Helper.ext4Window("Treatment Orders"));
        waitForElement(Ext4Helper.ext4Window("Treatment Orders").append(Locator.tagWithText("div", SUBJECTS[0])));
        waitAndClick(Ext4Helper.ext4Window("Treatment Orders").append(Ext4Helper.Locators.ext4ButtonEnabled("Cancel")));
        waitForElementToDisappear(Ext4Helper.ext4Window("Treatment Orders"));

        waitAndClick(Locator.tag("img").withClass("x4-action-col-icon"));
        waitAndClick(Ext4Helper.ext4MenuItem("Change End Date").notHidden());
        waitForElement(Ext4Helper.ext4Window("Change End Date"));
        waitForElement(Ext4Helper.ext4Window("Change End Date").append(Ext4Helper.Locators.ext4ButtonEnabled("Submit")));
        Date enddate = prepareDate(new Date(), 40, 15);
        _ext4Helper.queryOne("window[title='Change End Date'] [fieldLabel='End Date']", Ext4FieldRef.class).setValue(format.format(enddate));

        waitAndClick(Ext4Helper.ext4Window("Change End Date").append(Ext4Helper.Locators.ext4ButtonEnabled("Submit")));
        waitForElementToDisappear(Ext4Helper.ext4Window("Change End Date"));
        waitForElement(Locator.tagContainingText("div", _tf.format(enddate)));  //proxy for record in grid

        waitAndClick(Ext4Helper.ext4Window("Manage Treatments: " + SUBJECTS[0]).append(Ext4Helper.Locators.ext4ButtonEnabled("Close")));
        waitForElementToDisappear(Ext4Helper.ext4Window("Manage Treatments: " + SUBJECTS[0]));

    }

    @Test
    public void managementCasesTest() throws Exception
    {
        getApiHelper().deleteAllRecords("study", "demographics", new Filter("Id", SUBJECTS[0]));
        getApiHelper().deleteAllRecords("study", "cases", new Filter("Id", SUBJECTS[0]));

        //create vet user
        goToEHRFolder();
        _permissionsHelper.enterPermissionsUI();
        _securityHelper.setProjectPerm(DATA_ADMIN.getEmail(), getContainerPath(), "EHR Veternarian");
        _permissionsHelper.exitPermissionsUI();

        //create records
        log("Creating test subjects");
        JSONObject insertCommand = getApiHelper().prepareInsertCommand("study", "demographics", "lsid", new String[]{"Id", "Species", "Birth", "Gender", "date", "calculated_status"}, new Object[][]{
                {SUBJECTS[0], "Rhesus", (new Date()).toString(), "m", new Date(), "Alive"}
        });
        getApiHelper().doSaveRows(PasswordUtil.getUsername(), Collections.singletonList(insertCommand), getExtraContext(), true);

        waitAndClickAndWait(Locator.linkWithText("Animal History"));

        String query = "textfield[itemId=subjArea]";
        _helper.waitForCmp(query);
        Ext4FieldRef subjField = getAnimalHistorySubjField();
        subjField.setValue(SUBJECTS[0]);
        waitAndClick(Ext4Helper.ext4Tab("Clinical"));
        waitAndClick(Ext4Helper.ext4Tab("Clinical Snapshot"));

        // manage cases
        click(Ext4Helper.Locators.ext4Button("Actions"));
        waitAndClick(Ext4Helper.ext4MenuItem("Manage Cases"));

        waitForElement(Ext4Helper.ext4Window("Manage Cases: " + SUBJECTS[0]));

        waitAndClick(Ext4Helper.Locators.ext4Button("Open Case"));
        waitAndClick(Ext4Helper.ext4MenuItem("Open Surgery Case"));

        waitForElement(Ext4Helper.ext4Window("Open Case: " + SUBJECTS[0]));
        waitForElement(Ext4Helper.ext4Window("Open Case: " + SUBJECTS[0]).append(Locator.tagWithText("div", "Surgery")));
        String description = "This is a surgery case";
        Ext4FieldRef.getForLabel(this, "Description/Notes").setValue(description);

        waitAndClick(Ext4Helper.ext4Window("Open Case: " + SUBJECTS[0]).append(Ext4Helper.Locators.ext4ButtonEnabled("Open Case")));
        waitForElementToDisappear(Ext4Helper.ext4Window("Open Case: " + SUBJECTS[0]));
        waitForElement(Locator.tagWithText("div", description));

        waitAndClick(Locator.tag("img").withClass("x4-action-col-icon"));
        waitAndClick(Ext4Helper.ext4MenuItem("Close With Reopen Date").notHidden());
        Ext4CmpRef.waitForComponent(this, "field[fieldLabel=Reopen Date]");
        Ext4FieldRef.getForLabel(this, "Reopen Date").setValue(_df.format(prepareDate(new Date(), 28, 0)));
        waitAndClick(Ext4Helper.ext4Window("Close With Reopen Date").append(Ext4Helper.Locators.ext4ButtonEnabled("Submit")));
        waitForElementToDisappear(Ext4Helper.ext4Window("Close With Reopen Date"));
        waitForElement(Locator.tagWithText("div", _df.format(prepareDate(new Date(), 28, 0))));

        //now clinical case
        waitAndClick(Ext4Helper.Locators.ext4Button("Open Case"));
        waitAndClick(Ext4Helper.ext4MenuItem("Open Clinical Case"));

        waitForElement(Ext4Helper.ext4Window("Open Case: " + SUBJECTS[0]));
        waitForElement(Ext4Helper.ext4Window("Open Case: " + SUBJECTS[0]).append(Locator.tagWithText("div", "Clinical")));
        Ext4ComboRef vetField = Ext4ComboRef.getForLabel(this, "Assigned Vet");
        vetField.setComboByDisplayValue("admin");

        waitAndClick(Ext4Helper.ext4Window("Open Case: " + SUBJECTS[0]).append(Ext4Helper.Locators.ext4ButtonEnabled("Open & Immediately Close")));
        waitAndClick(Ext4Helper.ext4MenuItem("Close With Reopen Date").notHidden());
        waitForElement(Ext4Helper.ext4Window("Error"));
        waitAndClick(Ext4Helper.ext4Window("Error").append(Ext4Helper.Locators.ext4ButtonEnabled("OK")));
        waitForElementToDisappear(Ext4Helper.ext4Window("Error"));

        Ext4FieldRef problemField = Ext4FieldRef.getForLabel(this, "Problem");
        Ext4FieldRef subProblemField = Ext4FieldRef.getForLabel(this, "Subcategory");
        Assert.assertTrue(subProblemField.isDisabled());
        problemField.setValue("Behavioral");
        sleep(200);
        Assert.assertFalse(subProblemField.isDisabled());
        subProblemField.setValue("Alopecia");

        waitAndClick(Ext4Helper.ext4Window("Open Case: " + SUBJECTS[0]).append(Ext4Helper.Locators.ext4ButtonEnabled("Open & Immediately Close")));
        waitAndClick(Ext4Helper.ext4MenuItem("Close With Reopen Date").notHidden());
        Ext4FieldRef.waitForField(this, "Reopen Date");
        waitAndClick(Ext4Helper.Locators.ext4ButtonEnabled("Submit"));

        waitForElementToDisappear(Ext4Helper.ext4Window("Open Case: " + SUBJECTS[0]));
        waitForElement(Locator.tagWithText("div", "Behavioral: Alopecia"));

        waitAndClick(Ext4Helper.Locators.ext4ButtonEnabled("Close"));
        waitForElementToDisappear(Ext4Helper.ext4Window("Manage Cases: " + SUBJECTS[0]));
    }

    //TODO: @Test
    public void vetReviewTest() throws Exception
    {
        // mark vet review

        // add/replace SOAP
    }

    //TODO: @Test
    public void housingApiTest()
    {
        //TODO: cage size validation

        //auto-update of dividers

        //open-ended, dead ID

        //dead Id, non-open ended

        //mark requested completed

        //auto-set housingCondition, housingType on row
    }

    //TODO: @Test
    public void clinicalRoundsTest()
    {

        //TODO: test cascade update + delete.

        // test row editor
    }

    //TODO: @Test
    public void surgicalRoundsTest()
    {
        //_helper.goToTaskForm("Surgical Rounds");

        //Ext4GridRef obsGrid = _helper.getExt4GridForFormSection("Observations");
        //_helper.addRecordToGrid(obsGrid);

        //TODO: test cascade update + delete

        //TODO: test 'bulk close cases' button

        //_helper.discardForm();
    }

    //TODO: @Test
    public void pathTissuesTest()
    {
        _helper.goToTaskForm("Pathology Tissues");

        //TODO: tissue helper, also copy from previous
    }

    //TODO: @Test
    public void bulkUploadsTest()
    {
        //TODO: batch clinical entry form, bulk upload

        //TODO: aux procedure form, bulk upload

        //TODO: blood request form, excel upload

        //TODO: weight form, bulk upload
    }

    //TODO: @Test
    public void bloodRequestTest()
    {
        // make request

        // check queue

        // create task, save

        // open, delete record.

        // save.  make sure deleted record back in queue

        // use copy previous request
    }

    //TODO: @Test
    public void treatmentScheduleTest()
    {
        // add treatments of different frequencies, including partial days.

        // make sure query works as expected

        // open task, use 'add scheduled treatments' helper
    }

    //TODO: @Test
    public void auxProceduresTest()
    {
        // test copy previous task
    }

    //TODO: @Test
    public void gridErrorsTest()
    {
        //TODO: make sure fields turn red as expected
    }
}
