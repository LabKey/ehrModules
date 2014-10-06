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
import org.json.JSONObject;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.labkey.remoteapi.Connection;
import org.labkey.remoteapi.query.Filter;
import org.labkey.remoteapi.query.InsertRowsCommand;
import org.labkey.remoteapi.query.SaveRowsResponse;
import org.labkey.remoteapi.query.SelectRowsCommand;
import org.labkey.remoteapi.query.SelectRowsResponse;
import org.labkey.remoteapi.query.Sort;
import org.labkey.test.Locator;
import org.labkey.test.TestTimeoutException;
import org.labkey.test.TestFileUtils;
import org.labkey.test.categories.EHR;
import org.labkey.test.categories.External;
import org.labkey.test.categories.ONPRC;
import org.labkey.test.util.DataRegionTable;
import org.labkey.test.util.EHRClientAPIHelper;
import org.labkey.test.util.Ext4Helper;
import org.labkey.test.util.LogMethod;
import org.labkey.test.util.PasswordUtil;
import org.labkey.test.util.RReportHelper;
import org.labkey.test.util.ext4cmp.Ext4CmpRef;
import org.labkey.test.util.ext4cmp.Ext4ComboRef;
import org.labkey.test.util.ext4cmp.Ext4FieldRef;
import org.labkey.test.util.ext4cmp.Ext4GridRef;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;

import java.io.File;
import java.io.FileFilter;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Category({External.class, EHR.class, ONPRC.class})
public class ONPRC_EHRTest extends AbstractONPRC_EHRTest
{
    protected String PROJECT_NAME = "ONPRC_EHR_TestProject";
    private EHRClientAPIHelper _apiHelper = new EHRClientAPIHelper(this, getContainerPath());
    private SimpleDateFormat _tf = new SimpleDateFormat("yyyy-MM-dd kk:mm");

    private final String RHESUS = "RHESUS MACAQUE";
    private final String INDIAN = "Indian";

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

