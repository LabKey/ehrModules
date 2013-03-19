/*
 * Copyright (c) 2013 LabKey Corporation
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
package org.labkey.ehr.history;

import org.apache.commons.lang3.time.DateUtils;
import org.apache.log4j.Logger;
import org.json.JSONObject;
import org.labkey.api.ehr.HistoryRow;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 2/17/13
 * Time: 6:29 PM
 */
public class HistoryRowImpl implements HistoryRow
{
    private String _subjectId;
    private Date _date;
    private Date _enddate;
    private Integer _projectId;
    private String _category;
    private String _performedBy;
    private String _caseId;
    private String _runId;
    private String _encounterId;
    private Boolean _showTime = false;
    private String _html;

    protected static final Logger _log = Logger.getLogger(HistoryRowImpl.class);

    protected final static SimpleDateFormat _dateFormat = new SimpleDateFormat("yyyy-MM-dd");
    protected final static SimpleDateFormat _timeFormat = new SimpleDateFormat("kk:mm");

    public HistoryRowImpl(String category, String subjectId, Date date, String html)
    {
        _category = category;
        _subjectId = subjectId;
        _date = date;
        _html = html;
    }

    public JSONObject toJSON()
    {
        JSONObject json = new JSONObject();

        json.put("group", _subjectId + "-" + getSortDateString());
        json.put("sortDate", getSortDateString());

        json.put("id", _subjectId);
        json.put("category", _category);
        json.put("date", _date);
        json.put("enddate", _enddate);
        json.put("project", _projectId);
        json.put("caseId", _caseId);
        json.put("encounterId", _encounterId);
        json.put("runId", _runId);
        json.put("performedby", _performedBy);

        json.put("html", _html);

        if (_showTime)
            json.put("timeString", getTimeString());

        return json;
    }

    public String getSortDateString()
    {
        assert _date != null;

        try
        {
            if (_date == null)
                return "";

            return _dateFormat.format(_date);
        }
        catch (ArrayIndexOutOfBoundsException e)
        {
            _log.error("Invalid date: " + _date + " for table: " + _category + " and animal " + _subjectId, e);
            return "";
        }
    }

    public void setShowTime(Boolean showTime)
    {
        _showTime = showTime;
    }

    public String getSubjectId()
    {
        return _subjectId;
    }

    public Date getDate()
    {
        return _date;
    }

    public String getCategory()
    {
        return _category;
    }

    public String getTimeString()
    {
        return _timeFormat.format(_date);
    }

    public String getHtml()
    {
        return _html;
    }
}