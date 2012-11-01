/*
 * Copyright (c) 2012 LabKey Corporation
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
package org.labkey.ehr.notification;

import org.labkey.api.action.NullSafeBindException;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Results;
import org.labkey.api.data.RuntimeSQLException;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Sort;
import org.labkey.api.data.Table;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.gwt.client.util.StringUtils;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryDefinition;
import org.labkey.api.query.QueryHelper;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QuerySettings;
import org.labkey.api.query.QueryView;
import org.labkey.api.query.UserSchema;
import org.labkey.api.query.snapshot.QuerySnapshotDefinition;
import org.labkey.api.query.snapshot.QuerySnapshotForm;
import org.labkey.api.settings.AppProps;
import org.labkey.api.util.ResultSetUtil;
import org.springframework.beans.MutablePropertyValues;
import org.springframework.validation.BindException;

import java.io.IOException;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

/**
 * Created by IntelliJ IDEA.
 * User: bbimber
 * Date: 7/14/12
 * Time: 3:16 PM
 */
public class ColonyAlertsNotification extends AbstractNotification
{
    public String getName()
    {
        return "Colony Alerts";
    }

    public String getEmailSubject()
    {
        return "Daily Colony Alerts: " + _dateTimeFormat.format(new Date());
    }

    public List<ScheduledFuture> schedule(int delay)
    {
        List<ScheduledFuture> tasks = new ArrayList<ScheduledFuture>();
        tasks.add(NotificationService.get().getExecutor().scheduleWithFixedDelay(this, delay, 60, TimeUnit.MINUTES));
        return tasks;
    }

    public String getScheduleDescription()
    {
        return "every 60 minutes";
    }

    public Set<String> getNotificationTypes()
    {
        return Collections.singleton(getName());
    }

    public String getDescription()
    {
        return "The report is designed to identify potential problems with the colony, primarily related to weights, housing and assignments.";
    }

    public String getMessage()
    {
        final StringBuilder msg = new StringBuilder();

        //Find today's date
        Date now = new Date();
        msg.append("This email contains a series of automatic alerts about the colony.  It was run on: " + _dateFormat.format(now) + " at " + _timeFormat.format(now) + ".<p>");

        livingAnimalsWithoutWeight(msg);
        cagesWithoutDimensions(msg);
        findAnimalsInPC(msg);
        multipleHousingRecords(msg);
        validateActiveHousing(msg);
        housingConditionProblems(msg);
        deadAnimalsWithActiveHousing(msg);
        livingAnimalsWithoutHousing(msg);
        calculatedStatusFieldProblems(msg);
        animalsLackingAssignments(msg);
        deadAnimalsWithActiveAssignments(msg);
        assignmentsWithoutValidProtocol(msg);
        duplicateAssignments(msg);
        sivPosNotExempt(msg);
        activeTreatmentsForDeadAnimals(msg);
        activeProblemsForDeadAnimals(msg);
        activeAssignmentsForDeadAnimals(msg);
        nonContiguousHousing(msg);
        birthWithoutGender(msg);
        demographicsWithoutGender(msg);
        prenatalRecordsWithoutGender(msg);
        prenatalRecordsWithoutSpecies(msg);
        deathWeightCheck(msg);
        tbRecords30_90(msg);
        protocolsNearingLimit(msg);
        protocolsExpiringSoon(msg);
        birthRecordsWithoutDemographics(msg);
        deathRecordsWithoutDemographics(msg);
        animalsWithHoldCodesNotOnPending(msg);
        assignmentsProjectedToday(msg);
        assignmentsProjectedTomorrow(msg);

        //summarize events in last 5 days:
        msg.append("<b>Colony events in the past 5 days:</b><p>");
        birthsInLast5Days(msg);
        deathsInLast5Days(msg);
        prenatalDeathsPast5Days(msg);
        finalizedRecordsWithFutureDates(msg);

        return msg.toString();
    }
    
    protected void findAnimalsInPC(final StringBuilder msg)
    {
        //then we list all animals in pc
        TableInfo housingTable = _studySchema.getTable("Housing");
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Id/Dataset/Demographics/calculated_status"), "Alive");
        filter.addCondition(FieldKey.fromString("cond"), "pc");
        filter.addCondition(FieldKey.fromString("enddate"), null, CompareType.ISBLANK);
        Sort sort = new Sort(_ehrStudy.getSubjectColumnName());

        TableSelector ts = new TableSelector(housingTable, Collections.singleton(_ehrStudy.getSubjectColumnName()), filter, sort);
        if (ts.getRowCount() > 0)
        {
            StringBuilder tempHtml = new StringBuilder();
            final Map<String, Map<Integer, List<String>>> roomMap = new HashMap<String, Map<Integer, List<String>>>();
            ts.forEach(new TableSelector.ForEachBlock<ResultSet>(){
                public void exec(ResultSet rs) throws SQLException
                {
                    String room = rs.getString("room");
                    Map<Integer, List<String>> cages = roomMap.get(room);
                    if (cages == null)
                        cages = new HashMap<Integer, List<String>>();

                    Integer cageNo = rs.getInt("cage");
                    
                    List<String> ids = cages.get(cageNo);
                    if (ids == null)
                        ids = new ArrayList<String>();
                    
                    String id = rs.getString("Id");
                    ids.add(id);
                    cages.put(cageNo, ids);
                    roomMap.put(room, cages);                                             
                }
            });
        
            for (String room : roomMap.keySet())
            {
                Map<Integer, List<String>> cages = roomMap.get(room);
                for (Integer cage : cages.keySet())
                {
                    List<String> ids = cages.get(cage);        
                    if(cages.get(cage - 1) == null && cages.get(cage + 1) == null)
                    {
                        tempHtml.append(room + "/" + cage + ": " + StringUtils.join(ids, ", ") + "<br>\n");                    
                    }
                }
            }

            if(tempHtml.length() > 0){
                msg.append("<b>WARNING: The following animals are listed in protected contact, but do not appear to have an adjacent pc animal:</b><br>\n");
                msg.append(tempHtml);
                msg.append("\n<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=Housing&query.cond~eq=pc&query.enddate~isblank='>Click here to view all pc animals</a></p>\n");
                msg.append("<hr>\n");
            }
        }
    }

