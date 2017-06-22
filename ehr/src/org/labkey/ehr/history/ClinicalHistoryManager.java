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
package org.labkey.ehr.history;

import org.apache.log4j.Logger;
import org.labkey.api.data.Container;
import org.labkey.api.ehr.history.HistoryDataSource;
import org.labkey.api.ehr.history.HistoryRow;
import org.labkey.api.security.User;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.Date;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * User: bimber
 * Date: 2/17/13
 * Time: 3:39 PM
 */
public class ClinicalHistoryManager
{
    private static final ClinicalHistoryManager _instance = new ClinicalHistoryManager();
    private static final Logger _log = Logger.getLogger(ClinicalHistoryManager.class);

    private final List<HistoryDataSource> _dataSources = new ArrayList<>();

    private ClinicalHistoryManager(){}

    public static ClinicalHistoryManager get()
    {
        return _instance;
    }

    public void registerDataSource(HistoryDataSource dataSource)
    {
        _dataSources.add(dataSource);
    }

    public List<HistoryRow> getHistory(Container c, User u, String subjectId, Date minDate, Date maxDate, boolean redacted)
    {
        List<HistoryRow> rows = new ArrayList<>();

        for (HistoryDataSource ds : getDataSources(c, u))
        {
            List<HistoryRow> newRows = ds.getRows(c, u, subjectId, minDate, maxDate, redacted);
            if (newRows != null)
                rows.addAll(newRows);
        }

        sortRowsByDate(rows);

        return rows;
    }

    public Set<String> getTypes(Container c, User u)
    {
        Set<String> types = new HashSet<String>();

        for (HistoryDataSource ds : getDataSources(c, u))
        {
            types.addAll(ds.getAllowableCategoryGroups(c, u));
        }

        return types;
    }

    public List<HistoryRow> getHistory(Container c, User u, String subjectId, String caseId, boolean redacted)
    {
        List<HistoryRow> rows = new ArrayList<>();

        for (HistoryDataSource ds : getDataSources(c, u))
        {
            List<HistoryRow> newRows = ds.getRows(c, u, subjectId, caseId, redacted);
            if (newRows != null)
                rows.addAll(newRows);
        }

        sortRowsByDate(rows);

        return rows;
    }

    public void sortRowsByDate(List<HistoryRow> rows)
    {
        rows.sort(Comparator.comparing(HistoryRow::getSortDateString, Comparator.reverseOrder()));
    }

    protected List<HistoryDataSource> getDataSources(Container c, User u)
    {
        Map<String, HistoryDataSource> sources = new LinkedHashMap<>();
        for (HistoryDataSource source : _dataSources)
        {
            if (source.isAvailable(c, u))
            {
                if (sources.containsKey(source.getName()))
                    _log.warn("There is an existing source with the name: " + source.getName());

                sources.put(source.getName(), source);
            }
        }

        return new ArrayList<>(sources.values());
    }
}