    @BeforeClass
    @LogMethod
    public static void doSetup() throws Exception
    {
        ONPRC_EHRTest initTest = (ONPRC_EHRTest)getCurrentTest();

        initTest.initProject();
        //initTest.createTestSubjects();
        RReportHelper rHelper = new RReportHelper(initTest);
        rHelper.ensureRConfig();
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

    //@Test
    public void bloodVolumeApiTest()
    {
        //TODO: blood draw volumes


    }

    @Test
    public void birthStatusApiTest() throws Exception
    {
        //first create record for dam, along w/ animal group and SPF status.  we expect this to automatically create a demographics record w/ the right status
        JSONObject extraContext = EHRApiTest.getExtraContext();
        extraContext.remove("targetQC");
        extraContext.remove("isLegacyFormat");

        final String damId1 = "Dam1";
        final String offspringId1 = "Offspring1";
        final String offspringId2 = "Offspring2";
        final String offspringId3 = "Offspring3";
        final String offspringId4 = "Offspring4";
        final String offspringId5 = "Offspring5";
        final String offspringId6 = "Offspring6";
        final String offspringId7 = "Offspring7";
        final String offspringId8 = "Offspring8";

        log("deleting existing records");
        cleanRecords(damId1, offspringId1, offspringId2, offspringId3, offspringId4, offspringId5, offspringId6, offspringId7, offspringId8);
        ensureNonrestrictedFlagExists();

        final Date dam1Birth = new Date();

        //insert into birth
        log("Creating Dam");
        _apiHelper.doSaveRows(DATA_ADMIN.getEmail(), Collections.singletonList(_apiHelper.prepareInsertCommand("study", "birth", "lsid",
                new String[]{"Id", "Date", "gender", "QCStateLabel"},
                new Object[][]{
                        {damId1, _tf.format(dam1Birth), "f", "In Progress"},
                }
        )), extraContext, true);

        //record is draft, so we shouldnt have a demographics record
        Assert.assertFalse("demographics row was created for dam1", _apiHelper.doesRowExist("study", "demographics", new Filter("Id", damId1, Filter.Operator.EQUAL)));

        //update to completed, expect to find demographics record.
        SelectRowsCommand select1 = new SelectRowsCommand("study", "birth");
        select1.addFilter(new Filter("Id", damId1, Filter.Operator.EQUAL));
        final String damLsid = (String)select1.execute(_apiHelper.getConnection(), getContainerPath()).getRows().get(0).get("lsid");
        _apiHelper.updateRow("study", "birth", new HashMap<String, Object>()
        {{
            put("lsid", damLsid);
            put("QCStateLabel", "Completed");
        }}, false);
        Assert.assertTrue("demographics row was not created for dam1", _apiHelper.doesRowExist("study", "demographics", new Filter("Id", damId1, Filter.Operator.EQUAL)));

        //update record to get a geographic_origin, which we expect to get entered into demographics
        _apiHelper.updateRow("study", "birth", new HashMap<String, Object>(){
            {
                put("lsid", damLsid);
                put("Id/demographics/geographic_origin", INDIAN);
                put("Id/demographics/species", RHESUS);
            }
        }, false);

        SelectRowsCommand select2 = new SelectRowsCommand("study", "demographics");
        select2.addFilter(new Filter("Id", damId1, Filter.Operator.EQUAL));
        Assert.assertEquals("geographic_origin was not updated", INDIAN, select2.execute(_apiHelper.getConnection(), getContainerPath()).getRows().get(0).get("geographic_origin"));
        Assert.assertEquals("species was not updated", RHESUS, select2.execute(_apiHelper.getConnection(), getContainerPath()).getRows().get(0).get("species"));
        Assert.assertEquals("gender was not updated", "f", select2.execute(_apiHelper.getConnection(), getContainerPath()).getRows().get(0).get("gender"));
        Assert.assertEquals("calculated_status was not set properly", "Alive", select2.execute(_apiHelper.getConnection(), getContainerPath()).getRows().get(0).get("calculated_status"));

        //now add SPF status + group for dam.
        String spfStatus = "SPF 9";
        final String spfFlag = getOrCreateSpfFlag(spfStatus);
        InsertRowsCommand insertRowsCommand = new InsertRowsCommand("study", "flags");
        insertRowsCommand.addRow(new HashMap<String, Object>(){
            {
                put("Id", damId1);
                put("date", dam1Birth);
                put("flag", spfFlag);
            }
        });
        insertRowsCommand.execute(_apiHelper.getConnection(), getContainerPath());

        String groupName = "TestGroup1";
        final Integer groupId = getOrCreateGroup(groupName);
        InsertRowsCommand insertRowsCommand2 = new InsertRowsCommand("study", "animal_group_members");
        insertRowsCommand2.addRow(new HashMap<String, Object>(){
            {
                put("Id", damId1);
                put("date", dam1Birth);
                put("groupId", groupId);
            }
        });
        insertRowsCommand2.execute(_apiHelper.getConnection(), getContainerPath());

        //now enter children, testing different modes.
        // offspring 1 is not public, so we dont expect a demographics record.  will update to completed
        // offspring 2 is public, so expect a demographics record, and SPF/groups to be copied
        // offspring 3 is born dead, non-final.  will update to completed
        // offspring 4 is born dead, finalized
        // offspring 5 is entered w/o the dam initially, as non-final.  will update to completed and enter dam at same time
        // offspring 6 is is entered w/o the dam initially, finalized.  will update with dam
        // offspring 7, same as 1, except we leave species/geographic origin blank and expect dam's demographics to be copied to child
        // offspring 8, same as 1, except we leave species/geographic origin blank and and expect dam's demographics to be copied to child
        Date birthDate = new Date();
        Double weight = 2.3;
        String room1 = "Room1";
        String cage1 = "A1";
        String bornDead = "Born Dead/Not Born";
        InsertRowsCommand insertRowsCommand1 = new InsertRowsCommand("study", "birth");
        List<String> birthFields = Arrays.asList("Id", "Date", "birth_condition", "Id/demographics/species", "Id/demographics/geographic_origin", "gender", "room", "cage", "dam", "sire", "weight", "wdate", "QCStateLabel");
        insertRowsCommand1.addRow(_apiHelper.createHashMap(birthFields, new Object[]{offspringId1, _tf.format(birthDate), "Live Birth", RHESUS, INDIAN, "f", room1, cage1, damId1, null, weight, birthDate, "In Progress"}));
        insertRowsCommand1.addRow(_apiHelper.createHashMap(birthFields, new Object[]{offspringId2, _tf.format(birthDate), "Live Birth", RHESUS, INDIAN, "f", room1, cage1, damId1, null, weight, birthDate, "Completed"}));
        insertRowsCommand1.addRow(_apiHelper.createHashMap(birthFields, new Object[]{offspringId3, _tf.format(birthDate), bornDead, RHESUS, INDIAN, "f", room1, cage1, damId1, null, weight, birthDate, "In Progress"}));
        insertRowsCommand1.addRow(_apiHelper.createHashMap(birthFields, new Object[]{offspringId4, _tf.format(birthDate), bornDead, RHESUS, INDIAN, "f", room1, cage1, damId1, null, weight, birthDate, "Completed"}));
        insertRowsCommand1.addRow(_apiHelper.createHashMap(birthFields, new Object[]{offspringId5, _tf.format(birthDate), "Live Birth", RHESUS, INDIAN, "f", room1, cage1, null, null, weight, birthDate, "In Progress"}));
        insertRowsCommand1.addRow(_apiHelper.createHashMap(birthFields, new Object[]{offspringId6, _tf.format(birthDate), "Live Birth", RHESUS, INDIAN, "f", room1, cage1, null, null, weight, birthDate, "Completed"}));
        insertRowsCommand1.addRow(_apiHelper.createHashMap(birthFields, new Object[]{offspringId7, _tf.format(birthDate), "Live Birth", null, null, "f", room1, cage1, damId1, null, weight, birthDate, "In Progress"}));
        insertRowsCommand1.addRow(_apiHelper.createHashMap(birthFields, new Object[]{offspringId8, _tf.format(birthDate), "Live Birth", null, null, "f", room1, cage1, damId1, null, weight, birthDate, "Completed"}));
        insertRowsCommand1.setTimeout(0);
        SaveRowsResponse insertRowsResp = insertRowsCommand1.execute(_apiHelper.getConnection(), getContainerPath());

        final Map<String, String> lsidMap = new HashMap<>();
        for (Map<String, Object> row : insertRowsResp.getRows())
        {
            lsidMap.put((String)row.get("Id"), (String)row.get("lsid"));
        }

        testBirthRecordStatus(offspringId1);
        testBirthRecordStatus(offspringId2);
        testBirthRecordStatus(offspringId3);
        testBirthRecordStatus(offspringId4);
        testBirthRecordStatus(offspringId5);
        testBirthRecordStatus(offspringId6);
        testBirthRecordStatus(offspringId7);
        testBirthRecordStatus(offspringId8);

        //do updates:
        log("updating records");

        _apiHelper.updateRow("study", "birth", new HashMap<String, Object>()
        {
            {
                put("lsid", lsidMap.get(offspringId1));
                put("QCStateLabel", "Completed");
            }
        }, false);
        testBirthRecordStatus(offspringId1);

        _apiHelper.updateRow("study", "birth", new HashMap<String, Object>()
        {
            {
                put("lsid", lsidMap.get(offspringId3));
                put("QCStateLabel", "Completed");
            }
        }, false);
        testBirthRecordStatus(offspringId3);

        _apiHelper.updateRow("study", "birth", new HashMap<String, Object>()
        {
            {
                put("lsid", lsidMap.get(offspringId5));
                put("QCStateLabel", "Completed");
                put("dam", damId1);
            }
        }, false);
        testBirthRecordStatus(offspringId5);

        _apiHelper.updateRow("study", "birth", new HashMap<String, Object>()
        {
            {
                put("lsid", lsidMap.get(offspringId6));
                put("QCStateLabel", "Completed");
                put("dam", damId1);
            }
        }, false);
        testBirthRecordStatus(offspringId6);

        _apiHelper.updateRow("study", "birth", new HashMap<String, Object>()
        {
            {
                put("lsid", lsidMap.get(offspringId7));
                put("QCStateLabel", "Completed");
            }
        }, false);
        testBirthRecordStatus(offspringId7);

    }

    private void cleanRecords(String... ids) throws Exception
    {
        _apiHelper.deleteAllRecords("study", "birth", new Filter("Id", StringUtils.join(ids, ";"), Filter.Operator.IN));
        _apiHelper.deleteAllRecords("study", "housing", new Filter("Id", StringUtils.join(ids, ";"), Filter.Operator.IN));
        _apiHelper.deleteAllRecords("study", "flags", new Filter("Id", StringUtils.join(ids, ";"), Filter.Operator.IN));
        _apiHelper.deleteAllRecords("study", "assignment", new Filter("Id", StringUtils.join(ids, ";"), Filter.Operator.IN));
        _apiHelper.deleteAllRecords("study", "demographics", new Filter("Id", StringUtils.join(ids, ";"), Filter.Operator.IN));
        _apiHelper.deleteAllRecords("study", "weight", new Filter("Id", StringUtils.join(ids, ";"), Filter.Operator.IN));
        _apiHelper.deleteAllRecords("study", "animal_group_members", new Filter("Id", StringUtils.join(ids, ";"), Filter.Operator.IN));
    }

    private void testBirthRecordStatus(String offspringId) throws Exception
    {
        log("inspecting id: " + offspringId);

        //first query birth record
        SelectRowsCommand select1 = new SelectRowsCommand("study", "birth");
        select1.addFilter(new Filter("Id", offspringId, Filter.Operator.EQUAL));
        select1.setColumns(Arrays.asList("Id", "date", "QCState/PublicData", "birth_condition/alive", "dam", "room", "cage", "weight", "wdate"));
        SelectRowsResponse resp = select1.execute(_apiHelper.getConnection(), getContainerPath());

        Assert.assertEquals("Birth record not created: " + offspringId, 1, resp.getRowCount().intValue());

        boolean isPublic = (Boolean)resp.getRows().get(0).get("QCState/PublicData");
        String damId = (String)resp.getRows().get(0).get("dam");
        boolean isAlive = resp.getRows().get(0).get("birth_condition/alive") == null ? true : (Boolean)resp.getRows().get(0).get("birth_condition/alive");
        String room = (String)resp.getRows().get(0).get("room");
        String cage = (String)resp.getRows().get(0).get("cage");
        Double weight = (Double)resp.getRows().get(0).get("weight");
        Date weightDate = (Date)resp.getRows().get(0).get("wdate");
        Date birthDate = (Date)resp.getRows().get(0).get("date");

        SelectRowsCommand select2 = new SelectRowsCommand("study", "demographics");
        select2.addFilter(new Filter("Id", offspringId, Filter.Operator.EQUAL));
        select2.setColumns(Arrays.asList("Id", "date", "species", "geographic_origin", "gender", "death"));
        SelectRowsResponse demographicsResp = select2.execute(_apiHelper.getConnection(), getContainerPath());

        SelectRowsCommand conditionSelect = new SelectRowsCommand("study", "flags");
        conditionSelect.addFilter(new Filter("Id", offspringId, Filter.Operator.EQUAL));
        conditionSelect.addFilter(new Filter("flag/category", "Condition", Filter.Operator.EQUAL));
        conditionSelect.addFilter(new Filter("flag/value", "Nonrestricted", Filter.Operator.EQUAL));

        SelectRowsCommand groupSelect = new SelectRowsCommand("study", "animal_group_members");
        groupSelect.addFilter(new Filter("Id", offspringId, Filter.Operator.EQUAL));

        SelectRowsCommand spfFlagSelect = new SelectRowsCommand("study", "flags");
        spfFlagSelect.addFilter(new Filter("Id", offspringId, Filter.Operator.EQUAL));
        spfFlagSelect.addFilter(new Filter("flag/category", "SPF", Filter.Operator.EQUAL));

        SelectRowsCommand housingSelect = new SelectRowsCommand("study", "housing");
        housingSelect.addFilter(new Filter("Id", offspringId, Filter.Operator.EQUAL));

        SelectRowsCommand weightSelect = new SelectRowsCommand("study", "weight");
        weightSelect.addFilter(new Filter("Id", offspringId, Filter.Operator.EQUAL));

        if (!isAlive)
        {
            //if the animal was born dead, we expect these flags to be endded automatically
            groupSelect.addFilter(new Filter("enddate", null, Filter.Operator.NON_BLANK));
            spfFlagSelect.addFilter(new Filter("enddate", null, Filter.Operator.NON_BLANK));
            conditionSelect.addFilter(new Filter("enddate", null, Filter.Operator.NON_BLANK));
            housingSelect.addFilter(new Filter("enddate", null, Filter.Operator.NON_BLANK));
        }

        if (isPublic)
        {
            //we expect demographics record to be present
            Assert.assertEquals(1, demographicsResp.getRowCount().intValue());
            Map<String, Object> demographicsRow = demographicsResp.getRows().get(0);

            // we expect species/gender to have been copied through once record is public, except for the case of dam being NULL
            if (damId != null)
            {
                Assert.assertEquals(RHESUS, demographicsRow.get("species"));
                Assert.assertEquals(INDIAN, demographicsRow.get("geographic_origin"));
            }

            //expect death date
            if (!isAlive)
            {
                Assert.assertTrue(demographicsRow.get("death") != null);
            }

            //always expect condition = Nonrestricted
            Assert.assertEquals(1, conditionSelect.execute(_apiHelper.getConnection(), getContainerPath()).getRowCount().intValue());

            //test copy of SPF/groups
            if (damId != null)
            {
                //we expect infant's SPF + groups to match dam.  NOTE: filters added above for enddate, based on whether alive or not
                Assert.assertEquals(1, groupSelect.execute(_apiHelper.getConnection(), getContainerPath()).getRowCount().intValue());
                Assert.assertEquals(1, spfFlagSelect.execute(_apiHelper.getConnection(), getContainerPath()).getRowCount().intValue());
            }
            else
            {
                //we do not expect flags or groups
                Assert.assertEquals(0, groupSelect.execute(_apiHelper.getConnection(), getContainerPath()).getRowCount().intValue());
                Assert.assertEquals(0, spfFlagSelect.execute(_apiHelper.getConnection(), getContainerPath()).getRowCount().intValue());
            }

            //housing creation
            if (room != null)
            {
                Assert.assertEquals(1, housingSelect.execute(_apiHelper.getConnection(), getContainerPath()).getRowCount().intValue());
                Assert.assertEquals(room, housingSelect.execute(_apiHelper.getConnection(), getContainerPath()).getRows().get(0).get("room"));
                Assert.assertEquals(cage, housingSelect.execute(_apiHelper.getConnection(), getContainerPath()).getRows().get(0).get("cage"));
                Assert.assertEquals(birthDate, housingSelect.execute(_apiHelper.getConnection(), getContainerPath()).getRows().get(0).get("date"));
            }

            if (weight != null)
            {
                Assert.assertEquals(1, weightSelect.execute(_apiHelper.getConnection(), getContainerPath()).getRowCount().intValue());
                Assert.assertEquals(weight, weightSelect.execute(_apiHelper.getConnection(), getContainerPath()).getRows().get(0).get("weight"));
                Assert.assertEquals(weightDate, weightSelect.execute(_apiHelper.getConnection(), getContainerPath()).getRows().get(0).get("date"));
            }
        }
        else
        {
            //we do not expect demographic record to exist
            Assert.assertEquals(0, demographicsResp.getRowCount().intValue());

            //we do not expect flags or groups
            Assert.assertEquals(0, groupSelect.execute(_apiHelper.getConnection(), getContainerPath()).getRowCount().intValue());
            Assert.assertEquals(0, spfFlagSelect.execute(_apiHelper.getConnection(), getContainerPath()).getRowCount().intValue());
        }
    }

    private Integer getOrCreateGroup(final String name) throws Exception
    {
        SelectRowsCommand select1 = new SelectRowsCommand("ehr", "animal_groups");
        select1.addFilter(new Filter("name", name, Filter.Operator.EQUAL));
        SelectRowsResponse resp = select1.execute(_apiHelper.getConnection(), getContainerPath());
        Integer groupId = resp.getRowCount().intValue() == 0 ? null : (Integer)resp.getRows().get(0).get("rowid");
        if (groupId == null)
        {
            InsertRowsCommand insertRowsCommand = new InsertRowsCommand("ehr", "animal_groups");
            insertRowsCommand.addRow(new HashMap<String, Object>(){
                {
                    put("name", name);
                }
            });

            SaveRowsResponse saveRowsResponse = insertRowsCommand.execute(_apiHelper.getConnection(), getContainerPath());
            groupId = ((Long)saveRowsResponse.getRows().get(0).get("rowid")).intValue();
        }

        return groupId;
    }

    private void ensureGroupMember(final int groupId, final String animalId) throws Exception
    {
        SelectRowsCommand select1 = new SelectRowsCommand("study", "animal_group_members");
        select1.addFilter(new Filter("groupId", groupId, Filter.Operator.EQUAL));
        select1.addFilter(new Filter("Id", animalId, Filter.Operator.EQUAL));

        SelectRowsResponse resp = select1.execute(_apiHelper.getConnection(), getContainerPath());
        if (resp.getRowCount().intValue() == 0)
        {
            InsertRowsCommand insertRowsCommand = new InsertRowsCommand("study", "animal_group_members");
            insertRowsCommand.addRow(new HashMap<String, Object>(){
                {
                    put("Id", animalId);
                    put("date", new Date());
                    put("groupId", groupId);
                }
            });

            insertRowsCommand.execute(_apiHelper.getConnection(), getContainerPath());
        }
    }

    private String getOrCreateSpfFlag(final String name) throws Exception
    {
        SelectRowsCommand select1 = new SelectRowsCommand("ehr_lookups", "flag_values");
        select1.addFilter(new Filter("category", "SPF", Filter.Operator.EQUAL));
        select1.addFilter(new Filter("value", name, Filter.Operator.EQUAL));
        SelectRowsResponse resp = select1.execute(_apiHelper.getConnection(), getContainerPath());

        String objectid = resp.getRowCount().intValue() == 0 ? null : (String)resp.getRows().get(0).get("objectid");
        if (objectid == null)
        {
            InsertRowsCommand insertRowsCommand = new InsertRowsCommand("ehr_lookups", "flag_values");
            insertRowsCommand.addRow(new HashMap<String, Object>(){
                {
                    put("category", "SPF");
                    put("value", name);
                    put("objectid", null);  //will get set on server
                }
            });

            SaveRowsResponse saveRowsResponse = insertRowsCommand.execute(_apiHelper.getConnection(), getContainerPath());
            objectid = (String)saveRowsResponse.getRows().get(0).get("objectid");
        }

        return objectid;
    }

    private String ensureNonrestrictedFlagExists() throws Exception
    {
        SelectRowsCommand select1 = new SelectRowsCommand("ehr_lookups", "flag_values");
        select1.addFilter(new Filter("category", "Condition", Filter.Operator.EQUAL));
        select1.addFilter(new Filter("value", "Nonrestricted", Filter.Operator.EQUAL));
        SelectRowsResponse resp = select1.execute(_apiHelper.getConnection(), getContainerPath());

        String objectid = resp.getRowCount().intValue() == 0 ? null : (String)resp.getRows().get(0).get("objectid");
        if (objectid == null)
        {
            InsertRowsCommand insertRowsCommand = new InsertRowsCommand("ehr_lookups", "flag_values");
            insertRowsCommand.addRow(new HashMap<String, Object>(){
                {
                    put("category", "Condition");
                    put("value", "Nonrestricted");
                    put("objectid", null);  //will get set on server
                }
            });

            SaveRowsResponse saveRowsResponse = insertRowsCommand.execute(_apiHelper.getConnection(), getContainerPath());
            objectid = (String)saveRowsResponse.getRows().get(0).get("objectid");
        }

        return objectid;
    }

    ///@Test
    public void assignmentApiTest()
    {
        //TODO: add assignmentsInTransaction, protocol counts

        //release condition

        //updateAnimalCondition

        //setting of enddatefinalized, datefinalized

    }

    ///@Test
    public void animalGroupsApiTest()
    {
        //TODO: getOverlappingGroupAssignments

    }

    ///@Test
    public void projectProtocolApiTest()
    {
        //TODO: auto-assignment of IDs



    }


    ///@Test
    public void flagsApiTest()
    {
        //TODO: housing condition

        //auto-closing of active flags


    }

    ///@Test
    public void drugApiTest()
    {
        //TODO: custom errors
    }

    ///@Test
    public void arrivalApiTest()
    {
        //TODO: validation on housing

        // auto-add quarantine flag

        //creation of housing, demographics status
    }

    ///@Test
    public void housingApiTest()
    {
        //TODO: size validation

        //auto-update of dividers

        //open-ended, dead ID

        //dead Id, non-open ended

        //mark requested completed

        //auto-set housingCondition, housingType on row
    }

    @Test
    public void doCustomActionsTests() throws Exception
    {
        //colony overview
        goToProjectHome();
        waitAndClickAndWait(Locator.tagContainingText("a", "Colony Overview"));

        //NOTE: depending on the test order and whether demographics records were created, so we test this
        EHRClientAPIHelper apiHelper = new EHRClientAPIHelper(this, getProjectName());
        if (apiHelper.getRowCount("study", "demographics") > 0)
        {
            waitForElement(Locator.tagContainingText("b", "Current Population:"), WAIT_FOR_JAVASCRIPT * 3);
        }
        else
        {
            waitForElement(Locator.tagContainingText("div", "No animals were found"), WAIT_FOR_JAVASCRIPT);
        }

        waitAndClick(Locator.tagContainingText("span", "SPF Colony"));
        waitForElement(Locator.tagContainingText("b", "SPF 9 (ESPF)"), WAIT_FOR_JAVASCRIPT * 2);

        waitAndClick(Locator.tagContainingText("span", "Housing Summary"));
        //NOTE: depending on test order, there may or may not be housing records created
        waitForElement(Locator.tagContainingText("div", "No buildings were found"), WAIT_FOR_JAVASCRIPT * 2);

        waitAndClick(Locator.tagContainingText("span", "Utilization Summary"));
        if (apiHelper.getRowCount("study", "demographics") > 0)
        {
            waitForElement(Locator.tagContainingText("b", "Colony Utilization:"), WAIT_FOR_JAVASCRIPT * 2);
        }
        else
        {
            waitForElement(Locator.tagContainingText("div", "No records found"), WAIT_FOR_JAVASCRIPT * 2);
        }

        waitAndClick(Locator.tagContainingText("span", "Clinical Case Summary"));
        waitForElement(Locator.tagContainingText("div", "There are no open cases or problems"), WAIT_FOR_JAVASCRIPT * 2);

        //bulk history export
        log("testing bulk history export");
        goToProjectHome();
        waitAndClickAndWait(Locator.tagContainingText("a", "Bulk History Export"));
        waitForElement(Locator.tagContainingText("label", "Enter Animal Id(s)"));
        Ext4FieldRef.getForLabel(this, "Enter Animal Id(s)").setValue("12345;23432\nABCDE");
        Ext4FieldRef.getForLabel(this, "Show Snapshot Only").setValue(true);
        Ext4FieldRef.getForLabel(this, "Redact Information").setValue(true);
        clickAndWait(Ext4Helper.Locators.ext4Button("Submit"));
        assertElementPresent(Locator.tagContainingText("b", "12345"));
        assertElementPresent(Locator.tagContainingText("b", "23432"));
        assertElementPresent(Locator.tagContainingText("b", "ABCDE"));
        assertElementNotPresent(Locator.tagContainingText("b", "Chronological History").notHidden()); //check hide history
        assertElementNotPresent(Locator.tagContainingText("label", "Projects").notHidden()); //check redaction

        //exposure report
        log("testing exposure export");
        goToProjectHome();
        waitAndClickAndWait(Locator.tagContainingText("a", "Exposure Report"));
        waitForElement(Locator.tagContainingText("label", "Enter Animal Id"));
        Ext4FieldRef.getForLabel(this, "Enter Animal Id").setValue("12345");
        clickAndWait(Ext4Helper.Locators.ext4Button("Submit"));
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
        String groupName = "A TestGroup";
        int groupId = getOrCreateGroup(groupName);
        ensureGroupMember(groupId, MORE_ANIMAL_IDS[0]);
        ensureGroupMember(groupId, MORE_ANIMAL_IDS[1]);

        goToProjectHome();
        waitAndClickAndWait(Locator.tagContainingText("a", "Animal Groups"));
        waitForElement(Locator.tagContainingText("span", "Active Groups"));
        DataRegionTable dr = new DataRegionTable("query", this);
        dr.clickLink(0, dr.getColumn("Name"));
        DataRegionTable membersTable = new DataRegionTable(_helper.getAnimalHistoryDataRegionName("Group Members"), this);
        Assert.assertEquals(2, membersTable.getDataRowCount());

        //more reports
        goToProjectHome();
        waitAndClickAndWait(Locator.tagContainingText("a", "More Reports"));
        waitForElement(Locator.tagContainingText("a", "View Summary of Clinical Tasks"));

        //printable reports
        goToProjectHome();
        waitAndClickAndWait(Locator.tagContainingText("a", "Printable Reports"));
        waitForElement(Ext4Helper.Locators.ext4Button("Print Version"));
    }

    @Test
    public void testPedigreeReport() throws Exception
    {
        createBirthRecords();
        goToProjectHome();
        waitAndClickAndWait(Locator.tagContainingText("a", "Animal History"));
        _helper.waitForCmp("textfield[itemId=subjArea]");
        String id = ID_PREFIX + 1;
        getAnimalHistorySubjField().setValue(id);
        waitAndClick(Ext4Helper.ext4Tab("Genetics"));
        waitAndClick(Ext4Helper.ext4Tab("Pedigree Plot"));

        waitForElement(Locator.tagContainingText("span", "Pedigree Plot - " + id), WAIT_FOR_JAVASCRIPT * 3);
        assertTextNotPresent("Error executing command");
        Assert.assertTrue(isTextPresent("Console output"));
    }

    @Test
    public void doLabworkResultEntryTest() throws Exception
    {
        _helper.goToTaskForm("Lab Results");
        _helper.getExt4FieldForFormSection("Task", "Title").setValue("Test Task 1");

        Ext4GridRef panelGrid = _helper.getExt4GridForFormSection("Panels / Services");

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
            Ext4GridRef panelGrid2 = _helper.getExt4GridForFormSection("Panels / Services");
            assert panelGrid2.getId().equals(panelGrid.getId());

            _helper.addRecordToGrid(panelGrid);
            panelGrid.setGridCell(panelIdx, "Id", MORE_ANIMAL_IDS[(panelIdx % MORE_ANIMAL_IDS.length)]);
            panelGrid.setGridCellJS(panelIdx, "servicerequested", arr[0]);

            if (arr[1] != null && arr.length == 4)
            {
                Assert.assertEquals("Tissue not set properly", arr[1], panelGrid.getFieldValue(panelIdx, "tissue"));
            }
            else if (arr.length > 4)
            {
                //for some panels, tissue will not have a default.  therefore we set one and verify it gets copied into the results downstream
                panelGrid.setGridCellJS(panelIdx, "tissue", arr[4]);
                arr[1] = arr[4];

                Assert.assertEquals("Tissue not set properly", arr[1], panelGrid.getFieldValue(panelIdx, "tissue"));
            }

            Assert.assertEquals("Category not set properly", arr[2], panelGrid.getFieldValue(panelIdx, "type"));

            validatePanelEntry(arr[0], arr[1], arr[2], arr[3], panelIdx == panels.length, panelIdx);

            panelIdx++;
        }


        _helper.discardForm();
    }

