/*
 * Copyright (c) 2012-2014 LabKey Corporation
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
import org.json.JSONException;
import org.json.JSONObject;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.remoteapi.CommandException;
import org.labkey.remoteapi.Connection;
import org.labkey.remoteapi.query.Filter;
import org.labkey.remoteapi.query.SelectRowsCommand;
import org.labkey.remoteapi.query.SelectRowsResponse;
import org.labkey.test.categories.EHR;
import org.labkey.test.categories.External;
import org.labkey.test.categories.ONPRC;
import org.labkey.test.util.EHRClientAPIHelper;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.LoggedParam;
import org.labkey.test.util.PasswordUtil;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

@Category({External.class, EHR.class, ONPRC.class})
public class EHRApiTest extends AbstractEHRTest
{
    private static String FIELD_QCSTATELABEL = "QCStateLabel";
    private static String FIELD_OBJECTID = "objectid";
    private static String FIELD_LSID = "lsid";

    private String[] weightFields = {"Id", "date", "enddate", "project", "weight", FIELD_QCSTATELABEL, FIELD_OBJECTID, FIELD_LSID, "_recordid"};
    private Object[] weightData1 = {"TestSubject1", EHRClientAPIHelper.DATE_SUBSTITUTION, null, null, "12", EHRQCState.IN_PROGRESS.label, null, null, "_recordID"};
    private List<Long> _saveRowsTimes;
    private SimpleDateFormat _tf = new SimpleDateFormat("yyyy-MM-dd kk:mm");
    private Random _randomGenerator = new Random();

    private static String[] SUBJECTS = {"rh0000", "cy999", "r12345", "r00000"};
    private static String[] ROOMS = {"Room1", "Room2", "Room3"};
    private static String[] CAGES = {"1", "2", "3"};
    private static Integer[] PROJECTS = {12345, 123456, 1234567};
    private EHRClientAPIHelper _apiHelper = new EHRClientAPIHelper(this, getContainerPath());

    public EHRApiTest()
    {
        super();
        STUDY_ZIP = STUDY_ZIP_NO_DATA;
    }

    @BeforeClass
    @LogMethod
    public static void doSetup() throws Exception
    {
        EHRApiTest initTest = (EHRApiTest)getCurrentTest();
        initTest.initProject();

        initTest.goToProjectHome();
        initTest.createTestSubjects();
    }

    @Override
    protected boolean doSetUserPasswords()
    {
        return true;
    }

    @Test
    public void doSecurityTest() throws Exception
    {
        testUserAgainstAllStates(DATA_ADMIN);
        testUserAgainstAllStates(REQUESTER);
        testUserAgainstAllStates(BASIC_SUBMITTER);
        testUserAgainstAllStates(FULL_SUBMITTER);
        testUserAgainstAllStates(FULL_UPDATER);
        testUserAgainstAllStates(REQUEST_ADMIN);
        goToProjectHome();  //NOTE: this is designed to force the test to sign in, assuming our session was timed out from all the API tests
        signIn();
        resetErrors(); //note: inserting records without permission will log errors by design.  the UI should prevent this from happening, so we want to be aware if it does occur
    }

    @Test
    public void doTriggerScriptTests() throws Exception
    {
        _saveRowsTimes = new ArrayList<>();
        weightValidationTest();
        arrivalDepartureTest();
        assignmentTest();
        birthTest();
        bloodTest();
        chargesTest();
        clinicalRemarksTest();
        clinicalObservationsTest();
        clinpathRunsTest();
        deathsTest();
        demographicsTest();
        drugTest();
        housingTest();
        irregularObsTest();
        mensesTest();
        necropsyTest();
        pregnanciesTest();
        prenatalDeathsTest();
        problemListTest();
        tbTestsTest();
        treatmentOrdersTest();
        cageObservationsTest();
        cageTest();

        calculateAverage();
    }

    @LogMethod
    private void createTestSubjects()
    {
        try
        {
            JSONObject extraContext = getExtraContext();

            String[] fields;
            Object[][] data;
            JSONObject insertCommand;

            //insert into demographics
            log("Creating test subjects");
            fields = new String[]{"Id", "Species", "Birth", "Gender", "date"};
            data = new Object[][]{
                    {SUBJECTS[0], "Rhesus", (new Date()).toString(), "m", new Date()},
                    {SUBJECTS[1], "Cynomolgus", (new Date()).toString(), "m", new Date()},
                    {SUBJECTS[2], "Rhesus", (new Date()).toString(), "f", new Date()}
            };
            insertCommand = _apiHelper.prepareInsertCommand("study", "demographics", FIELD_LSID, fields, data);
            _apiHelper.doSaveRows(DATA_ADMIN.getEmail(), Collections.singletonList(insertCommand), extraContext, true);

            //used as initial dates
            Date pastDate1 = _tf.parse("2012-01-03 09:30");
            Date pastDate2 = _tf.parse("2012-05-03 19:20");

            //set housing
            log("Creating initial housing records");
            fields = new String[]{"Id", "date", "enddate", "room", "cage"};
            data = new Object[][]{
                    {SUBJECTS[0], pastDate1, pastDate2, ROOMS[0], CAGES[0]},
                    {SUBJECTS[1], pastDate1, pastDate2, ROOMS[0], CAGES[0]},
                    {SUBJECTS[1], pastDate2, null, ROOMS[2], CAGES[2]}
            };
            insertCommand = _apiHelper.prepareInsertCommand("study", "Housing", FIELD_LSID, fields, data);
            _apiHelper.doSaveRows(DATA_ADMIN.getEmail(), Collections.singletonList(insertCommand), extraContext, true);

            //set a base weight
            log("Setting initial weights");
            fields = new String[]{"Id", "date", "weight", "QCStateLabel"};
            data = new Object[][]{
                    {SUBJECTS[0], pastDate2, 10.5, EHRQCState.COMPLETED.label},
                    {SUBJECTS[0], new Date(), 12, EHRQCState.COMPLETED.label}
            };
            insertCommand = _apiHelper.prepareInsertCommand("study", "Weight", FIELD_LSID, fields, data);
            _apiHelper.doSaveRows(DATA_ADMIN.getEmail(), Collections.singletonList(insertCommand), extraContext, true);

            //set assignment
            log("Setting initial assignments");
            fields = new String[]{"Id", "date", "enddate", "project"};
            data = new Object[][]{
                    {SUBJECTS[0], pastDate1, pastDate2, PROJECTS[0]},
                    {SUBJECTS[1], pastDate1, pastDate2, PROJECTS[0]},
                    {SUBJECTS[1], pastDate2, null, PROJECTS[2]}
            };
            insertCommand = _apiHelper.prepareInsertCommand("study", "Assignment", FIELD_LSID, fields, data);
            _apiHelper.doSaveRows(DATA_ADMIN.getEmail(), Collections.singletonList(insertCommand), extraContext, true);
        }
        catch (ParseException e)
        {
            throw new RuntimeException(e);
        }
    }

    @LogMethod
    private void weightValidationTest()
    {
        //expect weight out of range
        Object[][] data = new Object[][]{
                {SUBJECTS[0], new Date(), null, null, 120, EHRQCState.IN_PROGRESS.label, null, null, "recordID"}
        };
        Map<String, List<String>> expected = new HashMap<>();
        expected.put("weight", Arrays.asList("Weight above the allowable value of 35.0 kg for Rhesus", "Weight gain of >10%. Last weight 12 kg"));
        testValidationMessage("study", "weight", weightFields, data, expected);

        //expect INFO for +10% diff
        data = new Object[][]{
                {SUBJECTS[0], new Date(), null, null, 20, EHRQCState.IN_PROGRESS.label, null, null, "recordID"}
        };
        expected = new HashMap<>();
        expected.put("weight", Collections.singletonList("Weight gain of >10%. Last weight 12 kg"));
        testValidationMessage("study", "weight", weightFields, data, expected);

        //expect INFO for -10% diff
        data = new Object[][]{
                {SUBJECTS[0], new Date(), null, null, 5, EHRQCState.IN_PROGRESS.label, null, null, "recordID"}
        };
        expected = new HashMap<>();
        expected.put("weight", Collections.singletonList("Weight drop of >10%. Last weight 12 kg"));
        testValidationMessage("study", "weight", weightFields, data, expected);

        //TODO: test error threshold
    }

    @LogMethod
    private void arrivalDepartureTest()
    {
        try
        {
            //TODO: test update of calculated status field w/ multiple IDs being inserted

            String subject = SUBJECTS[3] + _randomGenerator.nextInt(100);

            //insert into arrival should cascade insert into demographics + housing
            String[] arrivalFields = {"Id", "date", FIELD_QCSTATELABEL, FIELD_OBJECTID, FIELD_LSID, "_recordid",
                    "birth", "initialRoom", "initialCage", "dam", "sire", "gender", "species"};
            Object[][] data = new Object[][]{
                    {subject, new Date(), EHRQCState.COMPLETED.label, null, null, "recordID",
                            EHRClientAPIHelper.DATE_SUBSTITUTION, ROOMS[0], CAGES[0], "dam", "sire", "m", "Rhesus"}
            };
            _apiHelper.doSaveRows(DATA_ADMIN.getEmail(), Collections.singletonList(_apiHelper.prepareInsertCommand("study", "arrival", FIELD_LSID, arrivalFields, data)), getExtraContext(), true);

            //verify demographics record created with correct field values
            SelectRowsCommand cmd = new SelectRowsCommand("study", "demographics");
            cmd.setFilters(Collections.singletonList(new Filter("Id", subject)));
            Connection cn = new Connection(getBaseURL(), PasswordUtil.getUsername(), PasswordUtil.getPassword());
            SelectRowsResponse resp = cmd.execute(cn, getContainerPath());
            assertEquals("Id not inserted into demographics", 1, resp.getRowCount().intValue());
            Map<String, Object> row = resp.getRows().get(0);
            assertEquals("Dam not set", "dam", row.get("dam"));
            assertEquals("Sire not set", "sire", row.get("sire"));
            assertEquals("Status not correct", "Alive", row.get("calculated_status"));

            //verify cascade insert into housing
            cmd = new SelectRowsCommand("study", "housing");
            cmd.setFilters(Collections.singletonList(new Filter("Id", subject)));
            resp = cmd.execute(cn, getContainerPath());
            assertEquals("Id not inserted into housing", 1, resp.getRowCount().intValue());
            row = resp.getRows().get(0);
            assertEquals("Room not set", ROOMS[0], row.get("room"));
            assertEquals("Cage not set", CAGES[0], row.get("cage"));

            //enter a departure
            String[] departureFields = {"Id", "date", FIELD_QCSTATELABEL, FIELD_OBJECTID, FIELD_LSID, "_recordid", "destination"};
            data = new Object[][]{
                    {subject, new Date(), EHRQCState.COMPLETED.label, null, null, "recordID", "destination"}
            };
            _apiHelper.doSaveRows(DATA_ADMIN.getEmail(), Collections.singletonList(_apiHelper.prepareInsertCommand("study", "departure", FIELD_LSID, departureFields, data)), getExtraContext(), true);

            //verify demographics record created with correct field values
            cmd = new SelectRowsCommand("study", "demographics");
            cmd.setFilters(Collections.singletonList(new Filter("Id", subject)));
            resp = cmd.execute(cn, getContainerPath());
            row = resp.getRows().get(0);
            assertEquals("Status not correct", "Shipped", row.get("calculated_status"));

        }
        catch (IOException e)
        {
            throw new RuntimeException(e);
        }
        catch (CommandException e)
        {
            throw new RuntimeException(e);
        }
    }

    public static JSONObject getExtraContext()
    {
        try
        {
            JSONObject extraContext = new JSONObject();
            extraContext.put("errorThreshold", "ERROR");
            extraContext.put("skipIdFormatCheck", true);
            extraContext.put("allowAnyId", true);
            extraContext.put("targetQC", "Completed");
            extraContext.put("isLegacyFormat", true);
            return extraContext;
        }
        catch (JSONException e)
        {
            throw new RuntimeException(e);
        }
    }

    private void assignmentTest()
    {
        //verify
        // removeTimeFromDate(),
        //  set release for row.enddate && row.projectedRelease
        //nnumber of allowed animals



    }

    private void birthTest()
    {
        //on public, insert into demographics for center births
        //also weight
    }

    private void bloodTest()
    {
        //on public, do clinpath inserts
        //on after insert: request emails

        //on insert: blood volume
    }

    private void chargesTest()
    {
        //calculate total price
    }

    private void clinicalRemarksTest()
    {
        //if(!row.so && !row.a && !row.p && !row.remark)
    }

    private void clinicalObservationsTest()
    {
        //require observation or remark
    }

    private void clinpathRunsTest()
    {
        //check clinpath_tests

        //send request
    }

    private void deathsTest()
    {
        //tattoo validation
    }

    private void demographicsTest()
    {
        //update status field
    }

    private void drugTest()
    {
//        if(row.begindate)
//            row.date = row.begindate;
        //verify math for conc
    }

    private void housingTest()
    {
        //verify existing animals in cage
        //on public: enforce only 1 active per animal

        //verify cagemates set
    }

    private void irregularObsTest()
    {
        //verify female for mens

        //verify location set
    }

    private void mensesTest()
    {
        //verify is female
    }

    private void necropsyTest()
    {
        //verify caseno is unique

    }

    private void pregnanciesTest()
    {
        //verify is female
    }

    private void prenatalDeathsTest()
    {
        //TODO
    }

    private void problemListTest()
    {
        //verify problem # incremented
        //verify remote date from time / enddate
    }

    private void tbTestsTest()
    {
        //setting of missing results
    }

    private void treatmentOrdersTest()
    {
        //math around amount
    }

    private void cageObservationsTest()
    {
        //test cascade insert
        //setting of no_observations

    }

    private void cageTest()
    {
        //verify padding of digits
    }

    private void testValidationMessage(String schemaName, String queryName, String[] fields, Object[][] data, Map<String, List<String>> expectedErrors)
    {
        expectedErrors.put("_validateOnly", Collections.singletonList("ERROR: Ignore this error"));
        try
        {
            log("Testing validation for table: " + schemaName + "." + queryName);

            JSONObject extraContext = getExtraContext();
            extraContext.put("errorThreshold", "INFO");
            extraContext.put("validateOnly", true); //a flag to force failure
            extraContext.put("targetQC", EHRQCState.IN_PROGRESS.label);

            JSONObject insertCommand = _apiHelper.prepareInsertCommand(schemaName, queryName, FIELD_LSID, fields, data);
            String response = _apiHelper.doSaveRows(DATA_ADMIN.getEmail(), Collections.singletonList(insertCommand), extraContext, false);
            Map<String, List<String>> errors = _apiHelper.processResponse(response);

            //JSONHelper.compareMap()
            assertEquals("Incorrect number of fields have errors", expectedErrors.keySet().size(), errors.keySet().size());
            for (String field : expectedErrors.keySet())
            {
                assertEquals("No errors found for field: " + field, true, errors.containsKey(field));
                List<String> expectedErrs = expectedErrors.get(field);
                List<String> errs = errors.get(field);

                log("Expected " + expectedErrs.size() + " errors for field " + field);
                assertEquals("Wrong number of errors found for field: " + field + "; " + StringUtils.join(errs, "; "), expectedErrs.size(), errs.size());
                for (String e : expectedErrs)
                {
                    boolean success = errs.remove(e);
                    assertTrue("Error not found for field: " + field + ".  Missing error is: " + e, success);
                }
                assertEquals("Unexpected error found for field: " + field + ".  They are: " + StringUtils.join(errs, "; "), 0, errs.size());
            }

        }
        catch (JSONException e)
        {
            throw new RuntimeException(e);
        }
    }

    @LogMethod
    private void testUserAgainstAllStates(@LoggedParam EHRUser user) throws Exception
    {
        JSONObject extraContext = new JSONObject();
        extraContext.put("errorThreshold", "ERROR");
        extraContext.put("skipIdFormatCheck", true);
        extraContext.put("allowAnyId", true);
        String response;

        //maintain list of insert/update times for interest
        _saveRowsTimes = new ArrayList<>();

        //test insert
        Object[][] insertData = {weightData1};
        insertData[0][Arrays.asList(weightFields).indexOf(FIELD_OBJECTID)] = null;
        insertData[0][Arrays.asList(weightFields).indexOf(FIELD_LSID)] = null;
        JSONObject insertCommand = _apiHelper.prepareInsertCommand("study", "Weight", FIELD_LSID, weightFields, insertData);

        for (EHRQCState qc : EHRQCState.values())
        {
            extraContext.put("targetQC", qc.label);
            boolean successExpected = successExpected(user.getRole(), qc, "insert");
            log("Testing role: " + user.getRole().name() + " with insert of QCState: " + qc.label);
            _apiHelper.doSaveRows(user.getEmail(), Collections.singletonList(insertCommand), extraContext, successExpected);
        }
        calculateAverage();

        //then update.  update is fun b/c we need to test many QCState combinations.  Updating a row from 1 QCstate to a new QCState technically
        //requires update Permission on the original QCState, plus insert Permission into the new QCState
        for (EHRQCState originalQc : EHRQCState.values())
        {
            // first create an initial row as a data admin
            UUID objectId = UUID.randomUUID();
            Object[][] originalData = {weightData1};
            originalData[0][Arrays.asList(weightFields).indexOf(FIELD_QCSTATELABEL)] = originalQc.label;
            extraContext.put("targetQC", originalQc.label);
            originalData[0][Arrays.asList(weightFields).indexOf(FIELD_OBJECTID)] = objectId.toString();
            JSONObject initialInsertCommand = _apiHelper.prepareInsertCommand("study", "Weight", FIELD_LSID, weightFields, originalData);
            log("Inserting initial record for update test, with initial QCState of: " + originalQc.label);
            response = _apiHelper.doSaveRows(DATA_ADMIN.getEmail(), Collections.singletonList(initialInsertCommand), extraContext, true);

            String lsid = getLsidFromResponse(response);
            originalData[0][Arrays.asList(weightFields).indexOf(FIELD_LSID)] = lsid;

            //then try to update to all other QCStates
            for (EHRQCState qc : EHRQCState.values())
            {
                boolean successExpected = originalQc.equals(qc) ? successExpected(user.getRole(), originalQc, "update") : successExpected(user.getRole(), originalQc, "update") && successExpected(user.getRole(), qc, "insert");
                log("Testing role: " + user.getRole().name() + " with update from QCState " + originalQc.label + " to: " + qc.label);
                originalData[0][Arrays.asList(weightFields).indexOf(FIELD_QCSTATELABEL)] = qc.label;
                JSONObject updateCommand = _apiHelper.prepareUpdateCommand("study", "Weight", FIELD_LSID, weightFields, originalData, null);
                extraContext.put("targetQC", qc.label);
                _apiHelper.doSaveRows(user.getEmail(), Collections.singletonList(updateCommand), extraContext, successExpected);

                if (successExpected)
                {
                    log("Resetting QCState of record to: " + originalQc.label);
                    originalData[0][Arrays.asList(weightFields).indexOf(FIELD_QCSTATELABEL)] = originalQc.label;
                    extraContext.put("targetQC", originalQc.label);
                    updateCommand = _apiHelper.prepareUpdateCommand("study", "Weight", FIELD_LSID, weightFields, originalData, null);
                    _apiHelper.doSaveRows(DATA_ADMIN.getEmail(), Collections.singletonList(updateCommand), extraContext, true);
                }
            }
        }

        //log the average save time
        //TODO: eventually we should set a threshold and assert we dont exceed it
        calculateAverage();
    }

    private String getLsidFromResponse(String response)
    {
        try
        {
            JSONObject o = new JSONObject(response);
            if (o.has("exception"))
            {
                //TODO
                throw new RuntimeException("NYI");
            }
            else if (o.has("result"))
            {
                return o.getJSONArray("result").getJSONObject(0).getJSONArray("rows").getJSONObject(0).getJSONObject("values").getString(FIELD_LSID);
            }
            return null;
        }
        catch (JSONException e)
        {
            throw new RuntimeException(e);
        }
    }

    private boolean successExpected(EHRRole role, EHRQCState qcState, String permission)
    {
        // Expand to other request types once we start testing them. Insert only for now.
        return allowedActions.contains(new Permission(role, qcState, permission));
    }

    protected static final ArrayList<Permission> allowedActions = new ArrayList<Permission>()
    {
        {
            // Data Admin - Users with this role are permitted to make any edits to datasets
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.ABNORMAL, "insert"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.COMPLETED, "insert"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.DELETE_REQUESTED, "insert"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.IN_PROGRESS, "insert"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.REQUEST_APPROVED, "insert"));
            //add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.REQUEST_COMPLETE, "insert"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.REQUEST_DENIED, "insert"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.REQUEST_CANCELLED, "insert"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.REQUEST_PENDING, "insert"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.REQUEST_SAMPLE_DELIVERED, "insert"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.REVIEW_REQUIRED, "insert"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.SCHEDULED, "insert"));

            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.ABNORMAL, "update"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.COMPLETED, "update"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.DELETE_REQUESTED, "update"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.IN_PROGRESS, "update"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.REQUEST_APPROVED, "update"));
            //add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.REQUEST_COMPLETE, "update"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.REQUEST_DENIED, "update"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.REQUEST_CANCELLED, "update"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.REQUEST_PENDING, "update"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.REQUEST_SAMPLE_DELIVERED, "update"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.REVIEW_REQUIRED, "update"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.SCHEDULED, "update"));

            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.ABNORMAL, "delete"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.COMPLETED, "delete"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.DELETE_REQUESTED, "delete"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.IN_PROGRESS, "delete"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.REQUEST_APPROVED, "delete"));
            //add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.REQUEST_COMPLETE, "delete"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.REQUEST_DENIED, "delete"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.REQUEST_CANCELLED, "delete"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.REQUEST_PENDING, "delete"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.REQUEST_SAMPLE_DELIVERED, "delete"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.REVIEW_REQUIRED, "delete"));
            add(new Permission(EHRRole.DATA_ADMIN, EHRQCState.SCHEDULED, "delete"));

            //for the purpose of tests, full updater is essentially the save as data admin.  they just lack admin privs, which we dont really test
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.ABNORMAL, "insert"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.COMPLETED, "insert"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.DELETE_REQUESTED, "insert"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.IN_PROGRESS, "insert"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.REQUEST_APPROVED, "insert"));
            //add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.REQUEST_COMPLETE, "insert"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.REQUEST_DENIED, "insert"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.REQUEST_CANCELLED, "insert"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.REQUEST_PENDING, "insert"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.REQUEST_SAMPLE_DELIVERED, "insert"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.REVIEW_REQUIRED, "insert"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.SCHEDULED, "insert"));

            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.ABNORMAL, "update"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.COMPLETED, "update"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.DELETE_REQUESTED, "update"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.IN_PROGRESS, "update"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.REQUEST_APPROVED, "update"));
            //add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.REQUEST_COMPLETE, "update"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.REQUEST_DENIED, "update"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.REQUEST_CANCELLED, "update"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.REQUEST_PENDING, "update"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.REQUEST_SAMPLE_DELIVERED, "update"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.REVIEW_REQUIRED, "update"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.SCHEDULED, "update"));

            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.ABNORMAL, "delete"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.COMPLETED, "delete"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.DELETE_REQUESTED, "delete"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.IN_PROGRESS, "delete"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.REQUEST_APPROVED, "delete"));
            //add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.REQUEST_COMPLETE, "delete"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.REQUEST_DENIED, "delete"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.REQUEST_CANCELLED, "delete"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.REQUEST_PENDING, "delete"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.REQUEST_SAMPLE_DELIVERED, "delete"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.REVIEW_REQUIRED, "delete"));
            add(new Permission(EHRRole.FULL_UPDATER, EHRQCState.SCHEDULED, "delete"));

            // Requester - Users with this role are permitted to submit requests, but not approve them
            add(new Permission(EHRRole.REQUESTER, EHRQCState.REQUEST_PENDING, "insert"));
            add(new Permission(EHRRole.REQUESTER, EHRQCState.REQUEST_SAMPLE_DELIVERED, "insert"));
            add(new Permission(EHRRole.REQUESTER, EHRQCState.REQUEST_PENDING, "update"));
            add(new Permission(EHRRole.REQUESTER, EHRQCState.REQUEST_SAMPLE_DELIVERED, "update"));
            add(new Permission(EHRRole.REQUESTER, EHRQCState.REQUEST_DENIED, "insert"));
            add(new Permission(EHRRole.REQUESTER, EHRQCState.REQUEST_DENIED, "update"));
            add(new Permission(EHRRole.REQUESTER, EHRQCState.REQUEST_CANCELLED, "insert"));
            add(new Permission(EHRRole.REQUESTER, EHRQCState.REQUEST_CANCELLED, "update"));

            // Full Submitter - Users with this role are permitted to submit and approve records.  They cannot modify public data.
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.ABNORMAL, "insert"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.COMPLETED, "insert"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.DELETE_REQUESTED, "insert"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.IN_PROGRESS, "insert"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.REQUEST_APPROVED, "insert"));
            //add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.REQUEST_COMPLETE, "insert"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.REQUEST_DENIED, "insert"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.REQUEST_CANCELLED, "insert"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.REQUEST_PENDING, "insert"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.REQUEST_SAMPLE_DELIVERED, "insert"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.REVIEW_REQUIRED, "insert"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.SCHEDULED, "insert"));

            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.ABNORMAL, "update"));
            //add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.COMPLETED, "update"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.DELETE_REQUESTED, "update"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.IN_PROGRESS, "update"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.REQUEST_APPROVED, "update"));
            //add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.REQUEST_COMPLETE, "update"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.REQUEST_DENIED, "update"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.REQUEST_CANCELLED, "update"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.REQUEST_PENDING, "update"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.REQUEST_SAMPLE_DELIVERED, "update"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.REVIEW_REQUIRED, "update"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.SCHEDULED, "update"));

            //add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.ABNORMAL, "delete"));
            //add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.COMPLETED, "delete"));
            //add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.DELETE_REQUESTED, "delete"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.IN_PROGRESS, "delete"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.REQUEST_APPROVED, "delete"));
            //add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.REQUEST_COMPLETE, "delete"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.REQUEST_DENIED, "delete"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.REQUEST_CANCELLED, "delete"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.REQUEST_PENDING, "delete"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.REQUEST_SAMPLE_DELIVERED, "delete"));
            //add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.REVIEW_REQUIRED, "delete"));
            add(new Permission(EHRRole.FULL_SUBMITTER, EHRQCState.SCHEDULED, "delete"));

            // Basic Submitter - Users with this role are permitted to submit and edit non-public records, but cannot alter public ones
            add(new Permission(EHRRole.BASIC_SUBMITTER, EHRQCState.IN_PROGRESS, "insert"));
            add(new Permission(EHRRole.BASIC_SUBMITTER, EHRQCState.REVIEW_REQUIRED, "insert"));
            add(new Permission(EHRRole.BASIC_SUBMITTER, EHRQCState.REQUEST_PENDING, "insert"));
            add(new Permission(EHRRole.BASIC_SUBMITTER, EHRQCState.REQUEST_SAMPLE_DELIVERED, "insert"));
            add(new Permission(EHRRole.BASIC_SUBMITTER, EHRQCState.DELETE_REQUESTED, "insert"));
            //request approved: none
            add(new Permission(EHRRole.BASIC_SUBMITTER, EHRQCState.REQUEST_DENIED, "insert"));
            add(new Permission(EHRRole.BASIC_SUBMITTER, EHRQCState.REQUEST_CANCELLED, "insert"));
            //add(new Permission(EHRRole.BASIC_SUBMITTER, EHRQCState.REQUEST_COMPLETE, "insert"));
            add(new Permission(EHRRole.BASIC_SUBMITTER, EHRQCState.SCHEDULED, "insert"));

            add(new Permission(EHRRole.BASIC_SUBMITTER, EHRQCState.IN_PROGRESS, "update"));
            add(new Permission(EHRRole.BASIC_SUBMITTER, EHRQCState.REVIEW_REQUIRED, "update"));
            add(new Permission(EHRRole.BASIC_SUBMITTER, EHRQCState.REQUEST_PENDING, "update"));
            add(new Permission(EHRRole.BASIC_SUBMITTER, EHRQCState.REQUEST_SAMPLE_DELIVERED, "update"));
            add(new Permission(EHRRole.BASIC_SUBMITTER, EHRQCState.DELETE_REQUESTED, "update"));
            //request approved: none
            add(new Permission(EHRRole.BASIC_SUBMITTER, EHRQCState.REQUEST_DENIED, "update"));
            add(new Permission(EHRRole.BASIC_SUBMITTER, EHRQCState.REQUEST_CANCELLED, "update"));
            //add(new Permission(EHRRole.BASIC_SUBMITTER, EHRQCState.REQUEST_COMPLETE, "update"));
            add(new Permission(EHRRole.BASIC_SUBMITTER, EHRQCState.SCHEDULED, "update"));

            add(new Permission(EHRRole.BASIC_SUBMITTER, EHRQCState.IN_PROGRESS, "delete"));

            // Request Admin is basically the same as Full Submitter, except they also have RequestAdmin Permission, which is not currently tested.  It is primarily used in UI
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.ABNORMAL, "insert"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.COMPLETED, "insert"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.DELETE_REQUESTED, "insert"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.IN_PROGRESS, "insert"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.REQUEST_APPROVED, "insert"));
            //add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.REQUEST_COMPLETE, "insert"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.REQUEST_DENIED, "insert"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.REQUEST_CANCELLED, "insert"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.REQUEST_PENDING, "insert"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.REQUEST_SAMPLE_DELIVERED, "insert"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.REVIEW_REQUIRED, "insert"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.SCHEDULED, "insert"));

            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.ABNORMAL, "update"));
            //add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.COMPLETED, "update"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.DELETE_REQUESTED, "update"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.IN_PROGRESS, "update"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.REQUEST_APPROVED, "update"));
            //add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.REQUEST_COMPLETE, "update"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.REQUEST_DENIED, "update"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.REQUEST_CANCELLED, "update"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.REQUEST_PENDING, "update"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.REQUEST_SAMPLE_DELIVERED, "update"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.REVIEW_REQUIRED, "update"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.SCHEDULED, "update"));

            //add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.ABNORMAL, "delete"));
            //add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.COMPLETED, "delete"));
            //add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.DELETE_REQUESTED, "delete"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.IN_PROGRESS, "delete"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.REQUEST_APPROVED, "delete"));
            //add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.REQUEST_COMPLETE, "delete"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.REQUEST_DENIED, "delete"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.REQUEST_CANCELLED, "delete"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.REQUEST_PENDING, "delete"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.REQUEST_SAMPLE_DELIVERED, "delete"));
            //add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.REVIEW_REQUIRED, "delete"));
            add(new Permission(EHRRole.REQUEST_ADMIN, EHRQCState.SCHEDULED, "delete"));
        }
    };

    private void calculateAverage()
    {
        if (_saveRowsTimes.size() == 0)
            return;

        long sum = 0;
        for(long time : _saveRowsTimes){
            sum += time;
        }

        //calculate average of all elements
        long average = sum / _saveRowsTimes.size();
        log("The average save time per record was : " + average + " ms");

        _saveRowsTimes = new ArrayList<>();
    }
}
