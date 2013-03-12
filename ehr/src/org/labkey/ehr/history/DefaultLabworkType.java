package org.labkey.ehr.history;

import org.apache.commons.lang3.StringUtils;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.Results;
import org.labkey.api.data.ResultsImpl;
import org.labkey.api.data.Selector;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.util.PageFlowUtil;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 3/6/13
 * Time: 11:14 AM
 */
public class DefaultLabworkType implements LabworkType
{
    protected String _lsidField = "lsid";
    protected String _idField = "Id";
    protected String _runIdField = "runId";
    protected String _dateField = "date";
    protected String _performedByField = "performedby";
    protected String _remarkField = "remark";

    private String _name;
    private String _schemaName;
    private String _queryName;

    protected String _testIdField = "testid";
    protected String _resultField = "result";
    protected String _unitsField = "units";
    protected String _qualResultField = "qualresult";

    protected String _normalRangeField = null;
    protected String _normalRangeStatusField = null;

    public DefaultLabworkType(String name, String schemaName, String queryName)
    {
        _name = name;
        _schemaName = schemaName;
        _queryName = queryName;
    }

    public DefaultLabworkType(String schemaName, String queryName)
    {
        this(queryName, schemaName, queryName);
    }

    protected TableInfo getTableInfo(Container c, User u)
    {
        UserSchema us = QueryService.get().getUserSchema(u, c, _schemaName);
        if (us == null)
            return null;

        return us.getTable(_queryName);
    }

    public String getName()
    {
        return _name;
    }

    public List<String> getResults(Container c, User u, String runId)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString(_runIdField), runId, CompareType.EQUAL);
        Map<String, List<String>> rows = getResults(c, u, filter);
        return rows == null ? null : rows.get(runId);
    }

    public Map<String, List<String>> getResults(Container c, User u, List<String> runIds)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString(_runIdField), runIds, CompareType.IN);
        return getResults(c, u, filter);
    }

    public Map<String, List<String>> getResults(Container c, User u, String id, @Nullable Date minDate, @Nullable Date maxDate)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString(_idField), id, CompareType.EQUAL);

        if (minDate != null)
            filter.addCondition(FieldKey.fromString(_dateField), minDate, CompareType.DATE_GTE);

        if (maxDate != null)
            filter.addCondition(FieldKey.fromString(_dateField), maxDate, CompareType.DATE_LTE);

        return getResults(c, u, filter);
    }

    protected Map<String, List<String>> getResults(Container c, User u, SimpleFilter filter)
    {
        final TableInfo ti = getTableInfo(c, u);
        if (ti == null)
        {
            return new HashMap<String, List<String>>();
        }

        assert ti.getColumn(_runIdField) != null;
        final Collection<ColumnInfo> cols = getColumns(ti);
        TableSelector ts = new TableSelector(ti, cols, filter, null);

        final Map<String, List<String>> rows = new HashMap<String, List<String>>();
        ts.forEach(new Selector.ForEachBlock<ResultSet>()
        {
            @Override
            public void exec(ResultSet object) throws SQLException
            {
                Results rs = new ResultsImpl(object, cols);
                String runId = rs.getString(FieldKey.fromString("runId"));

                List<String> list = rows.get(runId);
                if (list == null)
                    list = new ArrayList<String>();

                String line = getLine(rs);
                if (line != null)
                    list.add(line);

                rows.put(runId, list);
            }
        });

        Map<String, List<String>> formattedRows = new HashMap<String, List<String>>();
        for (String runId : rows.keySet())
        {
            List<String> results = rows.get(runId);
            String table = getResultTable(results);

            List<String> newRows = formattedRows.get(runId);
            if (newRows == null)
                newRows = new ArrayList<String>();

            newRows.add(table);

            formattedRows.put(runId, newRows);
        }

        return formattedRows;
    }

    protected Set<String> getColumnNames()
    {
        Set<String> fields = PageFlowUtil.set(_lsidField, _idField, _dateField, _runIdField, _testIdField, _resultField, _unitsField, _qualResultField, _remarkField, _performedByField);

        if (_normalRangeField != null)
            fields.add(_normalRangeField);

        if (_normalRangeStatusField != null)
            fields.add(_normalRangeStatusField);

        return fields;
    }

    protected String getLine(Results rs) throws SQLException
    {
        StringBuilder sb = new StringBuilder();
        String testId = getTestId(rs);
        Double result = _resultField == null ?  null : rs.getDouble(FieldKey.fromString(_resultField));
        String units = _unitsField == null ?  null : rs.getString(FieldKey.fromString(_unitsField));
        String qualResult = _qualResultField == null ?  null : rs.getString(FieldKey.fromString(_qualResultField));

        if (result != null || qualResult != null)
        {
            sb.append("<td style='padding: 2px;'>").append(testId).append(": ").append("</td>");
            sb.append("<td style='padding: 2px;'>");

            if (result != null)
            {
                sb.append(result);
                if (units != null)
                    sb.append(" ").append(units);
            }

            if (qualResult != null)
            {
                if (sb.length() > 0)
                    sb.append(", ");

                sb.append(qualResult);
            }

            sb.append("</td>");

            //append normals
            String normalRange = _normalRangeField == null ?  null : rs.getString(FieldKey.fromString(_normalRangeField));
            String status = _normalRangeStatusField == null ?  null : rs.getString(FieldKey.fromString(_normalRangeStatusField));
            if (normalRange != null)
            {
                if (status != null)
                {
                    String color = "green";
                    if (status.equals("High"))
                        color = "#E3170D";
                    else if (status.equals("Low"))
                        color = "#FBEC5D";

                    sb.append("<td style='padding: 2px;background-color: " + color + ";'>&nbsp;" + status + "&nbsp;</td>");
                }

                sb.append("<td style='padding: 2px;'>");
                sb.append(" (").append(normalRange).append(")");
                sb.append("</td>");
            }
        }

        return sb.toString();
    }

    private Collection<ColumnInfo> getColumns(TableInfo ti)
    {
        if (getColumnNames() == null)
        {
            Set<ColumnInfo> cols = new HashSet<ColumnInfo>();
            for (FieldKey fk : ti.getDefaultVisibleColumns())
            {
                cols.add(ti.getColumn(fk));
            }
            return cols;
        }

        List<FieldKey> columns = new ArrayList<FieldKey>();
        for (String colName : getColumnNames())
        {
            if (colName == null)
                continue;

            columns.add(FieldKey.fromString(colName));
        }

        QueryService qs = QueryService.get();
        Map<FieldKey, ColumnInfo> map = qs.getColumns(ti, columns);
        Set<FieldKey> fieldKeys = new LinkedHashSet<FieldKey>();

        for (ColumnInfo col : map.values())
        {
            col.getRenderer().addQueryFieldKeys(fieldKeys);
        }

        map = qs.getColumns(ti, fieldKeys);

        return map.values();
    }

    protected String getTestId(Results rs) throws SQLException
    {
        if (_testIdField == null)
            return null;

        FieldKey test = FieldKey.fromString(_testIdField);
        String testId = rs.getString(test);
        if (testId == null && test.getParent() != null)
        {
            testId = rs.getString(test.getParent());
        }

        return testId;
    }

    protected String getResultTable(List<String> results)
    {
        StringBuilder sb = new StringBuilder();
        sb.append("<table>");
        sb.append("<tr>").append(StringUtils.join(results, "</tr><tr>")).append("</tr>");
        sb.append("</table>");
        return sb.toString();
    }
}