    @LogMethod
    public void validatePanelEntry(String panelName, String tissue, String title, String lookupTable, boolean doDeletePanel, int panelRowIdx) throws Exception
    {
        SelectRowsCommand cmd = new SelectRowsCommand("ehr_lookups", "labwork_panels");
        cmd.addFilter(new Filter("servicename", panelName));
        cmd.addSort(new Sort("sort_order"));
        SelectRowsResponse srr = cmd.execute(new Connection(getBaseURL(), PasswordUtil.getUsername(), PasswordUtil.getPassword()), getContainerPath());
        List<Map<String, Object>> expectedRows = srr.getRows();

        waitAndClick(Ext4Helper.ext4Tab(title));
        Ext4GridRef grid = _helper.getExt4GridForFormSection(title);
        waitForElement(Locator.id(grid.getId()).notHidden());

        grid.clickTbarButton("Copy From Above");
        waitForElement(Ext4Helper.ext4Window("Copy From Above"));
        Ext4CmpRef submitBtn = _ext4Helper.queryOne("button[text='Submit']", Ext4CmpRef.class);
        submitBtn.waitForEnabled();
        click(Ext4Helper.Locators.ext4Button("Submit"));

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
                        Assert.assertEquals("Wrong units for test: " + testname, units, grid.getFieldValue(rowIdx, "units"));
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
                    Assert.assertEquals("Test Id value did not match after key navigation", origVal, newVal);
                }

