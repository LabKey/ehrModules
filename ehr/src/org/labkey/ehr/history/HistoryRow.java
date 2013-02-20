package org.labkey.ehr.history;

import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 2/17/13
 * Time: 6:29 PM
 */
public class HistoryRow
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
    private String _html;

    protected final static SimpleDateFormat _dateFormat = new SimpleDateFormat("yyyy-MM-dd");
    protected final static SimpleDateFormat _timeFormat = new SimpleDateFormat("kk:mm");

    public HistoryRow(String category, String subjectId, Date date, String html)
    {
        _category = category;
        _subjectId = subjectId;
        _date = date;
        _html = html;
    }

    public JSONObject toJSON()
    {
        JSONObject json = new JSONObject();

        json.put("group", _subjectId + "-" + _dateFormat.format(_date));
        json.put("sortDate", getSortDate());

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

        return json;
    }

    public String getSortDate()
    {
        return _date == null ? null : _dateFormat.format(_date);
    }
}