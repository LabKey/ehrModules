/*
 * Copyright (c) 2013-2017 LabKey Corporation
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
package org.labkey.api.ehr.demographics;

import org.apache.commons.lang3.time.DurationFormatUtils;
import org.apache.log4j.Logger;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.ConvertHelper;
import org.labkey.api.data.Results;
import org.labkey.api.data.ResultsImpl;
import org.labkey.api.data.Selector;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Sort;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.ehr.EHROwnable;
import org.labkey.api.module.Module;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;

import java.sql.Clob;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Calendar;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

/**
 * User: bimber
 * Date: 7/9/13
 */
abstract public class AbstractDemographicsProvider extends EHROwnable implements DemographicsProvider
{
    protected static final Logger _log = Logger.getLogger(AbstractDemographicsProvider.class);

    private String _schemaName;
    private String _queryName;
    protected boolean _supportsQCState = true;

    public AbstractDemographicsProvider(Module owner, String schemaName, String queryName)
    {
        super(owner);
        _schemaName = schemaName;
        _queryName = queryName;
    }

    public Map<String, Map<String, Object>> getProperties(Container c, User u, Collection<String> ids)
    {
        if (ids.size() > DemographicsProvider.MAXIMUM_BATCH_SIZE)
        {
            _log.error("unexpected amount of IDs in demographics provider: " + getName() + ".  was: " + ids.size(), new Exception());
        }

        final Map<String, Map<String, Object>> ret = new HashMap<>();
        final TableInfo ti = getTableInfo(c, u);

        SimpleFilter filter = getFilter(ids);
        final Map<FieldKey, ColumnInfo> cols = getColumns(ti);
        TableSelector ts = new TableSelector(ti, cols.values(), filter, getSort());
        ts.setForDisplay(true);

        ts.forEach(new Selector.ForEachBlock<ResultSet>()
        {
            @Override
            public void exec(ResultSet object) throws SQLException
            {
                Results rs = new ResultsImpl(object, cols);

                String id = rs.getString(FieldKey.fromString(ti.getColumn("Id").getAlias()));

                Map<String, Object> map = ret.get(id);
                if (map == null)
                    map = new TreeMap<>();

                processRow(rs, cols, map);

                ret.put(id, map);
            }
        });

        return ret;
    }

    protected TableInfo getTableInfo(Container c, User u)
    {
        UserSchema us = QueryService.get().getUserSchema(u, c, _schemaName);
        if (us == null)
        {
            throw new IllegalArgumentException("Schema " + _schemaName + " not found in the container: " + c.getPath());
        }

        final TableInfo ti = us.getTable(_queryName);
        if (ti == null)
        {
            throw new IllegalArgumentException("Table: " + _schemaName + "." + _queryName + " not found in the container: " + c.getPath());
        }

        return ti;
    }

    protected SimpleFilter getFilter(Collection<String> ids)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Id"), ids, CompareType.IN);
        if (this._supportsQCState)
            filter.addCondition(FieldKey.fromString("QCState/publicdata"), true, CompareType.EQUAL);

        return filter;
    }

    protected void processRow(Results rs, Map<FieldKey, ColumnInfo> cols, Map<String, Object> map) throws SQLException
    {
        for  (FieldKey key : cols.keySet())
        {
            Object val = rs.getObject(key);
            if (val instanceof Clob)
            {
                val = ConvertHelper.convertClobToString((Clob)val);
            }

            map.put(key.toString(), val);
        }
    }

    public Collection<String> getKeysToTest()
    {
        Set<String> ret = getKeys();
        ret.remove("objectid");

        return Collections.unmodifiableCollection(ret);
    }

    public Set<String> getIdsToUpdate(Container c, String id, Map<String, Object> originalProps, Map<String, Object> newProps)
    {
        // Most changes to an individual animal's data won't affect the information cached for other animals
        return Collections.emptySet();
    }

    @Override
    public Set<String> getKeys()
    {
        Set<String> ret = new HashSet<>();
        for (FieldKey key : getFieldKeys())
        {
            ret.add(key.toString());
        }

        ret.add("Id");
        ret.add("objectid");

        return ret;
    }

    protected Sort getSort()
    {
        return null;
    }

    protected Map<FieldKey, ColumnInfo> getColumns(TableInfo ti)
    {
        Set<FieldKey> keys = new HashSet<FieldKey>();
        keys.add(FieldKey.fromString("Id"));
        keys.addAll(getFieldKeys());

        //always add objectid, if exists
        if (ti.getColumn("objectid") != null)
        {
            keys.add(FieldKey.fromString("objectid")) ;
        }

        return QueryService.get().getColumns(ti, keys);
    }

    abstract protected Collection<FieldKey> getFieldKeys();

    public boolean requiresRecalc(String schema, String query)
    {
        return _schemaName.equalsIgnoreCase(schema) && _queryName.equalsIgnoreCase(query);
    }

    // modified version from AgeYearsMonthsDaysDisplayColumn
    protected String getFormattedDuration(Date startDate, Date endDate, boolean leaveEndDateNullsFlag)
    {
        if (startDate == null)
            return null;

        Calendar birthCal = Calendar.getInstance();
        birthCal.setTime(startDate);

        Calendar deathCal = Calendar.getInstance();
        if (leaveEndDateNullsFlag && endDate == null)
            return null;

        deathCal.setTime(endDate == null ? new Date() : endDate);

        String formattedAge;
        try
        {
            formattedAge = DurationFormatUtils.formatPeriod(birthCal.getTimeInMillis(), deathCal.getTimeInMillis(), "yy:MM:dd");
        }
        catch (IllegalArgumentException iae)
        {
            _log.error("Error formatting duration with startDate '" + startDate + "' and endDate '" + endDate + "'.");
            iae.printStackTrace(System.err);
            return "Error";
        }

        return formattedAge;
    }
}