                //test cascade update + delete
                Ext4GridRef panelGrid = _helper.getExt4GridForFormSection("Panels / Services");
                panelGrid.setGridCell(panelRowIdx, "Id", MORE_ANIMAL_IDS[0]);
                for (int j = 1; j <= rowCount; j++)
                {
                    Assert.assertEquals(MORE_ANIMAL_IDS[0], grid.getFieldValue(j, "Id"));
                }

                if (doDeletePanel)
                {
                    waitAndClick(panelGrid.getRow(panelRowIdx));
                    panelGrid.clickTbarButton("Delete Selected");
                    waitForElement(Ext4Helper.ext4Window("Confirm"));
                    assertTextPresent("along with the " + rowCount + " results associated with them");
                    waitAndClick(Ext4Helper.ext4Window("Confirm").append(Ext4Helper.Locators.ext4Button("Yes")));
                }
                else
                {
                    grid.clickTbarButton("Select All");
                    grid.waitForSelected(grid.getRowCount());
                    grid.clickTbarButton("Delete Selected");
                    waitForElement(Ext4Helper.ext4Window("Confirm"));
                    waitAndClick(Ext4Helper.Locators.ext4Button("Yes"));
                }

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
        log("creating birth records");

        if (_hasCreatedBirthRecords)
        {
            log("birth records already created, skipping");
            return;
        }

        //note: these should cascade insert into demographics
        EHRClientAPIHelper apiHelper = new EHRClientAPIHelper(this, getProjectName());
        String schema = "study";
        String query = "birth";
        String parentageQuery = "parentage";

        int i = 0;
        Set<String> createdIds = new HashSet<>();
        while (i < 10)
        {
            i++;
            Map<String, Object> row = new HashMap();
            row.put("Id", ID_PREFIX + i);
            createdIds.add(ID_PREFIX + i);
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

        //force caching of demographics on new IDs.
        cacheIds(createdIds);

        _hasCreatedBirthRecords = true;
    }

