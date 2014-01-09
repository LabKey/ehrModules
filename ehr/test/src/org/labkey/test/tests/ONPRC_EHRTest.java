/*
 * Copyright (c) 2013-2014 LabKey Corporation
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
import org.apache.commons.lang3.time.DateUtils;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.remoteapi.Connection;
import org.labkey.remoteapi.query.Filter;
import org.labkey.remoteapi.query.SelectRowsCommand;
import org.labkey.remoteapi.query.SelectRowsResponse;
import org.labkey.remoteapi.query.Sort;
import org.labkey.test.Locator;
import org.labkey.test.ModulePropertyValue;
import org.labkey.test.categories.EHR;
import org.labkey.test.categories.External;
import org.labkey.test.categories.ONPRC;
import org.labkey.test.util.DataRegionTable;
import org.labkey.test.util.EHRClientAPIHelper;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.Ext4HelperWD;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.PasswordUtil;
import org.labkey.test.util.RReportHelperWD;
import org.labkey.test.util.SchemaHelper;
import org.labkey.test.util.ext4cmp.Ext4CmpRefWD;
import org.labkey.test.util.ext4cmp.Ext4ComboRefWD;
import org.labkey.test.util.ext4cmp.Ext4FieldRefWD;
import org.labkey.test.util.ext4cmp.Ext4GridRefWD;

import java.io.File;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


/**
 * User: bimber
 * Date: 1/25/13
 * Time: 4:31 PM
 */
