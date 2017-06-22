/*
 * Copyright (c) 2016-2017 LabKey Corporation
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

import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.apache.commons.lang3.time.DateUtils;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.module.Module;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Results;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.ResultsImpl;
import org.labkey.api.data.Selector;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Sort;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.module.Module;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.security.User;
import org.labkey.api.query.UserSchema;
import org.labkey.api.ldk.notification.AbstractNotification;
import org.labkey.api.util.DateUtil;
import org.labkey.ehr_compliancedb.EHR_ComplianceDBModule;
import org.labkey.ehr_compliancedb.EHR_ComplianceDBUserSchema;


import java.util.Date;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

//Added 3-29-2016  Blasa

public class EmployeeComplianceNotification extends AbstractNotification
{


    public EmployeeComplianceNotification(Module owner)
    {
        super(owner);
    }

    @Override
    public String getName()
    {
        return "Employee Compliance Notification";
    }

    @Override
    public String getEmailSubject(Container c)
    {
        return "Employee Compliance Notification: " + DateUtil.formatDateTime(c);
    }

    @Override

    public String getCategory()
    {
        return "Employee Compliance";
    }


    @Override
    public String getCronString() {return "0 0 20 * * ?";}

    @Override
    public String getScheduleDescription()
    {
        return "daily at 8PM";
    }

    @Override
    public String getDescription()
    {
        return "The report sends an alert whenever Employee Compliance records are created.";
    }

    @Override
    public String getMessageBodyHTML(Container c, User u)
    {
        StringBuilder msg = new StringBuilder();
        Date now = new Date();
        msg.append("The following individuals have been added to the PRIMe Training database.<p>");

        EmployeeComplianceNotification(c, u, msg, new Date());

        return msg.toString();
    }

    private void EmployeeComplianceNotification(Container c, User u, final StringBuilder msg,  final Date maxDate)
    {
        Date curDate = new Date();
        Date roundedMax = new Date();
        roundedMax.setTime(maxDate.getTime());
        roundedMax = DateUtils.truncate(roundedMax, Calendar.DATE);

        UserSchema schema = QueryService.get().getUserSchema(u, c, "ehr_compliancedb");
        if (schema == null)
        {
            msg.append("Could not find EHR_ComplainceDB schema in folder ");
            msg.append(c.getPath());
            msg.append(" - is the module enabled?");
            return;
        }
        TableInfo ti = schema.getTable("employees");

        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("created"), roundedMax, CompareType.DATE_EQUAL);
        filter.addCondition(FieldKey.fromString("created"), maxDate, CompareType.LTE);


        Set<FieldKey> columns = new HashSet<>();
        columns.add(FieldKey.fromString("employeeid"));
        columns.add(FieldKey.fromString("lastName"));
        columns.add(FieldKey.fromString("firstName"));
        columns.add(FieldKey.fromString("category"));
        columns.add(FieldKey.fromString("unit"));
        columns.add(FieldKey.fromString("supervisor"));
        columns.add(FieldKey.fromString("location"));

        final Map<FieldKey, ColumnInfo> colMap = QueryService.get().getColumns(ti, columns);
        TableSelector ts = new TableSelector(ti, colMap.values(), filter, new Sort("lastName"));
        long total = ts.getRowCount();
        if (total == 0)
        {
            msg.append("There are no individuals added into  PRIMe Training database for today.\n");
        }
        else
        {
                 //Create header information on this report
            msg.append("<table border=1 style='border-collapse: collapse;'>");
            msg.append("<tr style='font-weight: bold;'><td>Employee ID</td><td>First Name</td><td>Last Name</td><td>Category</td><td>Unit</td><td>Supervisor</td><td>Location</td></tr>\n");


            ts.forEach(new Selector.ForEachBlock<ResultSet>()
            {
                @Override
                public void exec(ResultSet rs) throws SQLException
                {
                    msg.append("<tr><td>" + (rs.getString("employeeid") == null ? "" : rs.getString("employeeid")) + "</td><td>" + rs.getString("firstName") + "</td><td>" + rs.getString("lastName")  + "</td><td>" + rs.getString("category")  + "</td><td>" + rs.getString("unit")  + "</td><td>" + rs.getString("supervisor") + "</td><td>" + rs.getString("location")+ "</td></tr>\n");

                }
            });

            msg.append("</table>\n");

        }
    }
}
