/*
 * Copyright (c) 2016-2019 LabKey Corporation
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
package org.labkey.ehr_compliancedb.notification;

import org.apache.commons.lang3.time.DateUtils;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerFilter;
import org.labkey.api.data.Results;
import org.labkey.api.data.ResultsImpl;
import org.labkey.api.data.Selector;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Sort;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.ldk.notification.AbstractNotification;
import org.labkey.api.module.Module;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.util.DateUtil;
import org.labkey.api.util.PageFlowUtil;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Calendar;
import java.util.Date;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

//Added 1-4-2023  Blasa

public class EmployeeModifieddatasetNotification extends AbstractNotification
{


    public EmployeeModifieddatasetNotification(Module owner)
    {
        super(owner);
    }

    @Override
    public String getName()
    {
        return "Employee Completion Dates Modified Notification";
    }

    @Override
    public String getEmailSubject(Container c)
    {
        return "Employee Completion Dates Modified Notification: " + DateUtil.formatDateTime(c);
    }

    @Override

    public String getCategory()
    {
        return "Employee Compliance";
    }


    @Override
    public String getCronString() {return "0 0 21 * * ?";}

    @Override
    public String getScheduleDescription()
    {
        return "daily at 9 PM";
    }

    @Override
    public String getDescription()
    {
        return "The report sends an alert whenever Employee Completion Data records were modified.";
    }

    @Override
    public String getMessageBodyHTML(Container c, User u)
    {
        StringBuilder msg = new StringBuilder();
        Date now = new Date();
        msg.append("The following individuals have modified the Completion Dataset.<p>");

        EmployeeModifiedNotification(c, u, msg, new Date());

        return msg.toString();
    }

    private void EmployeeModifiedNotification(Container c, User u, final StringBuilder msg,  final Date maxDate)
    {
        Date curDate = new Date();
        Date roundedMax = new Date();
        roundedMax.setTime(maxDate.getTime());
        roundedMax = DateUtils.truncate(roundedMax, Calendar.DATE);

        UserSchema schema = QueryService.get().getUserSchema(u, c, "ehr_compiancedb");
        if (schema == null)
        {
            msg.append("Could not find EHR_ComplainceDB schema in folder ");
            msg.append(c.getPath());
            msg.append(" - is the module enabled?");
            return;
        }


        TableInfo ti = schema.getTable("ComplianceModifiedAuditlog");

        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("created"), roundedMax, CompareType.DATE_EQUAL);
        filter.addCondition(FieldKey.fromString("created"), maxDate, CompareType.LTE);


        Set<FieldKey> columns = new HashSet<>();
        columns.add(FieldKey.fromString("createdby"));
        columns.add(FieldKey.fromString("created"));
//        columns.add(FieldKey.fromString("firstName"));
        columns.add(FieldKey.fromString("queryname"));
        columns.add(FieldKey.fromString("oldrecordmap"));
        columns.add(FieldKey.fromString("newrecordmap"));


        final Map<FieldKey, ColumnInfo> colMap = QueryService.get().getColumns(ti, columns);
        TableSelector ts = new TableSelector(ti, colMap.values(), filter, new Sort("createdby"));
        long total = ts.getRowCount();
        if (total == 0)
        {
            msg.append("There were no Employee Completion Dates records that were modified today.\n");
        }
        else
        {
                 //Create header information on this report
            msg.append("<table border=1 style='border-collapse: collapse;'>");
            msg.append("<tr style='font-weight: bold;'><td>Employee Name</td><td>First Name</td><td>Data Set Name</td><td>Old Record Entries</td><td>Current Record Entries</td><td>Date Created</td></tr>\n");


            ts.forEach(new Selector.ForEachBlock<ResultSet>()
            {
                @Override
                public void exec(ResultSet rs) throws SQLException
                {
                    msg.append("<tr><td>" + (rs.getString("createdby") == null ? "" : rs.getString("queryname")) + "</td><td>" + rs.getString("oldrecordmap") + "</td><td>" + rs.getString("newrecordmap")  + "</td><td>" + rs.getString("created")    + "</td><td>" + "</td></tr>\n");

                }
            });

            msg.append("</table>\n");

        }
    }
}
