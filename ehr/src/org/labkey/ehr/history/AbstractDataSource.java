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
import org.labkey.api.data.Table;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.gwt.client.util.StringUtils;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.util.Pair;

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
        _category = category;
    }

    public List<HistoryRow> getRows(Container c, User u, final String subjectId, Date minDate, Date maxDate)
    {
        Date start = new Date();

        UserSchema us = QueryService.get().getUserSchema(u, c, _schema);
        if (us == null)
            return null;

        final TableInfo ti = us.getTable(_query);
        if (ti == null)
            return  null;

        SimpleFilter filter = getFilter(subjectId, minDate, maxDate);
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
                Date date = results.getDate(getDateField());
                date = DateUtils.round(date, Calendar.DATE);

                String html = getHtml(results);
                if (!StringUtils.isEmpty(html))
                    rows.add(new HistoryRow(getCategory(results), subjectId, date, html));
            }
        });

        long duration = ((new Date()).getTime() - start.getTime()) / 1000;
        _log.info("Loaded history for: " + subjectId + " on table " + _query + " in " + duration + " seconds");

        return rows;
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
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("id"), subjectId);

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
            return label + ": " + rs.getString(fk) + (suffix == null ? "" : suffix) + "\n";
        }
        return "";
    }

    abstract protected String getHtml(Results rs) throws SQLException;
}