    @Test
    public void doExamEntryTest() throws Exception
    {
        _helper.goToTaskForm("Exams/Cases");
        _helper.getExt4FieldForFormSection("Task", "Title").setValue("Test Exam 1");

        waitAndClick(_helper.getDataEntryButton("More Actions"));
        _ext4Helper.clickExt4MenuItem("Apply Form Template");
        waitForElement(Ext4Helper.ext4Window("Apply Template To Form"));
        waitForTextToDisappear("Loading...");
        String templateName1 = "Bone Marrow Biopsy";
        String templateName2 = "Achilles Tendon Repair";
        waitForElement(Ext4Helper.ext4Window("Apply Template To Form").append(Locator.tagContainingText("label", "Choose Template")));
        Ext4ComboRef templateCombo = Ext4ComboRef.getForLabel(this, "Choose Template");
        templateCombo.waitForStoreLoad();
        _ext4Helper.selectComboBoxItem("Choose Template:", Ext4Helper.TextMatchTechnique.CONTAINS, templateName1);
        _ext4Helper.selectComboBoxItem("Choose Template:", Ext4Helper.TextMatchTechnique.CONTAINS, templateName2);

        //these should not be shown
        Assert.assertFalse(Ext4FieldRef.isFieldPresent(this, "Task:"));
        Assert.assertFalse(Ext4FieldRef.isFieldPresent(this, "Animal Details"));

        Ext4ComboRef combo = Ext4ComboRef.getForLabel(this, "SOAP");
        if (!templateName2.equals(combo.getDisplayValue()))
        {
            log("combo value not set initially, retrying");
            combo.setComboByDisplayValue(templateName2);
        }
        sleep(100); //allow field to cascade

        Assert.assertEquals("Section template not set", templateName2, Ext4ComboRef.getForLabel(this, "SOAP").getDisplayValue());
        Assert.assertEquals("Section template not set", "Vitals", Ext4ComboRef.getForLabel(this, "Observations").getDisplayValue());
        String obsTemplate = (String) Ext4ComboRef.getForLabel(this, "Observations").getValue();

        waitAndClick(Ext4Helper.Locators.ext4Button("Submit"));
        waitForElementToDisappear(Ext4Helper.ext4Window("Apply Template To Form"));

        _helper.getExt4FieldForFormSection("SOAP", "Id").setValue(MORE_ANIMAL_IDS[0]);

        //observations section
        waitAndClick(Ext4Helper.ext4Tab("Observations"));
        Ext4GridRef observationsGrid = _helper.getExt4GridForFormSection("Observations");
        SelectRowsCommand cmd = new SelectRowsCommand("ehr", "formtemplaterecords");
        cmd.addFilter(new Filter("templateid", obsTemplate));
        cmd.addSort(new Sort("rowid"));
        SelectRowsResponse srr = cmd.execute(new Connection(getBaseURL(), PasswordUtil.getUsername(), PasswordUtil.getPassword()), getContainerPath());

        int expectedObsRows = srr.getRowCount().intValue();
        observationsGrid.waitForRowCount(expectedObsRows);
        Assert.assertEquals("Incorrect row count", expectedObsRows, observationsGrid.getRowCount());
        for (int i=0;i<expectedObsRows;i++)
        {
            Assert.assertEquals("Id not copied properly", MORE_ANIMAL_IDS[0], observationsGrid.getFieldValue(1 + i, "Id"));
        }

        int i = 1;
        for (Map<String, Object> row : srr.getRows())
        {
            JSONObject json = new JSONObject((String)row.get("json"));
            Assert.assertEquals(json.getString("category"), observationsGrid.getFieldValue(i, "category"));
            i++;
        }

        //weight section
        waitAndClick(Ext4Helper.ext4Tab("Weights"));
        Ext4GridRef weightGrid = _helper.getExt4GridForFormSection("Weights");
        Assert.assertEquals("Incorrect row count", 0, weightGrid.getRowCount());
        _helper.addRecordToGrid(weightGrid);
        Assert.assertEquals("Id not copied property", MORE_ANIMAL_IDS[0], weightGrid.getFieldValue(1, "Id"));
        Double weight = 5.3;
        weightGrid.setGridCell(1, "weight", weight.toString());

        //procedures section
        waitAndClick(Ext4Helper.ext4Tab("Procedures"));
        Ext4GridRef proceduresGrid = _helper.getExt4GridForFormSection("Procedures");
        Assert.assertEquals("Incorrect row count", 0, proceduresGrid.getRowCount());
        _helper.addRecordToGrid(proceduresGrid);
        Assert.assertEquals("Id not copied property", MORE_ANIMAL_IDS[0], proceduresGrid.getFieldValue(1, "Id"));

        //medications section
        waitAndClick(Ext4Helper.ext4Tab("Medications"));
        Ext4GridRef drugGrid = _helper.getExt4GridForFormSection("Medications/Treatments Given");
        Assert.assertEquals("Incorrect row count", 7, drugGrid.getRowCount());

        Assert.assertEquals(drugGrid.getFieldValue(1, "code"), "E-721X0");
        Assert.assertEquals(drugGrid.getFieldValue(1, "route"), "IM");
        Assert.assertEquals(drugGrid.getFieldValue(1, "dosage"), 25L);

        //verify formulary used
        drugGrid.setGridCellJS(1, "code", "E-YY035");
        Assert.assertEquals("Formulary not applied", "PO", drugGrid.getFieldValue(1, "route"));
        Assert.assertEquals("Formulary not applied", 8L, drugGrid.getFieldValue(1, "dosage"));
        Assert.assertEquals("Formulary not applied", "mg", drugGrid.getFieldValue(1, "amount_units"));

        Ext4GridRef ordersGrid = _helper.getExt4GridForFormSection("Medication/Treatment Orders");
        Assert.assertEquals("Incorrect row count", 3, ordersGrid.getRowCount());
        Assert.assertEquals("E-YY732", ordersGrid.getFieldValue(3, "code"));   //tramadol
        Assert.assertEquals("PO", ordersGrid.getFieldValue(3, "route"));
        Assert.assertEquals(50L, ordersGrid.getFieldValue(3, "concentration"));
        Assert.assertEquals("mg/tablet", ordersGrid.getFieldValue(3, "conc_units"));
        Assert.assertEquals(3L, ordersGrid.getFieldValue(3, "dosage"));
        Assert.assertEquals("mg/kg", ordersGrid.getFieldValue(3, "dosage_units"));

        //note: amount calculation testing handled in surgery test

        //blood draws
        waitAndClick(Ext4Helper.ext4Tab("Blood Draws"));
        Ext4GridRef bloodGrid = _helper.getExt4GridForFormSection("Blood Draws");
        Assert.assertEquals("Incorrect row count", 0, bloodGrid.getRowCount());
        bloodGrid.clickTbarButton("Templates");
        waitAndClick(Ext4Helper.ext4MenuItem("Apply Template").notHidden());
        waitForElement(Ext4Helper.Locators.window("Apply Template"));
        waitAndClick(Ext4Helper.Locators.ext4Button("Close"));

        Date date = DateUtils.round(new Date(), Calendar.DATE);
        Date date2 = DateUtils.addDays(date, 1);

        _helper.applyTemplate(bloodGrid, "CBC and Chem", false, date);
        bloodGrid.waitForRowCount(2);

        _helper.applyTemplate(bloodGrid, "CBC and Chem", true, date2);
        _helper.toggleBulkEditField("Remark");
        String remark = "The Remark";
        Ext4FieldRef.getForLabel(this, "Remark").setValue(remark);
        waitAndClick(Ext4Helper.Locators.ext4Button("Submit"));
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

        Ext4GridRef weightGrid = _helper.getExt4GridForFormSection("Weights");
        weightGrid.clickTbarButton("Add Batch");
        waitForElement(Ext4Helper.ext4Window("Choose Animals"));
        Ext4FieldRef.getForLabel(this, "Id(s)").setValue(StringUtils.join(MORE_ANIMAL_IDS, ";"));
        waitAndClick(Ext4Helper.ext4Window("Choose Animals").append(Ext4Helper.Locators.ext4Button("Submit")));
        Assert.assertEquals(weightGrid.getRowCount(), MORE_ANIMAL_IDS.length);

        weightGrid.clickTbarButton("Add Batch");
        waitForElement(Ext4Helper.ext4Window("Choose Animals"));
        Ext4FieldRef.getForLabel(this, "Id(s)").setValue(StringUtils.join(MORE_ANIMAL_IDS, ";"));
        Ext4FieldRef.getForLabel(this, "Bulk Edit Values").setChecked(true);
        waitAndClick(Ext4Helper.ext4Window("Choose Animals").append(Ext4Helper.Locators.ext4Button("Submit")));
        waitForElement(Ext4Helper.ext4Window("Bulk Edit"));
        _helper.toggleBulkEditField("Weight (kg)");
        double weight = 4.0;
        Ext4FieldRef.getForLabel(this, "Weight (kg)").setValue(weight);
        waitAndClick(Ext4Helper.ext4Window("Bulk Edit").append(Ext4Helper.Locators.ext4Button("Submit")));
        Assert.assertEquals(weightGrid.getRowCount(), MORE_ANIMAL_IDS.length * 2);

        //verify IDs added in correct order
        for (int i=0;i<MORE_ANIMAL_IDS.length;i++)
        {
            Assert.assertEquals(weightGrid.getFieldValue(i + 1, "Id"), MORE_ANIMAL_IDS[i]);
            Assert.assertEquals(weightGrid.getFieldValue(MORE_ANIMAL_IDS.length + i + 1, "Id"), MORE_ANIMAL_IDS[i]);
        }

        Assert.assertEquals(weight, Double.parseDouble(weightGrid.getFieldValue(MORE_ANIMAL_IDS.length + 1, "weight").toString()), (weight / 10e6));

        //TB section
        Ext4GridRef tbGrid = _helper.getExt4GridForFormSection("TB Tests");
        tbGrid.clickTbarButton("Copy From Section");
        waitAndClick(Ext4Helper.ext4MenuItem("Weights"));
        waitForElement(Ext4Helper.ext4Window("Copy From Weights"));
        waitAndClick(Ext4Helper.Locators.ext4Button("Submit"));
        Assert.assertEquals(tbGrid.getRowCount(), MORE_ANIMAL_IDS.length);

        //sedations
        Ext4GridRef drugGrid = _helper.getExt4GridForFormSection("Medications/Treatments Given");
        drugGrid.clickTbarButton("Add Sedation(s)");
        waitAndClick(Ext4Helper.ext4MenuItem("Copy Ids From: Weights"));
        waitForElement(Ext4Helper.ext4Window("Add Sedations"));
        Ext4FieldRef.getForLabel(this, "Lot # (optional)").setValue("Lot");
        Ext4CmpRef.waitForComponent(this, "field[fieldName='weight']");
        waitForElement(Ext4Helper.ext4Window("Add Sedations").append(Locator.tagWithText("div", MORE_ANIMAL_IDS[4])));

        //set weights
        for (Ext4FieldRef field : _ext4Helper.componentQuery("field[fieldName='weight']", Ext4FieldRef.class))
        {
            field.setValue(4.1);
        }

        //verify dosage
        for (Ext4FieldRef field : _ext4Helper.componentQuery("field[fieldName='dosage']", Ext4FieldRef.class))
        {
            Assert.assertEquals((Object)10.0, field.getDoubleValue());
        }

        //verify amount
        for (Ext4FieldRef field : _ext4Helper.componentQuery("field[fieldName='amount']", Ext4FieldRef.class))
        {
            Assert.assertEquals((Object)40.0, field.getDoubleValue());
        }

        //modify rounding + dosage
        Ext4FieldRef dosageField = Ext4FieldRef.getForLabel(this, "Reset Dosage");
        dosageField.setValue(23);
        dosageField.eval("onTriggerClick()");
        for (Ext4FieldRef field : _ext4Helper.componentQuery("field[fieldName='dosage']", Ext4FieldRef.class))
        {
            Assert.assertEquals((Object)23.0, field.getDoubleValue());
        }

        for (Ext4FieldRef field : _ext4Helper.componentQuery("field[fieldName='amount']", Ext4FieldRef.class))
        {
            Assert.assertEquals((Object)95.0, field.getDoubleValue());
        }

        Ext4FieldRef roundingField = Ext4FieldRef.getForLabel(this, "Round To Nearest");
        roundingField.setValue(0.5);
        roundingField.eval("onTriggerClick()");
        for (Ext4FieldRef field : _ext4Helper.componentQuery("field[fieldName='amount']", Ext4FieldRef.class))
        {
            Assert.assertEquals(94.5, (Object)field.getDoubleValue());
        }

        //deselect the first row
        _ext4Helper.queryOne("field[fieldName='exclude']", Ext4FieldRef.class).setChecked(true);

        waitAndClick(Ext4Helper.Locators.ext4Button("Submit"));

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
        waitAndClick(Ext4Helper.ext4MenuItem("Medications/Treatments Given"));
        waitForElement(Ext4Helper.ext4Window("Copy From Medications/Treatments Given"));
        for (Ext4FieldRef field : _ext4Helper.componentQuery("field[fieldName='exclude']", Ext4FieldRef.class))
        {
            Assert.assertEquals(field.getValue(), true);
        }

        //deselect the first row
        _ext4Helper.queryOne("field[fieldName='exclude']", Ext4FieldRef.class).setChecked(false);

        Ext4FieldRef.getForLabel(this, "Bulk Edit Values").setChecked(true);
        waitAndClick(Ext4Helper.Locators.ext4Button("Submit"));
        waitForElement(Ext4Helper.ext4Window("Bulk Edit"));
        _helper.toggleBulkEditField("Performed By");
        Ext4FieldRef.getForLabel(this, "Performed By").setValue("me");
        waitAndClick(Ext4Helper.Locators.ext4Button("Submit"));
        waitForElementToDisappear(Ext4Helper.ext4Window("Bulk Edit"));

        for (int i=1;i<=5;i++)
        {
            Assert.assertEquals(getDisplayName(), tbGrid.getFieldValue(i, "performedby"));
            i++;
        }
        Assert.assertEquals("me", tbGrid.getFieldValue(6, "performedby"));

        Assert.assertEquals(tbGrid.getRowCount(), MORE_ANIMAL_IDS.length + 1);

        _helper.discardForm();
    }

