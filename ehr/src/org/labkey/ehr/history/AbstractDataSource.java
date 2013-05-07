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
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.Results;
import org.labkey.api.data.ResultsImpl;
import org.labkey.api.data.Selector;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.ehr.HistoryDataSource;
import org.labkey.api.ehr.HistoryRow;
import org.labkey.api.gwt.client.util.StringUtils;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.ehr.EHRModule;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 2/17/13
 * Time: 6:51 PM
 */
abstract public class AbstractDataSource implements HistoryDataSource
{
    private String _schema;
    private String _query;
    private String _category;
    private String _name;
    private String _subjectIdField = "Id";
    protected static final Logger _log = Logger.getLogger(HistoryDataSource.class);

    protected final static SimpleDateFormat _dateTimeFormat = new SimpleDateFormat("yyyy-MM-dd kk:mm");
    protected final static SimpleDateFormat _dateFormat = new SimpleDateFormat("yyyy-MM-dd");
    protected final static SimpleDateFormat _timeFormat = new SimpleDateFormat("kk:mm");

    public AbstractDataSource(String schema, String query)
    {
        this(schema, query, query);
    }

    public AbstractDataSource(String schema, String query, String category)
    {
        _schema = schema;
        _query = query;
        _name = category;
        _category = category;
    }

    public AbstractDataSource(String schema, String query, String name, String category)
    {
        _schema = schema;
        _query = query;
        _name = name;
        _category = category;
    }

    public String getName()
    {
        return _name;
    }

    protected TableInfo getTableInfo(Container c, User u)
    {
        UserSchema us = QueryService.get().getUserSchema(u, c, _schema);
        if (us == null)
            return null;

        return us.getTable(_query);
    }

    public List<HistoryRow> getRows(Container c, User u, String subjectId, String caseId)
    {
        String caseIdField = "caseId";
        if (getTableInfo(c, u).getColumn(caseIdField) == null)
            return Collections.emptyList();

        SimpleFilter filter = new SimpleFilter(FieldKey.fromString(caseIdField), caseId, CompareType.EQUAL);
        filter.addCondition(FieldKey.fromString("Id"), subjectId, CompareType.EQUAL);
        return getRows(c, u, filter);
    }

    public List<HistoryRow> getRows(Container c, User u, final String subjectId, Date minDate, Date maxDate)
    {
        SimpleFilter filter = getFilter(subjectId, minDate, maxDate);
        return getRows(c, u, filter);
    }

    protected List<HistoryRow> getRows(Container c, User u, SimpleFilter filter)
    {
        Date start = new Date();
        final TableInfo ti = getTableInfo(c, u);
        if (ti == null)
            return  null;

        final Collection<ColumnInfo> cols = getColumns(ti);

        TableSelector ts = new TableSelector(ti, cols, filter, null);
        ts.setForDisplay(true);

        final List<HistoryRow> rows = new ArrayList<HistoryRow>();
        ts.forEach(new Selector.ForEachBlock<ResultSet>()
        {
            @Override
            public void exec(ResultSet rs) throws SQLException
            {
                Results results = new ResultsImpl(rs, cols);
                Date date = results.getTimestamp(getDateField());
                String category = getCategory(results);

                String html = getHtml(results);
                String subjectId = results.getString(FieldKey.fromString(_subjectIdField));
                if (!StringUtils.isEmpty(html))
                {
                    HistoryRow row = createHistoryRow(results, category, subjectId, date, html);
                    if (row != null)
                        rows.add(row);
                }
            }
        });

        long duration = ((new Date()).getTime() - start.getTime()) / 1000;
        if (duration > 3)
            _log.error("Loaded history on table " + _query + " in " + duration + " seconds");

        return rows;
    }

    protected HistoryRow createHistoryRow(Results results, String category, String subjectId, Date date, String html) throws SQLException
    {
        return new HistoryRowImpl(category, subjectId, date, html);
    }

    protected String getCategory(Results rs) throws SQLException
    {
        return _category;
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

    protected SimpleFilter getFilter(String subjectId, Date minDate, Date maxDate)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString(_subjectIdField), subjectId);

        if (minDate != null)
            filter.addCondition(FieldKey.fromString(getDateField()), minDate, CompareType.DATE_GTE);

        if (maxDate != null)
            filter.addCondition(FieldKey.fromString(getDateField()), maxDate, CompareType.DATE_LTE);

        return filter;
    }

    protected String getDateField()
    {
        return "date";
    }

    protected Set<String> getColumnNames()
    {
        return null;
    }

    protected String snomedToString(Results rs, FieldKey codeField, FieldKey meaningField) throws SQLException
    {
        StringBuilder sb = new StringBuilder();
        if (rs.hasColumn(meaningField))
        {
            sb.append(rs.getString(meaningField));
            if (rs.hasColumn(codeField) && !StringUtils.isEmpty(rs.getString(codeField)))
            {
                sb.append(" (").append(rs.getString(codeField)).append(")");
            }
            sb.append("\n");
        }
        else
        {
            if (rs.hasColumn(codeField) && !StringUtils.isEmpty(rs.getString(codeField)))
            {
                sb.append(rs.getString(codeField)).append("\n");
            }
        }

        return sb.toString();
    }

    protected String safeAppend(Results rs, String label, String field) throws SQLException
    {
        return safeAppend(rs, label, field, null);
    }

    protected String safeAppend(Results rs, String label, String field, String suffix) throws SQLException
    {
        FieldKey fk = FieldKey.fromString(field);
        if (rs.hasColumn(fk) && rs.getObject(fk) != null)
        {
            return (label == null ? "" : label + ": ") + rs.getString(fk) + (suffix == null ? "" : suffix) + "\n";
        }
        return "";
    }

    public boolean isAvailable(Container c, User u)
    {
        return c.getActiveModules().contains(ModuleLoader.getInstance().getModule(EHRModule.class));
    }

    abstract protected String getHtml(Results rs) throws SQLException;
}