@Category({External.class, EHR.class, ONPRC.class})
public class ONPRC_EHRTest extends AbstractEHRTest
{
    protected String PROJECT_NAME = "ONPRC_EHR_TestProject";
    protected static final String REFERENCE_STUDY_PATH = "/server/customModules/onprc_ehr/resources/referenceStudy";
    protected static final String ID_PREFIX = "_testid";

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
        goToProjectHome();
    }

    @BeforeClass
    @LogMethod
    public static void doSetup() throws Exception
    {
        ONPRC_EHRTest initTest = new ONPRC_EHRTest();
        initTest.doCleanup(false);

        initTest.initProject();
        RReportHelperWD rHelper = new RReportHelperWD(initTest);
        rHelper.ensureRConfig();

        currentTest = initTest;
    }

    @Test @Ignore("Placeholder: No tests yet")
    public void doApiTests()
    {
        //TODO: blood draw volumes

        //TODO: all other custom trigger script code
    }

    @Test @Ignore("Placeholder: No tests yet")
    public void doReportingTests()
    {
        //TODO: animal history
    }

    @Test
    public void doCustomActionsTests() throws Exception
    {
        //colony overview
        goToProjectHome();
        waitAndClickAndWait(Locator.tagContainingText("a", "Colony Overview"));
        waitForElement(Locator.tagContainingText("div", "No animals were found"), WAIT_FOR_JAVASCRIPT * 3);

        waitAndClick(Locator.tagContainingText("span", "SPF Colony"));
        waitForElement(Locator.tagContainingText("b", "SPF 9 (ESPF)"), WAIT_FOR_JAVASCRIPT * 2);

        waitAndClick(Locator.tagContainingText("span", "Housing Summary"));
        waitForElement(Locator.tagContainingText("div", "No records were found"), WAIT_FOR_JAVASCRIPT * 2);

        waitAndClick(Locator.tagContainingText("span", "Utilization Summary"));
        waitForElement(Locator.tagContainingText("div", "No records found"), WAIT_FOR_JAVASCRIPT * 2);

        waitAndClick(Locator.tagContainingText("span", "Clinical Case Summary"));
        waitForElement(Locator.tagContainingText("div", "There are no open cases or problems"), WAIT_FOR_JAVASCRIPT * 2);

        //bulk history export
        log("testing bulk history export");
        goToProjectHome();
        waitAndClickAndWait(Locator.tagContainingText("a", "Bulk History Export"));
        waitForElement(Locator.tagContainingText("label", "Enter Animal Id(s)"));
        Ext4FieldRefWD.getForLabel(this, "Enter Animal Id(s)").setValue("12345;23432\nABCDE");
        Ext4FieldRefWD.getForLabel(this, "Show Snapshot Only").setValue(true);
        Ext4FieldRefWD.getForLabel(this, "Redact Information").setValue(true);
        clickAndWait(Locator.ext4Button("Submit"));
        assertElementPresent(Locator.tagContainingText("b", "12345"));
        assertElementPresent(Locator.tagContainingText("b", "23432"));
        assertElementPresent(Locator.tagContainingText("b", "ABCDE"));
        assertElementNotPresent(Locator.tagContainingText("b", "Chronological History").notHidden()); //check hide history
        assertElementNotPresent(Locator.tagContainingText("label", "Projects").notHidden()); //check redaction

        //NOTE: this has been switched to use SSRS, which will not be setup on team city
//        goToProjectHome();
//        waitAndClickAndWait(Locator.tagContainingText("a", "Bulk History Export"));
//        waitForElement(Locator.tagContainingText("label", "Enter Animal Id(s)"));
//        Ext4FieldRefWD.getForLabel(this, "Enter Animal Id(s)").setValue("12345;23432\nABCDE");
//        clickAndWait(Locator.ext4Button("Submit"));
//        assertElementPresent(Locator.tagContainingText("b", "12345"));
//        assertElementPresent(Locator.tagContainingText("b", "23432"));
//        assertElementPresent(Locator.tagContainingText("b", "ABCDE"));
//        assertElementPresent(Locator.tagContainingText("b", "Chronological History").notHidden()); //check hide history
//        assertElementPresent(Locator.tagContainingText("label", "Projects").notHidden()); //check redaction

        //exposure report
        log("testing exposure export");
        goToProjectHome();
        waitAndClickAndWait(Locator.tagContainingText("a", "Exposure Report"));
        waitForElement(Locator.tagContainingText("label", "Enter Animal Id"));
        Ext4FieldRefWD.getForLabel(this, "Enter Animal Id").setValue("12345");
        clickAndWait(Locator.ext4Button("Submit"));
        assertElementPresent(Locator.tagContainingText("b", "12345"));
        assertElementPresent(Locator.tagContainingText("b", "Chronological History"));

        //compare lists of animals
        goToProjectHome();
        waitAndClickAndWait(Locator.tagContainingText("a", "Compare Lists of Animals"));
        waitForElement(Locator.id("unique"));
        setFormElement(Locator.id("unique"), "1,2,1\n3,3;4");
        click(Locator.id("uniqueButton"));
        waitForElement(Locator.id("uniqueInputTotal").withText("6 total"));
        assertElementPresent(Locator.id("uniqueTargetTotal").withText("4 total"));
        Assert.assertEquals("Incorrect text", "1\n2\n3\n4", getDriver().findElement(Locator.id("uniqueTarget").toBy()).getAttribute("value"));

        setFormElement(Locator.id("subtract1"), "1,2,1\n3,3;4");
        setFormElement(Locator.id("subtract2"), "1,4;23 48");
        click(Locator.id("compareButton"));
        waitForElement(Locator.id("subtractList1Total").withText("6 total"));
        assertElementPresent(Locator.id("subtractList2Total").withText("4 total"));

        assertElementPresent(Locator.id("intersectTargetTotal").withText("2 total"));
        Assert.assertEquals("Incorrect text", "1\n4", getDriver().findElement(Locator.id("intersectTarget").toBy()).getAttribute("value"));

        assertElementPresent(Locator.id("subtractTargetTotal").withText("3 total"));
        Assert.assertEquals("Incorrect text", "2\n3\n3", getDriver().findElement(Locator.id("subtractTarget").toBy()).getAttribute("value"));

        assertElementPresent(Locator.id("subtractTargetTotal2").withText("2 total"));
        Assert.assertEquals("Incorrect text", "23\n48", getDriver().findElement(Locator.id("subtractTarget2").toBy()).getAttribute("value"));

        //animal groups
        goToProjectHome();
        waitAndClickAndWait(Locator.tagContainingText("a", "Animal Groups"));
        waitForElement(Locator.tagContainingText("span", "Active Groups"));
        DataRegionTable dr = new DataRegionTable("query", this);
        //TODO: create dummy groups


        //more reports
        goToProjectHome();
        waitAndClickAndWait(Locator.tagContainingText("a", "More Reports"));
        waitForElement(Locator.tagContainingText("a", "View Summary of Clinical Tasks"));
        //TODO: consider walking links?


        //printable reports
        goToProjectHome();
        waitAndClickAndWait(Locator.tagContainingText("a", "Printable Reports"));
        waitForElement(Locator.ext4Button("Print Version"));
    }

    @Test
    public void testPedigreeReport() throws Exception
    {
        goToProjectHome();
        createBirthRecords();
        waitAndClickAndWait(Locator.tagContainingText("a", "Animal History"));
        _helper.waitForCmp("textfield[itemId=subjArea]");
        String id = ID_PREFIX + 1;
        getAnimalHistorySubjField().setValue(id);
        waitAndClick(Ext4HelperWD.ext4Tab("Genetics"));
        waitAndClick(Ext4HelperWD.ext4Tab("Pedigree Plot"));

        waitForElement(Locator.tagContainingText("span", "Pedigree Plot - " + id), WAIT_FOR_JAVASCRIPT * 3);
        assertTextNotPresent("Error executing command");
        Assert.assertTrue(isTextPresent("Console output"));
    }

    @Override
    protected void setEHRModuleProperties()
    {
        super.setEHRModuleProperties();

        setModuleProperties(Arrays.asList(new ModulePropertyValue("ONPRC_EHR", "/" + getProjectName(), "BillingContainer", "/" + getContainerPath())));
    }

    @Test
    public void doLabworkResultEntryTest() throws Exception
    {
        _helper.goToTaskForm("Lab Results");
        _helper.getExt4FieldForFormSection("Task", "Title").setValue("Test Task 1");

        Ext4GridRefWD panelGrid = _helper.getExt4GridForFormSection("Panels / Services");

        //panel, tissue, type
        String[][] panels = new String[][]{
                {"BASIC Chemistry Panel in-house", "T-0X500", "Biochemistry", "chemistry_tests"},
                {"Anaerobic Culture", null, "Microbiology", null, "T-0X000"},  //NOTE: cultures dont have a default tissue, so we set it using value
                {"CBC with automated differential", "T-0X000", "Hematology", "hematology_tests"},
                {"Antibiotic Sensitivity", null, "Antibiotic Sensitivity", null, "T-0X000"},
                {"Fecal parasite exam", "T-6Y100", "Parasitology", null},
                {"ESPF Surveillance - Monthly", "T-0X500", "Serology/Virology", null},
                {"Urinalysis", "T-7X100", "Urinalysis", "urinalysis_tests"},
                {"Occult Blood", "T-6Y100", "Misc Tests", "misc_tests"}
        };

        int panelIdx = 1;
        for (String[] arr : panels)
        {
            _helper.addRecordToGrid(panelGrid);
            panelGrid.setGridCell(panelIdx, "Id", "Animal" + panelIdx);
            panelGrid.setGridCell(panelIdx, "servicerequested", arr[0]);

            if (arr[1] != null && arr.length == 4)
            {
                Assert.assertEquals("Tissue not set properly", arr[1], panelGrid.getFieldValue(panelIdx, "tissue"));
            }
            else if (arr.length > 4)
            {
                //for some panels, tissue will not have a default.  therefore we set one and verify it gets copied into the results downstream
                panelGrid.setGridCellJS(panelIdx, "tissue", arr[4]);
                arr[1] = arr[4];

                Assert.assertEquals("Tissue not set properly", panelGrid.getFieldValue(panelIdx, "tissue"), arr[1]);
            }

            Assert.assertEquals("Category not set properly", panelGrid.getFieldValue(panelIdx, "type"), arr[2]);

            validatePanelEntry(arr[0], arr[1], arr[2], arr[3]);

            panelIdx++;
        }

        //TODO: save first, then dircard

        waitAndClick(_helper.getDataEntryButton("More Actions"));
        _ext4Helper.clickExt4MenuItem("Discard");
        waitForElement(Ext4HelperWD.ext4Window("Discard Form"));
        clickAndWait(Locator.ext4Button("Yes"));

        waitForElement(Locator.tagWithText("span", "Enter Data"));
    }

    @LogMethod
    public void validatePanelEntry(String panelName, String tissue, String title, String lookupTable) throws Exception
    {
        SelectRowsCommand cmd = new SelectRowsCommand("ehr_lookups", "labwork_panels");
        cmd.addFilter(new Filter("servicename", panelName));
        cmd.addSort(new Sort("sort_order"));
        SelectRowsResponse srr = cmd.execute(new Connection(getBaseURL(), PasswordUtil.getUsername(), PasswordUtil.getPassword()), getContainerPath());
        List<Map<String, Object>> expectedRows = srr.getRows();

        waitAndClick(Ext4HelperWD.ext4Tab(title));
        Ext4GridRefWD grid = _helper.getExt4GridForFormSection(title);
        waitForElement(Locator.id(grid.getId()).notHidden());

        grid.clickTbarButton("Copy From Above");
        waitForElement(Ext4HelperWD.ext4Window("Copy From Above"));
        Ext4CmpRefWD submitBtn = _ext4Helper.queryOne("button[text='Submit']", Ext4CmpRefWD.class);
        submitBtn.waitForEnabled();
        click(Locator.ext4Button("Submit"));

        if (expectedRows.size() == 0)
        {
            grid.waitForRowCount(1);

            if (tissue != null && grid.isColumnPresent("tissue", true))
            {
                Assert.assertEquals("Tissue was not copied from runs action", tissue, grid.getFieldValue(1, "tissue"));
            }
        }
        else
        {
            grid.waitForRowCount(expectedRows.size());

            int rowIdx = 1;  //1-based
            String testFieldName = null;
            for (Map<String, Object> row : expectedRows)
            {
                testFieldName = (String)row.get("testfieldname");
                String testname = (String)row.get("testname");
                Assert.assertEquals("Wrong testId", testname, grid.getFieldValue(rowIdx, testFieldName));

                String method = (String)row.get("method");
                if (method != null)
                {
                    Assert.assertEquals("Wrong method", method, grid.getFieldValue(rowIdx, "method"));
                }

                if (lookupTable != null)
                {
                    String units = getUnits(lookupTable, testname);
                    if (units != null)
                    {
                        Assert.assertEquals("Wrong units", units, grid.getFieldValue(rowIdx, "units"));
                    }
                }

                rowIdx++;
            }

            //iterate rows, checking keyboard navigation
            if (testFieldName != null)
            {
                Integer rowCount = grid.getRowCount();

                //TODO: test keyboard navigation
                //grid.startEditing(1, grid.getIndexOfColumn(testFieldName));

                // click through each testId and make sure the value persists.
                // this might not occur if the lookup is invalid
                for (int j = 1; j <= rowCount; j++)
                {
                    log("testing row: " + j);
                    Object origVal = grid.getFieldValue(j, testFieldName);

                    grid.startEditing(j, testFieldName);
                    sleep(50);
                    //TODO: test keyboard navigation
                    grid.completeEdit();
                    //grid.getActiveGridEditor().sendKeys(Keys.ENTER);

                    Object newVal = grid.getFieldValue(j, testFieldName);
                    Assert.assertEquals("Test Id value did not match after key navigation", newVal, origVal);
                }

                //NOTE: the test can get bogged down w/ many rows, so we delete as it goes along
                grid.clickTbarButton("Select All");
                grid.waitForSelected(grid.getRowCount());
                grid.clickTbarButton("Delete Selected");
                waitForElement(Ext4HelperWD.ext4Window("Confirm"));
                waitAndClick(Locator.ext4Button("Yes"));
                grid.waitForRowCount(0);
                sleep(200);
            }
        }
    }

    private Map<String, Map<String, String>> _unitsMap = new HashMap<>();

    private String getUnits(String queryName, String testId) throws Exception
    {
        if (_unitsMap.containsKey(queryName))
        {
            return _unitsMap.get(queryName).get(testId);
        }

        Map<String, String> queryResults = new HashMap<>();
        SelectRowsCommand cmd = new SelectRowsCommand("ehr_lookups", queryName);
        SelectRowsResponse srr = cmd.execute(new Connection(getBaseURL(), PasswordUtil.getUsername(), PasswordUtil.getPassword()), getContainerPath());
        for (Map<String, Object> row : srr.getRows())
        {
            if (row.get("units") != null)
                queryResults.put((String)row.get("testid"), (String)row.get("units"));
        }

        _unitsMap.put(queryName, queryResults);

        return _unitsMap.get(queryName).get(testId);
    }

    private boolean _hasCreatedBirthRecords = false;

    protected void createBirthRecords() throws Exception
    {
        if (_hasCreatedBirthRecords)
            return;

        //note: these should cascade insert into demographics
        EHRClientAPIHelper apiHelper = new EHRClientAPIHelper(this, getProjectName());
        String schema = "study";
        String query = "birth";
        String parentageQuery = "parentage";

        int i = 0;
        while (i < 10)
        {
            i++;
            Map<String, Object> row = new HashMap();
            row.put("Id", ID_PREFIX + i);
            row.put("date", new Date());
            row.put("gender", ((i % 2) == 0 ? "m" : "f"));
            row.put("dam", ID_PREFIX + (i + 100 + "f"));

            apiHelper.deleteIfExists(schema, query, row, "Id");
            apiHelper.insertRow(schema, query, row, false);

            Map<String, Object> parentageRow = new HashMap();
            parentageRow.put("Id", ID_PREFIX + i);
            parentageRow.put("date", new Date());
            parentageRow.put("relationship", "Sire");
            parentageRow.put("parent", ID_PREFIX + (i + 100 + "m"));
            parentageRow.put("method", "Genetic");

            //we dont have the LSID, so dont bother deleting the record.  it wont hurt anything to have 2 copies
            apiHelper.insertRow(schema, parentageQuery, parentageRow, false);
        }

        _hasCreatedBirthRecords = true;
    }

    @Test
    public void doExamEntryTest() throws Exception
    {
        _helper.goToTaskForm("Exams/Cases");
        _helper.getExt4FieldForFormSection("Task", "Title").setValue("Test Exam 1");

        waitAndClick(_helper.getDataEntryButton("More Actions"));
        _ext4Helper.clickExt4MenuItem("Apply Template");
        waitForElement(Ext4HelperWD.ext4Window("Apply Template To Form"));
        waitForTextToDisappear("Loading...");
        String templateName = "Achilles Tendon Repair";
        waitForElement(Ext4HelperWD.ext4Window("Apply Template To Form").append(Locator.tagContainingText("label", "Choose Template")));
        _ext4Helper.selectComboBoxItem("Choose Template:", templateName, true);
        sleep(100); //allow field to cascade
        Assert.assertEquals("Section template not set", templateName, Ext4ComboRefWD.getForLabel(this, "SOAP").getDisplayValue());

        waitAndClick(Locator.ext4Button("Submit"));
        waitForElementToDisappear(Ext4HelperWD.ext4Window("Apply Template To Form"));

        _helper.getExt4FieldForFormSection("SOAP", "Id").setValue(MORE_ANIMAL_IDS[0]);

        //observations section
        Ext4GridRefWD observationsGrid = _helper.getExt4GridForFormSection("Observations");
        Assert.assertEquals("Incorrect row count", 14, observationsGrid.getRowCount());
        for (int i=0;i<14;i++)
        {
            Assert.assertEquals("Id not copied property", MORE_ANIMAL_IDS[0], observationsGrid.getFieldValue(1 + i, "Id"));
        }

        Assert.assertEquals(observationsGrid.getFieldValue(1, "category"), "BCS");
        Assert.assertEquals(observationsGrid.getFieldValue(2, "category"), "Alopecia Score");
        Assert.assertEquals(observationsGrid.getFieldValue(3, "category"), "CRT");
        Assert.assertEquals(observationsGrid.getFieldValue(4, "category"), "MM");
        Assert.assertEquals(observationsGrid.getFieldValue(5, "category"), "Temp");

        Assert.assertEquals(observationsGrid.getFieldValue(8, "category"), "Assessment");
        Assert.assertEquals(observationsGrid.getFieldValue(8, "area"), "Oral");
        Assert.assertEquals(observationsGrid.getFieldValue(8, "observation"), "Normal");

        //weight section
        waitAndClick(Ext4HelperWD.ext4Tab("Weights"));
        Ext4GridRefWD weightGrid = _helper.getExt4GridForFormSection("Weights");
        Assert.assertEquals("Incorrect row count", 0, weightGrid.getRowCount());
        _helper.addRecordToGrid(weightGrid);
        Assert.assertEquals("Id not copied property", MORE_ANIMAL_IDS[0], weightGrid.getFieldValue(1, "Id"));
        Double weight = 5.3;
        weightGrid.setGridCell(1, "weight", weight.toString());

        //procedures section
        waitAndClick(Ext4HelperWD.ext4Tab("Procedures"));
        Ext4GridRefWD proceduresGrid = _helper.getExt4GridForFormSection("Procedures");
        Assert.assertEquals("Incorrect row count", 0, proceduresGrid.getRowCount());
        _helper.addRecordToGrid(proceduresGrid);
        Assert.assertEquals("Id not copied property", proceduresGrid.getFieldValue(1, "Id"), MORE_ANIMAL_IDS[0]);

        //medications section
        waitAndClick(Ext4HelperWD.ext4Tab("Medications"));
        Ext4GridRefWD drugGrid = _helper.getExt4GridForFormSection("Medications/Treatments Given");
        Assert.assertEquals("Incorrect row count", 5, drugGrid.getRowCount());

        Assert.assertEquals(drugGrid.getFieldValue(1, "code"), "E-721X0");
        Assert.assertEquals(drugGrid.getFieldValue(1, "route"), "IM");
        Assert.assertEquals(drugGrid.getFieldValue(1, "dosage"), 25L);

        //verify formulary used
        drugGrid.setGridCellJS(1, "code", "E-YY035");
        Assert.assertEquals("Formulary not applied", drugGrid.getFieldValue(1, "route"), "PO");
        Assert.assertEquals("Formulary not applied", drugGrid.getFieldValue(1, "dosage"), 8L);
        Assert.assertEquals("Formulary not applied", drugGrid.getFieldValue(1, "amount_units"), "mL");

        Ext4GridRefWD ordersGrid = _helper.getExt4GridForFormSection("Medication/Treatment Orders");
        Assert.assertEquals("Incorrect row count", ordersGrid.getRowCount(), 4);
        Assert.assertEquals(ordersGrid.getFieldValue(4, "code"), "E-YY732");
        Assert.assertEquals(ordersGrid.getFieldValue(4, "route"), "PO");
        Assert.assertEquals(ordersGrid.getFieldValue(4, "concentration"), 50L);
        Assert.assertEquals(ordersGrid.getFieldValue(4, "conc_units"), "mg/tab");
        Assert.assertEquals(ordersGrid.getFieldValue(4, "dosage"), 3L);
        Assert.assertEquals(ordersGrid.getFieldValue(4, "dosage_units"), "mg/kg");

        //TODO: test amount

        //blood draws
        waitAndClick(Ext4HelperWD.ext4Tab("Blood Draws"));
        Ext4GridRefWD bloodGrid = _helper.getExt4GridForFormSection("Blood Draws");
        Assert.assertEquals("Incorrect row count", 0, bloodGrid.getRowCount());
        bloodGrid.clickTbarButton("Templates");
        waitAndClick(Ext4Helper.ext4MenuItem("Apply Template").notHidden());
        waitForElement(Ext4Helper.ext4Window("Apply Template"));
        waitAndClick(Locator.ext4Button("Close"));

        Date date = DateUtils.round(new Date(), Calendar.DATE);
        Date date2 = DateUtils.addDays(date, 1);

        _helper.applyTemplate(bloodGrid, "CBC and Chem", false, date);
        bloodGrid.waitForRowCount(2);

        _helper.applyTemplate(bloodGrid, "CBC and Chem", true, date2);
        _helper.toggleBulkEditField("Remark");
        String remark = "The Remark";
        Ext4FieldRefWD.getForLabel(this, "Remark").setValue(remark);
        waitAndClick(Locator.ext4Button("Submit"));
        bloodGrid.waitForRowCount(4);

        Assert.assertEquals(bloodGrid.getDateFieldValue(1, "date"), date);
        Assert.assertEquals(bloodGrid.getDateFieldValue(2, "date"), date);
        Assert.assertEquals(bloodGrid.getDateFieldValue(3, "date"), date2);
        Assert.assertEquals(bloodGrid.getDateFieldValue(4, "date"), date2);

        Assert.assertEquals(bloodGrid.getFieldValue(3, "remark"), remark);
        Assert.assertEquals(bloodGrid.getFieldValue(4, "remark"), remark);

        waitAndClickAndWait(_helper.getDataEntryButton("Save & Close"));
        waitForElement(Locator.tagWithText("span", "Enter Data"));
    }

    @Test
    public void doWeightEntryTest() throws Exception
    {
        _helper.goToTaskForm("Weights");
        _helper.getExt4FieldForFormSection("Task", "Title").setValue("Test Weight 1");

        Ext4GridRefWD weightGrid = _helper.getExt4GridForFormSection("Weights");
        weightGrid.clickTbarButton("Add Batch");
        waitForElement(Ext4HelperWD.ext4Window("Choose Animals"));
        Ext4FieldRefWD.getForLabel(this, "Id(s)").setValue(StringUtils.join(MORE_ANIMAL_IDS, ";"));
        waitAndClick(Locator.ext4Button("Submit"));
        Assert.assertEquals(weightGrid.getRowCount(), MORE_ANIMAL_IDS.length);

        weightGrid.clickTbarButton("Add Batch");
        waitForElement(Ext4HelperWD.ext4Window("Choose Animals"));
        Ext4FieldRefWD.getForLabel(this, "Id(s)").setValue(StringUtils.join(MORE_ANIMAL_IDS, ";"));
        Ext4FieldRefWD.getForLabel(this, "Bulk Edit Values").setChecked(true);
        waitAndClick(Locator.ext4Button("Submit"));
        waitForElement(Ext4HelperWD.ext4Window("Bulk Edit"));
        _helper.toggleBulkEditField("Weight (kg)");
        double weight = 4.0;
        Ext4FieldRefWD.getForLabel(this, "Weight (kg)").setValue(weight);
        waitAndClick(Locator.ext4Button("Submit"));
        Assert.assertEquals(weightGrid.getRowCount(), MORE_ANIMAL_IDS.length * 2);

        //verify IDs added in correct order
        for (int i=0;i<MORE_ANIMAL_IDS.length;i++)
        {
            Assert.assertEquals(weightGrid.getFieldValue(i + 1, "Id"), MORE_ANIMAL_IDS[i]);
            Assert.assertEquals(weightGrid.getFieldValue(MORE_ANIMAL_IDS.length + i + 1, "Id"), MORE_ANIMAL_IDS[i]);
        }

        Assert.assertEquals(Double.parseDouble(weightGrid.getFieldValue(MORE_ANIMAL_IDS.length + 1, "weight").toString()), weight);

        //TB section
        Ext4GridRefWD tbGrid = _helper.getExt4GridForFormSection("TB Tests");
        tbGrid.clickTbarButton("Copy From Section");
        waitAndClick(Ext4HelperWD.ext4MenuItem("Weights"));
        waitForElement(Ext4HelperWD.ext4Window("Copy From Weights"));
        waitAndClick(Locator.ext4Button("Submit"));
        Assert.assertEquals(tbGrid.getRowCount(), MORE_ANIMAL_IDS.length);

        //sedations
        Ext4GridRefWD drugGrid = _helper.getExt4GridForFormSection("Medications/Treatments Given");
        drugGrid.clickTbarButton("Add Sedation(s)");
        waitAndClick(Ext4HelperWD.ext4MenuItem("Copy Ids From: Weights"));
        waitForElement(Ext4HelperWD.ext4Window("Add Sedations"));
        Ext4FieldRefWD.getForLabel(this, "Lot # (optional)").setValue("Lot");

        //set weights
        for (Ext4FieldRefWD field : _ext4Helper.componentQuery("field[fieldName='weight']", Ext4FieldRefWD.class))
        {
            field.setValue(4.1);
        }

        //verify dosage
        for (Ext4FieldRefWD field : _ext4Helper.componentQuery("field[fieldName='dosage']", Ext4FieldRefWD.class))
        {
            Assert.assertEquals(field.getDoubleValue(), (Object)10.0);
        }

        //verify amount
        for (Ext4FieldRefWD field : _ext4Helper.componentQuery("field[fieldName='amount']", Ext4FieldRefWD.class))
        {
            Assert.assertEquals(field.getDoubleValue(), (Object)40.0);
        }

        //modify rounding + dosage
        Ext4FieldRefWD dosageField = Ext4FieldRefWD.getForLabel(this, "Reset Dosage");
        dosageField.setValue(23);
        dosageField.eval("onTriggerClick()");
        for (Ext4FieldRefWD field : _ext4Helper.componentQuery("field[fieldName='dosage']", Ext4FieldRefWD.class))
        {
            Assert.assertEquals(field.getDoubleValue(), (Object)23.0);
        }

        for (Ext4FieldRefWD field : _ext4Helper.componentQuery("field[fieldName='amount']", Ext4FieldRefWD.class))
        {
            Assert.assertEquals(field.getDoubleValue(), (Object)95.0);
        }

        Ext4FieldRefWD roundingField = Ext4FieldRefWD.getForLabel(this, "Round To Nearest");
        roundingField.setValue(0.5);
        roundingField.eval("onTriggerClick()");
        for (Ext4FieldRefWD field : _ext4Helper.componentQuery("field[fieldName='amount']", Ext4FieldRefWD.class))
        {
            Assert.assertEquals((Object)field.getDoubleValue(), 94.5);
        }

        //deselect the first row
        _ext4Helper.queryOne("field[fieldName='exclude']", Ext4FieldRefWD.class).setChecked(true);

        waitAndClick(Locator.ext4Button("Submit"));

        int expectedRecords = MORE_ANIMAL_IDS.length - 1;
        Assert.assertEquals(drugGrid.getRowCount(), expectedRecords);

        for (int i=0;i<expectedRecords;i++)
        {
            Assert.assertEquals(drugGrid.getFieldValue(i + 1, "lot"), "Lot");
            Assert.assertEquals(drugGrid.getFieldValue(i+1, "reason"), "Weight");
            Assert.assertEquals(drugGrid.getFieldValue(i + 1, "amount"), 94.5);
        }

        //TB section
        tbGrid.clickTbarButton("Copy From Section");
        waitAndClick(Ext4HelperWD.ext4MenuItem("Medications/Treatments Given"));
        waitForElement(Ext4HelperWD.ext4Window("Copy From Medications/Treatments Given"));
        for (Ext4FieldRefWD field : _ext4Helper.componentQuery("field[fieldName='exclude']", Ext4FieldRefWD.class))
        {
            Assert.assertEquals(field.getValue(), true);
        }

        //deselect the first row
        _ext4Helper.queryOne("field[fieldName='exclude']", Ext4FieldRefWD.class).setChecked(false);

        Ext4FieldRefWD.getForLabel(this, "Bulk Edit Values").setChecked(true);
        waitAndClick(Locator.ext4Button("Submit"));
        waitForElement(Ext4HelperWD.ext4Window("Bulk Edit"));
        _helper.toggleBulkEditField("Method");
        Ext4FieldRefWD.getForLabel(this, "Method").setValue("Intradermal");
        waitAndClick(Locator.ext4Button("Submit"));
        waitForElementToDisappear(Ext4HelperWD.ext4Window("Bulk Edit"));

        Assert.assertEquals(tbGrid.getRowCount(), MORE_ANIMAL_IDS.length + 1);

        waitAndClick(_helper.getDataEntryButton("More Actions"));
        _ext4Helper.clickExt4MenuItem("Discard");
        waitForElement(Ext4HelperWD.ext4Window("Discard Form"));
        clickAndWait(Locator.ext4Button("Yes"));

        waitForElement(Locator.tagWithText("span", "Enter Data"));
    }

    @Test
    public void testGeneticsPipeline() throws Exception
    {
        goToProjectHome();

        createBirthRecords();

        waitAndClickAndWait(Locator.tagContainingText("a", "EHR Admin Page"));
        waitAndClickAndWait(Locator.tagContainingText("a", "Genetics Calculations"));
        waitAndClickAndWait(Locator.ext4Button("Run Now"));
        waitAndClickAndWait(Locator.navButton("OK"));
        waitForPipelineJobsToComplete(2, "genetics pipeline", false);
    }

    @Test
    public void doNotificationTests()
    {
        goToProjectHome();
        waitAndClickAndWait(Locator.tagContainingText("a", "EHR Admin Page"));
        waitAndClickAndWait(Locator.tagContainingText("a", "Notification Admin"));

        //set general settings
        _helper.waitForCmp("field[fieldLabel='Notification User']");
        Ext4FieldRefWD.getForLabel(this, "Notification User").setValue(PasswordUtil.getUsername());
        Ext4FieldRefWD.getForLabel(this, "Reply Email").setValue("fakeEmail@fakeDomain.com");
        Ext4CmpRefWD btn = _ext4Helper.queryOne("button[text='Save']", Ext4CmpRefWD.class);
        btn.waitForEnabled();
        waitAndClick(Locator.ext4Button("Save"));
        waitForElement(Ext4HelperWD.ext4Window("Success"));
        waitAndClickAndWait(Locator.ext4Button("OK"));
        _helper.waitForCmp("field[fieldLabel='Notification User']");

        Locator manageLink = Locator.tagContainingText("a", "Manage Subscribed Users/Groups").index(1);
        waitAndClick(manageLink);
        waitForElement(Ext4HelperWD.ext4Window("Manage Subscribed Users"));
        Ext4FieldRefWD combo = Ext4FieldRefWD.getForLabel(this, "Add User Or Group");
        _ext4Helper.selectComboBoxItem(Locator.id(combo.getId()), true, DATA_ADMIN.getEmail());
        waitForElement(Locator.ext4Button("Remove"));

        combo = Ext4FieldRefWD.getForLabel(this, "Add User Or Group");

        _ext4Helper.selectComboBoxItem(Locator.id(combo.getId()), true, BASIC_SUBMITTER.getEmail());
        waitForElement(Locator.ext4Button("Remove"), 2);
        waitAndClick(Locator.ext4Button("Close"));

        waitAndClick(manageLink);
        waitForElement(Ext4HelperWD.ext4Window("Manage Subscribed Users"));
        waitForElement(Locator.tagContainingText("div", DATA_ADMIN.getEmail()));
        waitForElement(Locator.tagContainingText("div", BASIC_SUBMITTER.getEmail()));
        waitForElement(Locator.ext4Button("Remove"));
        assertElementPresent(Locator.ext4Button("Remove"), 2);
        waitAndClick(Locator.ext4Button("Remove").index(0));  //remove admin
        waitAndClick(Locator.ext4Button("Close"));

        waitAndClick(manageLink);
        waitForElement(Ext4HelperWD.ext4Window("Manage Subscribed Users"));
        waitForElement(Locator.tagContainingText("div", BASIC_SUBMITTER.getEmail()));
        waitForElement(Locator.ext4Button("Remove"));
        assertElementPresent(Locator.ext4Button("Remove"), 1);
        waitAndClick(Locator.ext4Button("Close"));

        //iterate all notifications and run them.
        log("running all notifications");
        List<String> skippedNotifications = Arrays.asList(new String[]{"ETL Validation Notification"});

        int count = getElementCount(Locator.tagContainingText("a", "Run Report In Browser"));
        for (int i = 0; i < count; i++)
        {
            beginAt(getBaseURL() + "/ldk/" + getContainerPath() + "/notificationAdmin.view");
            Locator link = Locator.tagContainingText("a", "Run Report In Browser").index(i);
            Locator label = Locator.tag("div").withClass("ldk-notificationlabel").index(i);
            waitForElement(label);
            String notificationName = label.findElement(getDriver()).getText();
            Assert.assertNotNull(notificationName);
            if (skippedNotifications.contains(notificationName))
            {
                log("skipping notification: " + notificationName);
                continue;
            }

            log("running notification: " + notificationName);
            waitAndClickAndWait(link);
            waitForText("The notification email was last sent on:");
            assertTextNotPresent("not configured");
        }
    }

    @Override
    protected void createProjectAndFolders()
    {
        _containerHelper.createProject(PROJECT_NAME, "ONPRC EHR");
    }

    @Override
    protected void populateInitialData()
    {
        beginAt(getBaseURL() + "/onprc_ehr/" + getContainerPath() + "/populateData.view");

        waitAndClickButton("Delete Data From Lookup Sets", 0);
        waitForElement(Locator.tagContainingText("div", "Delete Complete"), 200000);
        waitAndClickButton("Populate Lookup Sets", 0);
        waitForElement(Locator.tagContainingText("div", "Populate Complete"), 200000);
        sleep(2000);

        waitAndClickButton("Delete All", 0);
        waitForElement(Locator.tagContainingText("div", "Delete Complete"), 200000);
        waitAndClickButton("Populate All", 0);
        waitForElement(Locator.tagContainingText("div", "Populate Complete"), 200000);

        //NOTE: this is excluded from populate all since it changes rarely
        waitAndClickButton("Delete Data From SNOMED Codes", 0);
        waitForElement(Locator.tagContainingText("div", "Delete Complete"), 200000);
        waitAndClickButton("Populate SNOMED Codes", 0);
        waitForElement(Locator.tagContainingText("div", "Populate Complete"), 200000);

        //also populate templates
        beginAt(getBaseURL() + "/onprc_ehr/" + getContainerPath() + "/populateTemplates.view");

        waitAndClickButton("Delete All", 0);
        waitForElement(Locator.tagContainingText("div", "Delete Complete"), 200000);
        waitAndClickButton("Populate All", 0);
        waitForElement(Locator.tagContainingText("div", "Populate Complete"), 200000);

        //Note: this is created because some of the billing code expects it.  ideally this is eventually split into a separate module + test
        SchemaHelper schemaHelper = new SchemaHelper(this);
        schemaHelper.createLinkedSchema(this.getProjectName(), null, "onprc_billing_public", "/" + this.getContainerPath(), "onprc_billing_public", null, null, null);
    }

    @Override
    protected void doStudyImport()
    {
        File path = new File(getLabKeyRoot(), REFERENCE_STUDY_PATH);
        setPipelineRoot(path.getPath());

        goToModule("Pipeline");
        waitAndClickButton("Process and Import Data");

        _fileBrowserHelper.expandFileBrowserRootNode();
        _fileBrowserHelper.clickFileBrowserFileCheckbox("study.xml");

        if (isTextPresent("Reload Study"))
            _fileBrowserHelper.selectImportDataAction("Reload Study");
        else
            _fileBrowserHelper.selectImportDataAction("Import Study");

        waitForPipelineJobsToComplete(1, "Study import", false);
    }

    @Override
    protected String getStudyPolicyXML()
    {
        return "/sampledata/study/onprcEHRStudyPolicy.xml";
    }

    //TODO: @Test
    public void observationsGridTest()
    {

    }

    //TODO: @Test
    public void clinicalRoundsTest()
    {

    }

    //TODO: @Test
    public void surgicalRoundsTest()
    {

    }

    //TODO: @Test
    public void pathologyTest()
    {

    }

    //TODO: @Test
    public void surgeryFormTest()
    {

    }

    //TODO: @Test
    public void gridErrorsTest()
    {
        //make sure fields turn red as expected
    }
}