    @Test
    public void testGeneticsPipeline() throws Exception
    {
        createBirthRecords();
        goToProjectHome();

        //retain pipeline log for debugging
        getArtifactCollector().addArtifactLocation(new File(TestFileUtils.getLabKeyRoot(), GENETICS_PIPELINE_LOG_PATH), new FileFilter()
        {
            @Override
            public boolean accept(File pathname)
            {
                return pathname.getName().endsWith(".log");
            }
        });

        waitAndClickAndWait(Locator.tagContainingText("a", "EHR Admin Page"));
        waitAndClickAndWait(Locator.tagContainingText("a", "Genetics Calculations"));
        waitAndClickAndWait(Ext4Helper.Locators.ext4Button("Run Now"));
        waitAndClickAndWait(Locator.lkButton("OK"));
        waitForPipelineJobsToComplete(2, "genetics pipeline", false);
    }

    @Test
    public void doNotificationTests()
    {
        setupNotificationService();

        goToProjectHome();
        waitAndClickAndWait(Locator.tagContainingText("a", "EHR Admin Page"));
        waitAndClickAndWait(Locator.tagContainingText("a", "Notification Admin"));

        _helper.waitForCmp("field[fieldLabel='Notification User']");

        Locator manageLink = Locator.tagContainingText("a", "Manage Subscribed Users/Groups").index(1);
        waitAndClick(manageLink);
        waitForElement(Ext4Helper.ext4Window("Manage Subscribed Users"));
        Ext4ComboRef.waitForComponent(this, "field[fieldLabel^='Add User Or Group']");
        Ext4ComboRef combo = Ext4ComboRef.getForLabel(this, "Add User Or Group");
        combo.waitForStoreLoad();
        _ext4Helper.selectComboBoxItem(Locator.id(combo.getId()), true, DATA_ADMIN.getEmail());
        waitForElement(Ext4Helper.Locators.ext4Button("Remove"));

        Ext4FieldRef.waitForComponent(this, "field[fieldLabel^='Add User Or Group']");
        combo = Ext4ComboRef.getForLabel(this, "Add User Or Group");
        combo.waitForStoreLoad();
        _ext4Helper.selectComboBoxItem(Locator.id(combo.getId()), true, BASIC_SUBMITTER.getEmail());
        waitForElement(Ext4Helper.Locators.ext4Button("Remove"), 2);
        waitAndClick(Ext4Helper.Locators.ext4Button("Close"));

        waitAndClick(manageLink);
        waitForElement(Ext4Helper.ext4Window("Manage Subscribed Users"));
        waitForElement(Locator.tagContainingText("div", DATA_ADMIN.getEmail()));
        waitForElement(Locator.tagContainingText("div", BASIC_SUBMITTER.getEmail()));
        waitForElement(Ext4Helper.Locators.ext4Button("Remove"));
        assertElementPresent(Ext4Helper.Locators.ext4Button("Remove"), 2);
        waitAndClick(Ext4Helper.Locators.ext4Button("Remove").index(0));  //remove admin
        waitAndClick(Ext4Helper.Locators.ext4Button("Close"));

        waitAndClick(manageLink);
        waitForElement(Ext4Helper.ext4Window("Manage Subscribed Users"));
        waitForElement(Locator.tagContainingText("div", BASIC_SUBMITTER.getEmail()));
        waitForElement(Ext4Helper.Locators.ext4Button("Remove"));
        assertElementPresent(Ext4Helper.Locators.ext4Button("Remove"), 1);
        waitAndClick(Ext4Helper.Locators.ext4Button("Close"));

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

    @Test
    public void observationsGridTest()
    {
        _helper.goToTaskForm("Bulk Clinical Entry");
        _helper.getExt4FieldForFormSection("Task", "Title").setValue("Test Observations 1");

        Ext4GridRef obsGrid = _helper.getExt4GridForFormSection("Observations");
        _helper.addRecordToGrid(obsGrid);

        // depending on the value set for category, a different editor should appear in the observations field
        obsGrid.setGridCell(1, "Id", MORE_ANIMAL_IDS[0]);
        obsGrid.setGridCell(1, "category", "BCS");

        //first BCS
        Ext4FieldRef editor = obsGrid.getActiveEditor(1, "observation");
        editor.getFnEval("this.expand()");
        Assert.assertEquals("ehr-simplecombo", (String)editor.getFnEval("return this.xtype"));
        waitForElement(Locator.tagContainingText("li", "1.5").notHidden().withClass("x4-boundlist-item"));
        waitForElement(Locator.tagContainingText("li", "4.5").notHidden().withClass("x4-boundlist-item"));
        obsGrid.completeEdit();

        //then alopecia
        obsGrid.setGridCell(1, "category", "Alopecia Score");
        editor = obsGrid.getActiveEditor(1, "observation");
        editor.getFnEval("this.expand()");
        Assert.assertEquals("ehr-simplecombo", (String)editor.getFnEval("return this.xtype"));
        waitForElement(Locator.tagContainingText("li", "1").notHidden().withClass("x4-boundlist-item"));
        waitForElement(Locator.tagContainingText("li", "4").notHidden().withClass("x4-boundlist-item"));
        assertElementNotPresent(Locator.tagContainingText("li", "4.5").notHidden().withClass("x4-boundlist-item"));
        obsGrid.completeEdit();

        //then pain score
        obsGrid.setGridCell(1, "category", "Pain Score");
        editor = obsGrid.getActiveEditor(1, "observation");
        Assert.assertEquals("ldk-numberfield", (String)editor.getFnEval("return this.xtype"));
        assertElementNotPresent(Locator.tagContainingText("li", "4").notHidden().withClass("x4-boundlist-item"));
        obsGrid.completeEdit();
        obsGrid.setGridCell(1, "observation", "10");

        //add new row
        _helper.addRecordToGrid(obsGrid);
        obsGrid.setGridCell(2, "Id", MORE_ANIMAL_IDS[0]);
        obsGrid.setGridCell(2, "category", "BCS");

        //verify BCS working on new row
        editor = obsGrid.getActiveEditor(2, "observation");
        editor.getFnEval("this.expand()");
        Assert.assertEquals("ehr-simplecombo", (String)editor.getFnEval("return this.xtype"));
        waitForElement(Locator.tagContainingText("li", "1.5").notHidden().withClass("x4-boundlist-item"));
        waitForElement(Locator.tagContainingText("li", "4.5").notHidden().withClass("x4-boundlist-item"));
        obsGrid.completeEdit();

        //now return to original row and make sure editor remembered
        editor = obsGrid.getActiveEditor(1, "observation");
        Assert.assertEquals("ldk-numberfield", (String)editor.getFnEval("return this.xtype"));
        assertElementNotPresent(Locator.tagContainingText("li", "4.5").notHidden().withClass("x4-boundlist-item"));
        obsGrid.completeEdit();
        Assert.assertEquals("10", obsGrid.getFieldValue(1, "observation"));

        _helper.discardForm();
    }

    //TODO: @Test
    public void clinicalRoundsTest()
    {

        //TODO: test cascade update + delete
    }

    //TODO: @Test
    public void surgicalRoundsTest()
    {
        //_helper.goToTaskForm("Surgical Rounds");

        //Ext4GridRef obsGrid = _helper.getExt4GridForFormSection("Observations");
        //_helper.addRecordToGrid(obsGrid);

        //TODO: test cascade update + delete

        //_helper.discardForm();
    }

    @Test
    public void pathologyTest()
    {
        _helper.goToTaskForm("Necropsy", false);

        _helper.getExt4FieldForFormSection("Necropsy", "Id").setValue(MORE_ANIMAL_IDS[1]);
        Ext4ComboRef procedureField = new Ext4ComboRef(_helper.getExt4FieldForFormSection("Necropsy", "Procedure").getId(), this);
        procedureField.setComboByDisplayValue("Necropsy & Histopathology Grade 2: Standard");

        Ext4FieldRef.getForLabel(this, "Case Number").clickTrigger();
        waitForElement(Ext4Helper.ext4Window("Create Case Number"));
        Ext4FieldRef.waitForField(this, "Prefix");
        Ext4FieldRef.getForLabel(this, "Year").setValue(2013);
        waitAndClick(Ext4Helper.ext4Window("Create Case Number").append(Ext4Helper.Locators.ext4ButtonEnabled("Submit")));
        final String caseNoBase = "2013A00";
        waitFor(new Checker()
        {
            @Override
            public boolean check()
            {
                return Ext4FieldRef.getForLabel(ONPRC_EHRTest.this, "Case Number").getValue().toString().startsWith(caseNoBase);
            }
        }, "Case Number field was not set", WAIT_FOR_JAVASCRIPT);
        Assert.assertTrue(Ext4FieldRef.getForLabel(this, "Case Number").getValue().toString().startsWith(caseNoBase));
        String caseNo = Ext4FieldRef.getForLabel(this, "Case Number").getValue().toString();

        // apply form template
        waitAndClick(Ext4Helper.Locators.ext4Button("Apply Form Template"));
        waitForElement(Ext4Helper.ext4Window("Apply Template To Form"));
        Ext4FieldRef.waitForField(this, "Diagnoses");
        Ext4ComboRef.getForLabel(this, "Choose Template").setComboByDisplayValue("Necropsy");
        sleep(100);
        Assert.assertEquals("Gross Findings", Ext4ComboRef.getForLabel(this, "Gross Findings").getDisplayValue());
        Assert.assertEquals("Necropsy", Ext4ComboRef.getForLabel(this, "Staff").getDisplayValue());
        waitAndClick(Ext4Helper.ext4Window("Apply Template To Form").append(Ext4Helper.Locators.ext4Button("Submit")));
        waitForElementToDisappear(Ext4Helper.ext4Window("Apply Template To Form"));

        //staff sections
        _ext4Helper.clickExt4Tab("Staff");
        Ext4GridRef staffGrid = _helper.getExt4GridForFormSection("Staff");
        staffGrid.waitForRowCount(3);

        //check gross findings second, because the above is a more reliable wait
        Assert.assertNotNull(StringUtils.trimToNull((String) _helper.getExt4FieldForFormSection("Gross Findings", "Notes").getValue()));

        //test SNOMED codes
        _ext4Helper.clickExt4Tab("Histologic Findings");
        Ext4GridRef histologyGrid = _helper.getExt4GridForFormSection("Histologic Findings");
        _helper.addRecordToGrid(histologyGrid, "Add Record");
        waitAndClick(histologyGrid.getCell(1, "codesRaw"));
        waitForElement(Ext4Helper.ext4Window("Manage SNOMED Codes"));
        Ext4ComboRef field = Ext4ComboRef.getForLabel(this, "Add Code");
        field.waitForEnabled();
        field.waitForStoreLoad();

        List<WebElement> visible = new ArrayList<>();
        for (WebElement element : getDriver().findElements(By.id(field.getId() + "-inputEl")))
        {
            if (element.isDisplayed())
            {
                visible.add(element);
            }
        }
        Assert.assertEquals(1, visible.size());

        visible.get(0).sendKeys("ketamine");
        visible.get(0).sendKeys(Keys.ENTER);
        String code1 = "Ketamine injectable (100mg/ml) (E-70590)";
        waitForElement(Locator.tagContainingText("div", code1));

        visible.get(0).sendKeys("heart");
        visible.get(0).sendKeys(Keys.ENTER);
        String code2 = "APEX OF HEART (T-32040)";
        waitForElement(Locator.tagContainingText("div", code2));
        Assert.assertTrue(isTextBefore(code1, code2));

        visible.get(0).sendKeys("disease");
        visible.get(0).sendKeys(Keys.ENTER);
        String code3 = "ALEUTIAN DISEASE (D-03550)";
        waitForElement(Locator.tagContainingText("div", code3));
        Assert.assertTrue(isTextBefore(code2, code3));

        //move first code down
        click(Locator.id(_ext4Helper.componentQuery("button[testLocator=snomedDownArrow]", Ext4CmpRef.class).get(0).getId()));
        waitForElement(Locator.tagContainingText("div", "1: " + code2));
        assertElementPresent(Locator.tagContainingText("div", "2: " + code1));
        assertElementPresent(Locator.tagContainingText("div", "3: " + code3));

        //once more
        click(Locator.id(_ext4Helper.componentQuery("button[testLocator=snomedUpArrow]", Ext4CmpRef.class).get(2).getId()));
        waitForElement(Locator.tagContainingText("div", "3: " + code1));
        assertElementPresent(Locator.tagContainingText("div", "1: " + code2));
        assertElementPresent(Locator.tagContainingText("div", "2: " + code3));

        //this should do nothing
        click(Locator.id(_ext4Helper.componentQuery("button[testLocator=snomedUpArrow]", Ext4CmpRef.class).get(0).getId()));
        waitForElement(Locator.tagContainingText("div", "1: " + code2));
        assertElementPresent(Locator.tagContainingText("div", "2: " + code3));
        assertElementPresent(Locator.tagContainingText("div", "3: " + code1));

        click(Locator.id(_ext4Helper.componentQuery("button[testLocator=snomedDelete]", Ext4CmpRef.class).get(0).getId()));
        assertElementNotPresent(Locator.tagContainingText("div", code2));

        waitAndClick(Ext4Helper.ext4Window("Manage SNOMED Codes").append(Ext4Helper.Locators.ext4Button("Submit")));
        Assert.assertEquals("1<>D-03550;2<>E-70590", histologyGrid.getFieldValue(1, "codesRaw").toString());
        Assert.assertTrue(isTextBefore("1: " + code3, "2: " + code1));

        //enter death
        waitAndClick(Ext4Helper.Locators.ext4Button("Enter/Manage Death"));
        Locator.XPathLocator deathWindow = Ext4Helper.ext4Window("Deaths");
        waitForElement(deathWindow);
        Ext4FieldRef.waitForField(this, "Necropsy Case No");
        waitForElement(deathWindow.append(Locator.tagContainingText("div", MORE_ANIMAL_IDS[1])));  //proxy for record loading
        Ext4ComboRef causeField = _ext4Helper.queryOne("window field[name=cause]", Ext4ComboRef.class);
        causeField.waitForStoreLoad();
        causeField.setValue("Experimental");
        waitAndClick(deathWindow.append(Ext4Helper.Locators.ext4ButtonEnabled("Submit")));
        waitForElementToDisappear(deathWindow);
        waitForElementToDisappear(Locator.tagContainingText("div", "Saving Changes...").notHidden());

        waitAndClickAndWait(_helper.getDataEntryButton("Save & Close"));

        //make new necropsy, copy from previous
        _helper.goToTaskForm("Necropsy", false);
        _helper.getExt4FieldForFormSection("Necropsy", "Id").setValue(MORE_ANIMAL_IDS[1]);
        procedureField = new Ext4ComboRef(_helper.getExt4FieldForFormSection("Necropsy", "Procedure").getId(), this);
        procedureField.setComboByDisplayValue("Necropsy & Histopathology Grade 2: Standard");

        waitAndClick(Ext4Helper.Locators.ext4Button("Copy Previous Case"));
        Locator.XPathLocator caseWindow = Ext4Helper.ext4Window("Copy From Previous Case");
        waitForElement(caseWindow);
        Ext4FieldRef.waitForField(this, "Animal Id");
        _ext4Helper.queryOne("window field[fieldLabel=Case No]", Ext4FieldRef.class).setValue(caseNo);
        Ext4FieldRef.getForBoxLabel(this, "Histologic Findings").setChecked(true);
        Ext4FieldRef.getForBoxLabel(this, "Diagnoses").setChecked(true);
        Ext4FieldRef.getForBoxLabel(this, "Staff").setChecked(true);
        waitAndClick(caseWindow.append(Ext4Helper.Locators.ext4ButtonEnabled("Submit")));

        //verify records
        _helper.getExt4GridForFormSection("Staff").waitForRowCount(3);
        _ext4Helper.clickExt4Tab("Histologic Findings");
        Assert.assertEquals(1, _helper.getExt4GridForFormSection("Histologic Findings").getRowCount());
        _ext4Helper.clickExt4Tab("Diagnoses");
        Assert.assertEquals(0, _helper.getExt4GridForFormSection("Diagnoses").getRowCount());

        _helper.discardForm();
    }

    //TODO: @Test
    public void pathTissuesTest()
    {
        //TODO: tissue helper, also copy from previous
    }

    @Test
    public void surgeryFormTest()
    {
        _helper.goToTaskForm("Surgeries");

        Ext4GridRef proceduresGrid = _helper.getExt4GridForFormSection("Procedures");
        _helper.addRecordToGrid(proceduresGrid);
        proceduresGrid.setGridCell(1, "Id", MORE_ANIMAL_IDS[1]);

        Ext4ComboRef procedureCombo = new Ext4ComboRef(proceduresGrid.getActiveEditor(1, "procedureid"), this);
        procedureCombo.setComboByDisplayValue("Lymph Node and Skin Biopsy - FITC");
        proceduresGrid.setGridCell(1, "chargetype", "Center Staff");
        proceduresGrid.setGridCellJS(1, "instructions", "These are my instructions");

        waitAndClick(Ext4Helper.Locators.ext4Button("Add Procedure Defaults"));
        waitForElement(Ext4Helper.ext4Window("Add Procedure Defaults"));
        waitForElement(Ext4Helper.ext4Window("Add Procedure Defaults").append(Locator.tagWithText("div", MORE_ANIMAL_IDS[1])));
        waitAndClick(Ext4Helper.ext4Window("Add Procedure Defaults").append(Ext4Helper.Locators.ext4Button("Submit")));

        _ext4Helper.clickExt4Tab("Staff");
        Ext4GridRef staffGrid = _helper.getExt4GridForFormSection("Staff");
        staffGrid.waitForRowCount(1);
        Assert.assertEquals("Surgeon", staffGrid.getFieldValue(1, "role"));

        _ext4Helper.clickExt4Tab("Weight");
        Ext4GridRef weightGrid = _helper.getExt4GridForFormSection("Weight");
        weightGrid.waitForRowCount(1);
        weightGrid.setGridCell(1, "weight", "5");

        _ext4Helper.clickExt4Tab("Medication/Treatment Orders");
        Ext4GridRef treatmentGrid = _helper.getExt4GridForFormSection("Medication/Treatment Orders");
        treatmentGrid.clickTbarButton("Order Post-Op Meds");
        waitForElement(Ext4Helper.ext4Window("Order Post-Op Meds"));
        waitForElement(Ext4Helper.ext4Window("Order Post-Op Meds").append(Locator.tagWithText("div", MORE_ANIMAL_IDS[1])));
        _ext4Helper.queryOne("field[fieldName=analgesiaRx]", Ext4ComboRef.class).waitForStoreLoad();
        _ext4Helper.queryOne("field[fieldName=antibioticRx]", Ext4ComboRef.class).waitForStoreLoad();
        waitAndClick(Ext4Helper.ext4Window("Order Post-Op Meds").append(Ext4Helper.Locators.ext4Button("Submit")));
        treatmentGrid.waitForRowCount(2);
        Assert.assertEquals(0.30, treatmentGrid.getFieldValue(1, "amount"));
        Assert.assertEquals("mg", treatmentGrid.getFieldValue(1, "amount_units"));
        Assert.assertEquals("E-YY792", treatmentGrid.getFieldValue(1, "code"));

        //review amounts window
        treatmentGrid.clickTbarButton("Review Amount(s)");
        waitForElement(Ext4Helper.ext4Window("Review Drug Amounts"));
        waitForElement(Ext4Helper.ext4Window("Review Drug Amounts").append(Locator.tagWithText("div", MORE_ANIMAL_IDS[1])), 2);

        Map<String, Object> expectedVals1 = new HashMap<>();
        expectedVals1.put("weight", 5L);
        expectedVals1.put("concentration", 0.3);
        expectedVals1.put("conc_units", "mg/ml");
        expectedVals1.put("dosage", 0.01);
        expectedVals1.put("dosage_units", "mg/kg");
        expectedVals1.put("volume", 1L);
        expectedVals1.put("vol_units", "mL");
        expectedVals1.put("amount", 0.3);
        expectedVals1.put("amount_units", "mg");
        expectedVals1.put("include", true);

        inspectDrugAmountFields(expectedVals1, 0);

        setDrugAmountField("weight", 0, 6L, expectedVals1);
        expectedVals1.put("volume", 0.2);
        expectedVals1.put("amount", 0.06);
        inspectDrugAmountFields(expectedVals1, 0);

        setDrugAmountField("conc_units", 0, "mg/tablet", expectedVals1);
        expectedVals1.put("vol_units", "tablet(s)");
        inspectDrugAmountFields(expectedVals1, 0);

        setDrugAmountField("dosage_units", 0, "ounces/kg", expectedVals1);
        expectedVals1.put("amount_units", "ounces");
        expectedVals1.put("conc_units", null);
        inspectDrugAmountFields(expectedVals1, 0);

        setDrugAmountField("dosage", 0, 0.02, expectedVals1);
        expectedVals1.put("volume", 0.4);
        expectedVals1.put("amount", 0.12);
        inspectDrugAmountFields(expectedVals1, 0);

        setDrugAmountField("include", 0, false, expectedVals1);
        setDrugAmountField("dosage", 0, 0.01, expectedVals1);
        inspectDrugAmountFields(expectedVals1, 0);

        setDrugAmountField("include", 0, true, expectedVals1);

        //now doses tab
        _ext4Helper.clickExt4Tab("Doses Used");
        waitForElement(Locator.tagContainingText("b", "Standard Conc"));
        _ext4Helper.queryOne("field[fieldName=concentration][recordIdx=0][snomedCode]", Ext4FieldRef.class).setValue(0.5);
        _ext4Helper.queryOne("field[fieldName=dosage][recordIdx=0][snomedCode]", Ext4FieldRef.class).setValue(2);
        _ext4Helper.queryOne("field[fieldName=volume_rounding][recordIdx=0][snomedCode]", Ext4FieldRef.class).setValue(0.8);
        click(Locator.id(_ext4Helper.queryOne("button[recordIdx=0][snomedCode]", Ext4FieldRef.class).getId()));
        _ext4Helper.clickExt4Tab("All Rows");
        waitForElement(Locator.tagContainingText("div", "This tab shows one row per drug"));
        expectedVals1.put("concentration", 0.5);
        expectedVals1.put("conc_units", "mg/ml");
        expectedVals1.put("dosage", 2L);
        expectedVals1.put("dosage_units", "mg/kg");
        expectedVals1.put("volume", null);
        expectedVals1.put("vol_units", "mL");
        expectedVals1.put("amount", null);
        expectedVals1.put("amount_units", "mg");
        inspectDrugAmountFields(expectedVals1, 0);

        click(Ext4Helper.Locators.ext4Button("Recalculate All"));
        _ext4Helper.clickExt4MenuItem("Recalculate Both Amount/Volume");
        expectedVals1.put("volume", 24L);
        expectedVals1.put("amount", 12L);
        inspectDrugAmountFields(expectedVals1, 0);

        //weight tab
        _ext4Helper.clickExt4Tab("Weights Used");
        waitForElement(Locator.tagContainingText("div", "From Form"));
        _ext4Helper.queryOne("field[fieldName=globalWeight][recordIdx=0]", Ext4FieldRef.class).setValue(3);
        waitForElement(Locator.tagContainingText("div", "Custom"));

        _ext4Helper.clickExt4Tab("All Rows");
        waitForElement(Locator.tagContainingText("div", "This tab shows one row per drug"));
        expectedVals1.put("weight", 3L);
        expectedVals1.put("volume", 12L);
        expectedVals1.put("amount", 6L);
        inspectDrugAmountFields(expectedVals1, 0);

        waitAndClick(Ext4Helper.ext4Window("Review Drug Amounts").append(Ext4Helper.Locators.ext4Button("Submit")));
        waitForElementToDisappear(Ext4Helper.ext4Window("Review Drug Amounts"));

        Assert.assertEquals(12L, treatmentGrid.getFieldValue(1, "volume"));
        Assert.assertEquals(6L, treatmentGrid.getFieldValue(1, "amount"));

        //open cases btn
        //TODO: create IDs, open real cases
        waitAndClick(Ext4Helper.Locators.ext4Button("Open Cases"));
        Locator.XPathLocator caseWindow = Ext4Helper.ext4Window("Open Cases");
        waitForElement(caseWindow);
        waitForElement(Locator.tagContainingText("div", "Unknown or non-living animal Id, cannot open case"));
        click(caseWindow.append(Ext4Helper.Locators.ext4ButtonEnabled("Close")));
        waitForElementToDisappear(caseWindow);

        _helper.discardForm();
    }

    private void inspectDrugAmountFields(Map<String, Object> expectedVals, int rowIdx)
    {
        for (String fieldName : expectedVals.keySet())
        {
            Ext4FieldRef field = _ext4Helper.queryOne("field[fieldName=" +fieldName + "][recordIdx=" + rowIdx + "]", Ext4FieldRef.class);
            Assert.assertEquals("incorrect field value: " + fieldName, expectedVals.get(fieldName), field.getValue());
        }
    }

    private void setDrugAmountField(String fieldName, int rowIdx, Object value, Map<String, Object> expectedVals)
    {
        _ext4Helper.queryOne("field[fieldName=" +fieldName + "][recordIdx=" + rowIdx + "]", Ext4FieldRef.class).setValue(value);
        expectedVals.put(fieldName, value);
    }

    //@Test
    public void gridErrorsTest()
    {
        //TODO: make sure fields turn red as expected
    }

    //@Test
    public void behaviorRoundsTest()
    {
        //TODO: test close cases
    }

    //@Test
    public void clinicalManagementUITest()
    {
        // manage cases

        // manage treatments

        // mark vet review

        // add/replace SOAP
    }

    private static String[] SUBJECTS = {"12345", "23456", "34567", "45678"};
    private static String[] ROOMS = {"Room1", "Room2", "Room3"};
    private static String[] CAGES = {"A1", "B2", "A3"};
    private static Integer[] PROJECTS = {12345, 123456, 1234567};

    @LogMethod
    private void createTestSubjects()
    {
        try
        {
            JSONObject extraContext = EHRApiTest.getExtraContext();

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
            insertCommand = _apiHelper.prepareInsertCommand("study", "demographics", "lsid", fields, data);
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
            insertCommand = _apiHelper.prepareInsertCommand("study", "Housing", "lsid", fields, data);
            _apiHelper.doSaveRows(DATA_ADMIN.getEmail(), Collections.singletonList(insertCommand), extraContext, true);

            //set a base weight
            log("Setting initial weights");
            fields = new String[]{"Id", "date", "weight", "QCStateLabel"};
            data = new Object[][]{
                    {SUBJECTS[0], pastDate2, 10.5, EHRQCState.COMPLETED.label},
                    {SUBJECTS[0], new Date(), 12, EHRQCState.COMPLETED.label}
            };
            insertCommand = _apiHelper.prepareInsertCommand("study", "Weight", "lsid", fields, data);
            _apiHelper.doSaveRows(DATA_ADMIN.getEmail(), Collections.singletonList(insertCommand), extraContext, true);

            //set assignment
            log("Setting initial assignments");
            fields = new String[]{"Id", "date", "enddate", "project"};
            data = new Object[][]{
                    {SUBJECTS[0], pastDate1, pastDate2, PROJECTS[0]},
                    {SUBJECTS[1], pastDate1, pastDate2, PROJECTS[0]},
                    {SUBJECTS[1], pastDate2, null, PROJECTS[2]}
            };
            insertCommand = _apiHelper.prepareInsertCommand("study", "Assignment", "lsid", fields, data);
            _apiHelper.doSaveRows(DATA_ADMIN.getEmail(), Collections.singletonList(insertCommand), extraContext, true);

            //set cases
            log("Setting cases");
            fields = new String[]{"Id", "date", "category"};
            data = new Object[][]{
                    {SUBJECTS[0], pastDate1, "Clinical"},
                    {SUBJECTS[0], pastDate1, "Surgery"},
                    {SUBJECTS[0], pastDate1, "Behavior"},
                    {SUBJECTS[1], pastDate1, "Clinical"},
                    {SUBJECTS[1], pastDate1, "Surgery"}
            };
            insertCommand = _apiHelper.prepareInsertCommand("study", "cases", "lsid", fields, data);
            _apiHelper.doSaveRows(DATA_ADMIN.getEmail(), Collections.singletonList(insertCommand), extraContext, true);
        }
        catch (ParseException e)
        {
            throw new RuntimeException(e);
        }
    }
}