    /**
     * Finds all occupied cages without dimensions
     */
    protected void cagesWithoutDimensions(final StringBuilder msg)
    {
        TableSelector ts = new TableSelector(_ehrSchema.getTable("missingCages"), Table.ALL_COLUMNS, null, null);
        if (ts.getRowCount() > 0)
        {
            msg.append("<b>WARNING: The following cages have animals, but do not have known dimensions:</b><br>\n");
            ts.forEach(new TableSelector.ForEachBlock<ResultSet>(){
                public void exec(ResultSet rs) throws SQLException
                {
                    msg.append(rs.getString("room") + "/" + rs.getString("cage") + "<br>\n");
                }
            });

            msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=ehr&query.queryName=missingCages'>Click here to view the problem cages</a></p>\n");
            msg.append("<a href='" + _baseUrl + "/executeQuery.view?schemaName=ehr_lookups&query.queryName=cage'>Click here to edit the cage list and fix the problem</a></p>\n");
            msg.append("<hr>\n");
        }

    }

    protected void livingAnimalsWithoutWeight(final StringBuilder msg)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("calculated_status"), "Alive");
        filter.addCondition(FieldKey.fromString("Id/MostRecentWeight/MostRecentWeightDate"), null, CompareType.ISBLANK);
        Sort sort = new Sort(_ehrStudy.getSubjectColumnName());
        TableSelector ts = new TableSelector(_studySchema.getTable("Demographics"), Collections.singleton(_ehrStudy.getSubjectColumnName()), filter, sort);
        if (ts.getRowCount() > 0)
        {
            msg.append("<b>WARNING: The following animals do not have a weight:</b><br>\n");
            ts.forEach(new TableSelector.ForEachBlock<ResultSet>(){
                public void exec(ResultSet rs) throws SQLException
                {
                    msg.append(rs.getString(_ehrStudy.getSubjectColumnName()) + "<br>\n");
                }
            });

            msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=Demographics&query.calculated_status~eq=Alive&query.Id/MostRecentWeight/MostRecentWeightDate~isblank'>Click here to view these animals</a></p>\n");
            msg.append("<hr>\n");
        }
    }

    protected void multipleHousingRecords(final StringBuilder msg)
    {
        //then we find all living animals with multiple active housing records:
        Sort sort = new Sort(_ehrStudy.getSubjectColumnName());
        TableSelector ts = new TableSelector(_studySchema.getTable("housingProblems"), Table.ALL_COLUMNS, null, sort);
        if (ts.getRowCount() > 0)
        {
            msg.append("<b>WARNING: There are " + ts.getRowCount() + " animals with multiple active housing records:</b><br>\n");
            msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=housingProblems'>Click here to view these animals</a></p>\n");
            msg.append("<a href='" + AppProps.getInstance().getBaseServerUrl() + AppProps.getInstance().getContextPath() + "/ehr" + _ehrContainer.getPath() + "/updateQuery.view?schemaName=study&query.queryName=Housing&query.Id~in=");

            ts.forEach(new TableSelector.ForEachBlock<ResultSet>(){
                public void exec(ResultSet rs) throws SQLException
                {
                    msg.append(rs.getString(_ehrStudy.getSubjectColumnName()) + ";");
                }
            });

            msg.append("&query.enddate~isblank'>Click here to edit housing to fix the problems</a><p>");
            msg.append("<hr>\n");
        }
    }

    protected void validateActiveHousing(final StringBuilder msg)
    {
        Sort sort = new Sort(_ehrStudy.getSubjectColumnName());
        TableSelector ts = new TableSelector(_studySchema.getTable("ValidateHousingSnapshot"), Table.ALL_COLUMNS, null, sort);
        if (ts.getRowCount() > 0)
        {
            msg.append("<b>WARNING: There are " + ts.getRowCount() + " animals where the housing snapshot doesnt match the housing table.  The snapshot has been automatically refreshed:</b><br>\n");
            msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=ValidateHousingSnapshot'>Click here to view the report again</a></p>\n");
            msg.append("<hr>\n");

            try
            {
                QueryDefinition queryDef = QueryService.get().createQueryDefForTable(_ehrSchema, "ActiveHousing");
                if (queryDef == null)
                    return;

                QuerySnapshotDefinition qsDef = QueryService.get().getSnapshotDef(_ehrStudy.getContainer(), _ehrSchema.getSchemaName(), "ActiveHousing");
                QuerySnapshotForm form = new QuerySnapshotForm();
                form.setSchemaName(_ehrSchema.getPath());
                form.setQueryName("ActiveHousing");

                //TODO: update snapshot
//                org.springframework.validation.BindException errors = new NullSafeBindException(new Object(), "command");
//                QuerySnapshotService.get("Study").updateSnapshot(form, errors);
            }
            catch (Exception e)
            {
                throw new RuntimeException(e);
            }
        }
    }

    protected void housingConditionProblems(final StringBuilder msg)
    {
        //then we find all records with potential housing condition problems
        MutablePropertyValues mpv = new MutablePropertyValues();
        mpv.addPropertyValue("schemaName", "study");
        mpv.addPropertyValue("query.queryName", "housingConditionProblems");
        mpv.addPropertyValue("query.sort", _ehrStudy.getSubjectColumnName());

        BindException errors = new NullSafeBindException(new Object(), "command");
        UserSchema us = QueryService.get().getUserSchema(_ns.getUser(), _ehrContainer, "study");
        QuerySettings qs = us.getSettings(mpv, "query");
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("conditionStatus"), "ERROR", CompareType.EQUAL);
        qs.setBaseFilter(filter);
        QueryView view = new QueryView(us, qs, errors);
        Results rs = null;
        try
        {
            rs = view.getResults();
            int total = 0;
            if (rs.next())
            {
                StringBuilder tmp = new StringBuilder();
                do
                {
                    tmp.append(rs.getString(_ehrStudy.getSubjectColumnName()) + ";");
                    total++;
                }
                while (rs.next());

                msg.append("<b>WARNING: There are " + total + " housing records with potential condition problems:</b><br>\n");
                msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=housingConditionProblems&query.viewName=Problems'>Click here to view these records</a></p>\n");
                msg.append("<a href='" + AppProps.getInstance().getBaseServerUrl() + AppProps.getInstance().getContextPath() + "/ehr" + _ehrContainer.getPath() + "/updateQuery.view?schemaName=study&query.queryName=Housing&query.Id~in=");
                msg.append(tmp);
                msg.append("&query.enddate~isblank'>Click here to edit housing to fix the problems</a><p>");
                msg.append("<hr>\n");
            }
        }
        catch (SQLException e)
        {
            throw new RuntimeSQLException(e);
        }
        catch (IOException e)
        {
            throw new RuntimeException(e);
        }
        finally
        {
            ResultSetUtil.close(rs);
        }
    }

    protected void deadAnimalsWithActiveHousing(final StringBuilder msg)
    {
        //we find open housing records where the animal is not alive
        Sort sort = new Sort(_ehrStudy.getSubjectColumnName());
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Id/Dataset/Demographics/calculated_status"), "Alive", CompareType.NEQ_OR_NULL);
        filter.addCondition(FieldKey.fromString("enddate"), null, CompareType.ISBLANK);
        TableSelector ts = new TableSelector(_studySchema.getTable("Housing"), Table.ALL_COLUMNS, filter, sort);

        if (ts.getRowCount() > 0)
        {
	        msg.append("<b>WARNING: There are " + ts.getRowCount() + " active housing records where the animal is not alive:</b><br>\n");

            ts.forEach(new TableSelector.ForEachBlock<ResultSet>(){
                public void exec(ResultSet rs) throws SQLException
                {
                    msg.append(rs.getString(_ehrStudy.getSubjectColumnName()) + "<br>\n");
                }
            });

            //TODO: verify output
	        msg.append("<b>WARNING: There are " + ts.getRowCount() + " housing records for animals not currently at the center.</b><br>\n");
            msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=Housing&query.enddate~isblank&query.Id/Dataset/Demographics/calculated_status~neqornull=Alive'>Click here to view and update them</a><br>\n\n");
            msg.append("<hr>\n\n");
        }
    }

    protected void livingAnimalsWithoutHousing(final StringBuilder msg)
    {
        //we find living animals without an active housing record
        Sort sort = new Sort(_ehrStudy.getSubjectColumnName());
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("calculated_status"), "Alive");
        filter.addCondition(FieldKey.fromString("Id/curLocation/room/room"), null, CompareType.ISBLANK);
        TableSelector ts = new TableSelector(_studySchema.getTable("Demographics"), Table.ALL_COLUMNS, filter, sort);
        exampleData:
        if (ts.getRowCount() > 0)
        {
	        msg.append("<b>WARNING: There are " + ts.getRowCount() + " living animals without an active housing record:</b><br>\n");

            ts.forEach(new TableSelector.ForEachBlock<ResultSet>(){
                public void exec(ResultSet rs) throws SQLException
                {
                    msg.append(rs.getString(_ehrStudy.getSubjectColumnName()) + "<br>\n");
                }
            });

            msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=Demographics&query.Id/curLocation/room/room~isblank&query.Id/Dataset/Demographics/calculated_status~eq=Alive'>Click here to view them</a><br>\n\n");
            msg.append("<hr>\n\n");
        }
    }

    protected void calculatedStatusFieldProblems(final StringBuilder msg)
    {
        //then we find all records with problems in the calculated_status field
        TableSelector ts = new TableSelector(_studySchema.getTable("Validate_status"), Table.ALL_COLUMNS, null, null);
        if (ts.getRowCount() > 0)
        {
	        msg.append("<b>WARNING: There are " + ts.getRowCount() + " animals with problems in the status field:</b><br>\n");

            ts.forEach(new TableSelector.ForEachBlock<ResultSet>(){
                public void exec(ResultSet rs) throws SQLException
                {
                    msg.append(rs.getString(_ehrStudy.getSubjectColumnName()) + "<br>\n");
                }
            });

            msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=Validate_status'>Click here to view these records</a></p>\n");
            msg.append("When you see these problems, it usually happens because the automatic process of calculating this field, which is triggered by births, deaths, departures or arrivals, didnt work right.  To force it to re-calculate, just edit the animal's record on one of these tables, maybe no changes, then hit submit.  That should force a re-calculation of the status field.<p>");
            msg.append("<hr>\n");
        }
    }

    /**
     * find all living animals without active assignments
     */
    protected void animalsLackingAssignments(final StringBuilder msg)
    {
        QueryHelper qh = new QueryHelper(_ehrContainer, NotificationService.get().getUser(), "study", "Demographics", "No Active Assignments");
        Results rs = null;
        try
        {
            rs = qh.select();
            int count = 0;
            StringBuilder tmpHtml = new StringBuilder();
            Set<String> ids = new HashSet<String>();
            if (rs.next())
            {
                while (rs.next())
                {
                    ids.add(rs.getString(_ehrStudy.getSubjectColumnName()));
                }
                tmpHtml.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=Demographics&query.viewName=No Active Assignments'>Click here to view these animals</a></p>\n");
                tmpHtml.append("<hr>\n");
                count++;
            }

            if (count > 0)
            {
                msg.append("<b>WARNING: There are " + count + " living animals without any active assignments:</b><br>\n");
                msg.append(StringUtils.join(new ArrayList<String>(ids), ",<br>"));
                msg.append(tmpHtml);
            }
        }
        catch (SQLException e)
        {
            throw new RuntimeSQLException(e);
        }
        finally
        {
            ResultSetUtil.close(rs);
        }
    }

    protected void deadAnimalsWithActiveAssignments(final StringBuilder msg)
    {
        //then we find all records with problems in the calculated_status field
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Id/Dataset/Demographics/calculated_status"), "Alive", CompareType.NEQ_OR_NULL);
        filter.addCondition(FieldKey.fromString("enddate"), null, CompareType.ISBLANK);
        TableSelector ts = new TableSelector(_studySchema.getTable("Assignment"), Table.ALL_COLUMNS, filter, null);
        if (ts.getRowCount() > 0)
        {
            msg.append("<b>WARNING: There are " + ts.getRowCount() + " active assignments for animals not currently at the center.</b><br>\n");
            msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=Assignment&query.enddate~isblank&query.Id/Dataset/Demographics/calculated_status~neqornull=Alive'>Click here to view and update them</a><br>\n\n");
            msg.append("<hr>\n\n");
        }
    }

    /**
     * find any active assignment where the project lacks a valid protocol
     */
    protected void assignmentsWithoutValidProtocol(final StringBuilder msg)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("enddate"), null, CompareType.ISBLANK);
        filter.addCondition(FieldKey.fromString("project/protocol"), null, CompareType.ISBLANK);
        TableSelector ts = new TableSelector(_studySchema.getTable("Assignment"), Table.ALL_COLUMNS, filter, null);
        if (ts.getRowCount() > 0)
        {
            msg.append("<b>WARNING: There are " + ts.getRowCount() + " active assignments to a project without a valid protocol.</b><br>\n");
            msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=Assignment&query.enddate~isblank&query.project/protocol~isblank'>Click here to view them</a><br>\n\n");
            msg.append("<hr>\n\n");
        }
    }

    protected void duplicateAssignments(final StringBuilder msg)
    {
        TableSelector ts = new TableSelector(_studySchema.getTable("duplicateAssignments"), Table.ALL_COLUMNS, null, null);
        if (ts.getRowCount() > 0)
        {
            msg.append("<b>WARNING: There are " + ts.getRowCount() + " animals double assigned to the same project.</b><br>\n");
            msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=duplicateAssignments'>Click here to view them</a><br>\n\n");
            msg.append("<hr>\n\n");
        }
    }

    /**
     * find the total finalized records with future dates
     */
    protected void finalizedRecordsWithFutureDates(final StringBuilder msg)
    {
        String datasets = "Treatment Orders;Assignment";
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("qcstate/PublicData"), true);
        Date date = new Date();
        filter.addCondition(FieldKey.fromString("date"), date, CompareType.GTE);
        filter.addCondition(FieldKey.fromString("dataset/label"), datasets, CompareType.NOT_IN);
        TableSelector ts = new TableSelector(_studySchema.getTable("StudyData"), Table.ALL_COLUMNS, filter, null);
        if (ts.getRowCount() > 0)
        {
            msg.append("<b>WARNING: There are " + ts.getRowCount() + " finalized records with future dates.</b><br>\n");
            msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=StudyData&query.date~dategt=" + _dateFormat.format(date) + "&query.qcstate/PublicData~eq=true&query.dataset/label~notin=" + datasets + "'>Click here to view them</a><br>\n\n");
            msg.append("<hr>\n\n");
        }
    }

    /**
     * prenatal deaths in the last 5 days
     */
    protected void prenatalDeathsPast5Days(final StringBuilder msg)
    {
        Calendar cal = Calendar.getInstance();
        cal.setTime(new Date());
        cal.add(Calendar.DATE, -5);
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("date"), cal.getTime(), CompareType.DATE_GTE);
        TableSelector ts = new TableSelector(_studySchema.getTable("Prenatal Deaths"), Table.ALL_COLUMNS, filter, new Sort(_ehrStudy.getSubjectColumnName()));
        if (ts.getRowCount() > 0)
        {
            msg.append("Prenatal Deaths since " + _dateFormat.format(cal.getTime()) + ":<br>\n");
            ts.forEach(new TableSelector.ForEachBlock<ResultSet>(){
                public void exec(ResultSet rs) throws SQLException
                {
                    msg.append(rs.getString(_ehrStudy.getSubjectColumnName()) + "<br>\n");
                }
            });

            msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=Prenatal Deaths&query.date~dategte=" + _dateFormat.format(cal.getTime()) + "'>Click here to view them</a><p>\n");
            msg.append("<hr>\n");
        }
    }

    /**
     * deaths in the last 5 days
     */
    protected void deathsInLast5Days(final StringBuilder msg)
    {
        Calendar cal = Calendar.getInstance();
        cal.setTime(new Date());
        cal.add(Calendar.DATE, -5);
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("date"), cal.getTime(), CompareType.DATE_GTE);
        TableSelector ts = new TableSelector(_studySchema.getTable("Deaths"), Table.ALL_COLUMNS, filter, new Sort(_ehrStudy.getSubjectColumnName()));
        if (ts.getRowCount() > 0)
        {
            msg.append("Deaths since " + _dateFormat.format(cal.getTime()) + ":<br>\n");
            ts.forEach(new TableSelector.ForEachBlock<ResultSet>(){
                public void exec(ResultSet rs) throws SQLException
                {
                    msg.append(rs.getString(_ehrStudy.getSubjectColumnName()) + "<br>\n");
                }
            });

            msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=Deaths&query.date~dategte=" + _dateFormat.format(cal.getTime()) + "'>Click here to view them</a><p>\n");
            msg.append("<hr>\n");
        }
    }

    /**
     * births in the last 5 days
     */
    protected void birthsInLast5Days(final StringBuilder msg)
    {
        Calendar cal = Calendar.getInstance();
        cal.setTime(new Date());
        cal.add(Calendar.DATE, -5);
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("date"), cal.getTime(), CompareType.DATE_GTE);
        TableSelector ts = new TableSelector(_studySchema.getTable("Birth"), Table.ALL_COLUMNS, filter, new Sort(_ehrStudy.getSubjectColumnName()));
        if (ts.getRowCount() > 0)
        {
            msg.append("Births since " + _dateFormat.format(cal.getTime()) + ":<br>\n");
            ts.forEach(new TableSelector.ForEachBlock<ResultSet>(){
                public void exec(ResultSet rs) throws SQLException
                {
                    msg.append(rs.getString(_ehrStudy.getSubjectColumnName()) + "<br>\n");
                }
            });

            msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=Birth&query.date~dategte=" + _dateFormat.format(cal.getTime()) + "'>Click here to view them</a><p>\n");
            msg.append("<hr>\n");
        }
    }

    protected void assignmentsProjectedTomorrow(final StringBuilder msg)
    {
        Calendar cal = Calendar.getInstance();
        cal.setTime(new Date());
        cal.add(Calendar.DATE, 1);

        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("enddate"), null, CompareType.ISBLANK);
        filter.addCondition(FieldKey.fromString("projectedRelease"), cal.getTime(), CompareType.DATE_EQUAL);
        TableSelector ts = new TableSelector(_studySchema.getTable("Assignment"), Table.ALL_COLUMNS, filter, null);
        if (ts.getRowCount() > 0)
        {
            msg.append("<b>ALERT: There are " + ts.getRowCount() + " assignments with a projected release date for tomorrow.</b><br>\n");
            msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=Assignment&query.projectedRelease~dateeq=" + _dateFormat.format(cal.getTime()) + "'>Click here to view and update them</a><br>\n\n");
            msg.append("<hr>\n\n");
        }
    }

    /**
     * we find assignments with projected releases today
     */
    protected void assignmentsProjectedToday(final StringBuilder msg)
    {
        Date date = new Date();
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("projectedRelease"), date, CompareType.DATE_EQUAL);
        TableSelector ts = new TableSelector(_studySchema.getTable("Assignment"), Table.ALL_COLUMNS, filter, null);
        if (ts.getRowCount() > 0)
        {
            msg.append("<b>ALERT: There are " + ts.getRowCount() + " assignments with a projected release date for today that have not already been ended.</b><br>\n");
            msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=Assignment&query.projectedRelease~dateeq=" + _dateFormat.format(date) + "'>Click here to view them</a><br>\n\n");
            msg.append("<hr>\n\n");
        }
    }

    /**
     * we find animals with hold codes, but not on pending
     */
    protected void animalsWithHoldCodesNotOnPending(final StringBuilder msg)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("hold"), null, CompareType.NONBLANK);
        filter.addCondition(FieldKey.fromString("Id/activeAssignments/NumPendingAssignments"), 0, CompareType.EQUAL);
        TableSelector ts = new TableSelector(_studySchema.getTable("Demographics"), Table.ALL_COLUMNS, filter, new Sort(_ehrStudy.getSubjectColumnName()));
        if (ts.getRowCount() > 0)
        {
            msg.append("<b>WARNING: There are " + ts.getRowCount() + " animals with a hold code, but not on the pending project.</b><br>\n");
            msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=Demographics&query.hold~isnonblank&query.Id/activeAssignments/NumPendingAssignments~eq=0'>Click here to view them</a><br>\n\n");
            msg.append("<hr>\n\n");
        }
    }

    /**
     * we find death records without a corresponding demographics record
     */
    protected void deathRecordsWithoutDemographics(final StringBuilder msg)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Id/Dataset/Demographics/Id"), null, CompareType.ISBLANK);
        filter.addCondition(FieldKey.fromString("notAtCenter"), true, CompareType.NEQ_OR_NULL);
        TableSelector ts = new TableSelector(_studySchema.getTable("Deaths"), Table.ALL_COLUMNS, filter, new Sort(_ehrStudy.getSubjectColumnName()));
        if (ts.getRowCount() > 0)
        {
            msg.append("<b>WARNING: There are " + ts.getRowCount() + " death records without a corresponding demographics record.</b><br>\n");
            msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=Deaths&query.Id/Dataset/Demographics/Id~isblank&query.notAtCenter~neqornull=true'>Click here to view and update them</a><br>\n\n");
            msg.append("<hr>\n\n");
        }
    }

    /**
     * we find birth records without a corresponding demographics record
     */
    protected void birthRecordsWithoutDemographics(final StringBuilder msg)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Id/Dataset/Demographics/Id"), null, CompareType.ISBLANK);
        TableSelector ts = new TableSelector(_studySchema.getTable("Birth"), Collections.singleton(_ehrStudy.getSubjectColumnName()), filter, new Sort(_ehrStudy.getSubjectColumnName()));
        if (ts.getRowCount() > 0)
        {
            msg.append("<b>WARNING: There are " + ts.getRowCount() + " birth records without a corresponding demographics record.</b><br>\n");
            msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=Birth&query.Id/Dataset/Demographics/Id~isblank'>Click here to view and update them</a><br>\n\n");
            msg.append("<hr>\n\n");
        }
    }

    /**
     * we find protocols expiring soon.  this is based on protocols having a 3-year window
     */
    protected void protocolsExpiringSoon(final StringBuilder msg)
    {

        int days = 14;
        int dayValue = (365 * 3) - days;

        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Approve"), "-" + dayValue + "d", CompareType.DATE_LTE);
        TableSelector ts = new TableSelector(_ehrSchema.getTable("protocol"), Table.ALL_COLUMNS, filter, new Sort(_ehrStudy.getSubjectColumnName()));
        if (ts.getRowCount() > 0)
        {
            msg.append("<b>WARNING: There are " + ts.getRowCount() + " protocols that will expire within the next " + days + " days.</b><br>\n");
            msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=ehr&query.queryName=protocol&query.Approve~datelte=-" + dayValue + "d'>Click here to view them</a><br>\n\n");
            msg.append("<hr>\n\n");
        }
    }

    /**
     * we find protocols nearing the animal limit, based on number and percent
     */
    protected void protocolsNearingLimit(final StringBuilder msg)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("TotalRemaining"), 5, CompareType.LT);
        TableSelector ts = new TableSelector(_ehrSchema.getTable("protocolTotalAnimalsBySpecies"), Table.ALL_COLUMNS, filter, new Sort(_ehrStudy.getSubjectColumnName()));
        if (ts.getRowCount() > 0)
        {
            msg.append("<b>WARNING: There are " + ts.getRowCount() + " protocols with fewer than 5 remaining animals.</b><br>\n");
            msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=ehr&query.queryName=protocolTotalAnimalsBySpecies&query.TotalRemaining~lt=5'>Click here to view them</a><br>\n\n");
            msg.append("<hr>\n\n");
        }

        filter = new SimpleFilter(FieldKey.fromString("PercentUsed"), 95, CompareType.GTE);
        ts = new TableSelector(_ehrSchema.getTable("protocolTotalAnimalsBySpecies"), Table.ALL_COLUMNS, filter, new Sort(_ehrStudy.getSubjectColumnName()));
        if (ts.getRowCount() > 0)
        {
            msg.append("<b>WARNING: There are " + ts.getRowCount() + " protocols with fewer than 5% of their animals remaining.</b><br>\n");
            msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=ehr&query.queryName=protocolTotalAnimalsBySpecies&query.PercentUsed~gte=95'>Click here to view them</a><br>\n\n");
            msg.append("<hr>\n\n");
        }
    }

    /**
     * we find TB records lacking a results more than 30 days old, but less than 90
     */
    protected void tbRecords30_90(final StringBuilder msg)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("missingresults"), true, CompareType.EQUAL);
        filter.addCondition(FieldKey.fromString("date"), "-90d", CompareType.DATE_GTE);
        filter.addCondition(FieldKey.fromString("date"), "-10d", CompareType.DATE_LTE);
        TableSelector ts = new TableSelector(_studySchema.getTable("TB Tests"), Table.ALL_COLUMNS, filter, new Sort(_ehrStudy.getSubjectColumnName()));
        if (ts.getRowCount() > 0)
        {
            msg.append("<b>WARNING: There are " + ts.getRowCount() + " TB Tests in the past 10-90 days that are missing results.</b><br>\n");
            msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=TB Tests&query.date~datelte=-10d&query.date~dategte=-90d&query.missingresults~eq=true'>Click here to view them</a><br>\n\n");
            msg.append("<hr>\n\n");
        }
    }

    /**
     * we find all animals that died in the past 90 days where there isnt a weight within 7 days of death:
     */
    protected void deathWeightCheck(final StringBuilder msg)
    {
        Calendar cal = Calendar.getInstance();
        cal.setTime(new Date());
        cal.add(Calendar.DATE, -90);

        MutablePropertyValues mpv = new MutablePropertyValues();
        mpv.addPropertyValue("schemaName", "study");
        mpv.addPropertyValue("query.queryName", "validateFinalWeights");
        mpv.addPropertyValue("query.param.MINDATE", _dateFormat.format(cal.getTime()));

        BindException errors = new NullSafeBindException(new Object(), "command");
        UserSchema us = QueryService.get().getUserSchema(_ns.getUser(), _ehrContainer, "study");
        QuerySettings qs = us.getSettings(mpv, "query");
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("death"), cal.getTime(), CompareType.DATE_GTE);
        qs.setBaseFilter(filter);

        QueryView view = new QueryView(us, qs, errors);
        Results rs = null;
        try
        {
            rs = view.getResults();
            int total = 0;
            while (rs.next())
            {
                total++;
            }

            if (total > 0)
            {
                msg.append("<b>WARNING: There are " + total + " animals that are dead, but do not have a weight within the previous 7 days:</b><br>\n");
                msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=validateFinalWeights&query.death~dategte=-90d'>Click here to view them</a></p>\n");
                msg.append("<hr>\n");
            }
        }
        catch (SQLException e)
        {
            throw new RuntimeSQLException(e);
        }
        catch (IOException e)
        {
            throw new RuntimeException(e);
        }
        finally
        {
            ResultSetUtil.close(rs);
        }
    }

    /**
     * we find prenatal records in the past 90 days missing species
     */
    protected void prenatalRecordsWithoutSpecies(final StringBuilder msg)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("date"), "-90d", CompareType.DATE_GTE);
        filter.addCondition(FieldKey.fromString("species"), null, CompareType.ISBLANK);
        TableSelector ts = new TableSelector(_studySchema.getTable("Prenatal Deaths"), Table.ALL_COLUMNS, filter, new Sort(_ehrStudy.getSubjectColumnName()));
        if (ts.getRowCount() > 0)
        {
            msg.append("<b>WARNING: The following prenatal death records were entered in the last 90 days, but are missing the species:</b><br>\n");
            ts.forEach(new TableSelector.ForEachBlock<ResultSet>(){
                public void exec(ResultSet rs) throws SQLException
                {
                    msg.append(rs.getString(_ehrStudy.getSubjectColumnName()) + "(" + _dateFormat.format(rs.getDate("date"))+ ")" + "<br>\n");
                }
            });

            msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=Prenatal Deaths&query.species~isblank=&query.date~dategte=-90d'>Click here to view these animals</a></p>\n");
            msg.append("<hr>\n");
        }
    }

    /**
     * we find prenatal records in the past 90 days missing a gender
     */
    protected void prenatalRecordsWithoutGender(final StringBuilder msg)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("date"), "-90d", CompareType.DATE_GTE);
        filter.addCondition(FieldKey.fromString("gender"), null, CompareType.ISBLANK);
        TableSelector ts = new TableSelector(_studySchema.getTable("Prenatal Deaths"), Table.ALL_COLUMNS, filter, new Sort(_ehrStudy.getSubjectColumnName()));
        if (ts.getRowCount() > 0)
        {
            msg.append("<b>WARNING: The following prenatal death records were entered in the last 90 days, but are missing a gender:</b><br>\n");
            ts.forEach(new TableSelector.ForEachBlock<ResultSet>(){
                public void exec(ResultSet rs) throws SQLException
                {
                    msg.append(rs.getString(_ehrStudy.getSubjectColumnName()) + "(" + _dateFormat.format(rs.getDate("date"))+ ")" + "<br>\n");
                }
            });

            msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=Prenatal Deaths&query.gender~isblank=&query.date~dategte=-90d'>Click here to view these animals</a></p>\n");
            msg.append("<hr>");
        }
    }

    /**
     * we find demographics records in the past 90 days missing a gender
     */
    protected void demographicsWithoutGender(final StringBuilder msg)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("death"), "-90d", CompareType.DATE_GTE);
        filter.addCondition(FieldKey.fromString("gender"), null, CompareType.ISBLANK);
        TableSelector ts = new TableSelector(_studySchema.getTable("Demographics"), Table.ALL_COLUMNS, filter, new Sort(_ehrStudy.getSubjectColumnName()));
        if (ts.getRowCount() > 0)
        {
            msg.append("<b>WARNING: The following demographics records were entered in the last 90 days, but are missing a gender:</b><br>\n");
            ts.forEach(new TableSelector.ForEachBlock<ResultSet>()
            {
                public void exec(ResultSet rs) throws SQLException
                {
                    msg.append(rs.getString(_ehrStudy.getSubjectColumnName()));
                    if (rs.getDate("birth") == null)
                        msg.append("(" + _dateFormat.format(rs.getDate("birth")) + ")");

                    msg.append("<br>\n");
                }
            });
            msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=Demographics&query.gender~isblank=&query.created~dategte=-90d'>Click here to view these animals</a></p>\n");
            msg.append("<hr>\n");
        }
    }

    /**
     * we find birth records in the past 90 days missing a gender
     */
    protected void birthWithoutGender(final StringBuilder msg)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("date"), "-90d", CompareType.DATE_GTE);
        filter.addCondition(FieldKey.fromString("gender"), null, CompareType.ISBLANK);
        TableSelector ts = new TableSelector(_studySchema.getTable("Birth"), Table.ALL_COLUMNS, filter, new Sort(_ehrStudy.getSubjectColumnName()));
        if (ts.getRowCount() > 0)
        {
            msg.append("<b>WARNING: The following birth records were entered in the last 90 days, but are missing a gender:</b><br>\n");
            ts.forEach(new TableSelector.ForEachBlock<ResultSet>(){
                public void exec(ResultSet rs) throws SQLException
                {
                    msg.append(rs.getString(_ehrStudy.getSubjectColumnName()) + "(" + _dateFormat.format(rs.getDate("date"))+ ")" + "<br>\n");
                }
            });

            msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=Birth&query.gender~isblank=&query.date~dategte=-90d'>Click here to view these animals</a></p>\n");
            msg.append("<hr>\n");
        }
    }

    /**
     * we find non-continguous housing records
     */
    protected void nonContiguousHousing(final StringBuilder msg)
    {
        Calendar cal = Calendar.getInstance();
        cal.setTime(new Date());
        cal.add(Calendar.YEAR, -1);

        MutablePropertyValues mpv = new MutablePropertyValues();
        mpv.addPropertyValue("schemaName", "study");
        mpv.addPropertyValue("query.queryName", "HousingCheck");
        mpv.addPropertyValue("query.param.MINDATE", _dateFormat.format(cal.getTime()));

        BindException errors = new NullSafeBindException(new Object(), "command");
        UserSchema us = QueryService.get().getUserSchema(_ns.getUser(), _ehrContainer, "study");
        QuerySettings qs = us.getSettings(mpv, "query");

        QueryView view = new QueryView(us, qs, errors);
        Results rs = null;
        try
        {
            rs = view.getResults();
            int total = 0;
            while (rs.next())
            {
                total++;
            }

            if (total > 0)
            {
                msg.append("<b>WARNING: There are " + total + " housing records since " + _dateFormat.format(cal.getTime()) + " that do not have a contiguous previous or next record.</b><br>\n");
                msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=HousingCheck&query.param.MINDATE=" + _dateFormat.format(cal.getTime()) + "'>Click here to view and update them</a><br>\n\n");
                msg.append("<hr>\n\n");
            }
        }
        catch (SQLException e)
        {
            throw new RuntimeSQLException(e);
        }
        catch (IOException e)
        {
            throw new RuntimeException(e);
        }
        finally
        {
            ResultSetUtil.close(rs);
        }
    }

    /**
     * we find open assignments where the animal is not alive
     */
    protected void activeAssignmentsForDeadAnimals(final StringBuilder msg)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Id/Dataset/Demographics/calculated_status"), "Alive", CompareType.NEQ_OR_NULL);
        filter.addCondition(FieldKey.fromString("enddate"), null, CompareType.ISBLANK);
        TableSelector ts = new TableSelector(_studySchema.getTable("Assignment"), Table.ALL_COLUMNS, filter, new Sort(_ehrStudy.getSubjectColumnName()));
        if (ts.getRowCount() > 0)
        {
            msg.append("<b>WARNING: There are " + ts.getRowCount() + " active assignments for animals not currently at the center.</b><br>\n");
            msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=Assignment&query.enddate~isblank&query.Id/Dataset/Demographics/calculated_status~neqornull=Alive'>Click here to view and update them</a><br>\n\n");
            msg.append("<hr>\n\n");
        }
    }

    /**
     * we find open ended problems where the animal is not alive
     */
    protected void activeProblemsForDeadAnimals(final StringBuilder msg)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Id/Dataset/Demographics/calculated_status"), "Alive", CompareType.NEQ_OR_NULL);
        filter.addCondition(FieldKey.fromString("enddate"), null, CompareType.ISBLANK);
        TableSelector ts = new TableSelector(_studySchema.getTable("Problem List"), Table.ALL_COLUMNS, filter, new Sort(_ehrStudy.getSubjectColumnName()));
        if (ts.getRowCount() > 0)
        {
            msg.append("<b>WARNING: There are " + ts.getRowCount() + " unresolved problems for animals not currently at the center.</b><br>\n");
            msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=Problem List&query.enddate~isblank&query.Id/Dataset/Demographics/calculated_status~neqornull=Alive'>Click here to view and update them</a><br>\n\n");
            msg.append("<hr>\n\n");
        }
    }

    /**
     * we find open ended treatments where the animal is not alive
     */
    protected void activeTreatmentsForDeadAnimals(final StringBuilder msg)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Id/Dataset/Demographics/calculated_status"), "Alive", CompareType.NEQ_OR_NULL);
        filter.addCondition(FieldKey.fromString("enddate"), null, CompareType.ISBLANK);
        TableSelector ts = new TableSelector(_studySchema.getTable("Treatment Orders"), Table.ALL_COLUMNS, filter, new Sort(_ehrStudy.getSubjectColumnName()));
        if (ts.getRowCount() > 0)
        {
            msg.append("<b>WARNING: There are " + ts.getRowCount() + " active treatments for animals not currently at the center.</b><br>\n");
            msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=Treatment Orders&query.enddate~isblank&query.Id/Dataset/Demographics/calculated_status~neqornull=Alive'>Click here to view and update them</a><br>\n\n");
            msg.append("<hr>\n\n");
        }
    }

    /**
     * then we find all living siv+ animals not exempt from pair housing (20060202)
     */
    protected void sivPosNotExempt(final StringBuilder msg)
    {
        String project = "20060202";
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("calculated_status"), "Alive", CompareType.EQUAL);
        filter.addCondition(FieldKey.fromString("medical"), "siv;shiv", CompareType.CONTAINS_ONE_OF);
        filter.addCondition(FieldKey.fromString("Id/activeAssignments/ActiveVetAssignments"), project, CompareType.DOES_NOT_CONTAIN);
        TableSelector ts = new TableSelector(_studySchema.getTable("Demographics"), Table.ALL_COLUMNS, filter, new Sort(_ehrStudy.getSubjectColumnName()));
        if (ts.getRowCount() > 0)
        {
            msg.append("<b>WARNING: There are " + ts.getRowCount() + " animals with SIV in the medical field, but not actively assigned to exempt from paired housing (" + project + "):</b><br>\n");
            msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=Demographics&query.viewName=Alive%2C%20at%20Center&query.medical~contains=siv&query.Id%2FactiveAssignments%2FActiveVetAssignments~doesnotcontain=" + project + "'>Click here to view them</a></p>\n");
            msg.append("<hr>\n");
        }
    }

    /**
     * then we find all animals with cage size problems
     * @param msg
     */
    protected void cageReview(final StringBuilder msg)
    {
        MutablePropertyValues mpv = new MutablePropertyValues();
        mpv.addPropertyValue("schemaName", "study");
        mpv.addPropertyValue("query.queryName", "CageReview");
        mpv.addPropertyValue("query.viewName", "Problem Cages");

        BindException errors = new NullSafeBindException(new Object(), "command");
        UserSchema us = QueryService.get().getUserSchema(_ns.getUser(), _ehrContainer, "study");
        QuerySettings qs = us.getSettings(mpv, "query");
        QueryView view = new QueryView(us, qs, errors);
        Results rs = null;
        try
        {
            rs = view.getResults();
            int total = 0;
            while (rs.next())
            {
                total++;
            }

            if (total > 0)
            {
                msg.append("<b>WARNING: The following cages are too small for the animals currently in them:</b><br>");
                do
                {
                    msg.append(appendField("Location", rs) + "<br>");
                }
                while (rs.next());

                msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=CageReview&query.viewName=Problem Cages'>Click here to view these cages</a></p>\n");
                msg.append("<hr>\n");
            }
        }
        catch (SQLException e)
        {
            throw new RuntimeSQLException(e);
        }
        catch (IOException e)
        {
            throw new RuntimeException(e);
        }
        finally
        {
            ResultSetUtil.close(rs);
        }
    }
}
