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

import org.apache.log4j.Logger;
import org.labkey.api.data.Container;
import org.labkey.api.ehr.HistoryDataSource;
import org.labkey.api.ehr.HistoryRow;
import org.labkey.api.security.User;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 2/17/13
 * Time: 3:39 PM
 */
public class ClinicalHistoryManager
{
    private static final ClinicalHistoryManager _instance = new ClinicalHistoryManager();

    private Map<String, List<HistoryDataSource>> _dataSources = new HashMap<String, List<HistoryDataSource>>();
    private Logger _log = Logger.getLogger(ClinicalHistoryManager.class);

    private ClinicalHistoryManager()
    {
        registerDataSource(new DefaultProblemListDataSource());
        registerDataSource(new DefaultProblemListCloseDataSource());

        registerDataSource(new DefaultCasesDataSource());
        registerDataSource(new DefaultCasesCloseDataSource());

        registerDataSource(new DefaultEncountersDataSource());

        registerDataSource(new DefaultClinicalRemarksDataSource());
        registerDataSource(new DefaultDrugsDataSource());
        registerDataSource(new DefaultWeightDataSource());
        registerDataSource(new DefaultAlopeciaDataSource());
        registerDataSource(new DefaultAssignmentDataSource());
        registerDataSource(new DefaultAssignmentEndDataSource());

        registerDataSource(new DefaultBirthDataSource());
        registerDataSource(new DefaultDeliveryDataSource());
        registerDataSource(new DefaultPregnanciesDataSource());

        registerDataSource(new DefaultBloodDrawDataSource());
        registerDataSource(new DefaultBodyConditionDataSource());

        registerDataSource(new DefaultLabworkDataSource());

        registerDataSource(new DefaultDeathsDataSource());
        registerDataSource(new DefaultArrivalDataSource());
        registerDataSource(new DefaultDepartureDataSource());
        registerDataSource(new DefaultHousingDataSource());

        registerDataSource(new DefaultTBDataSource());

        registerDataSource(new DefaultTreatmentOrdersDataSource());
        registerDataSource(new DefaultTreatmentEndDataSource());
    }

    public static ClinicalHistoryManager get()
    {
        return _instance;
    }

    public void registerDataSource(HistoryDataSource dataSource)
    {
        String key = dataSource.getName();
        List<HistoryDataSource> sources = _dataSources.get(key);

        if (sources == null)
            sources = new ArrayList<HistoryDataSource>();

        sources.add(0, dataSource);

        _dataSources.put(key, sources);
    }

    public List<HistoryRow> getHistory(Container c, User u, String subjectId, Date minDate, Date maxDate)
    {
        List<HistoryRow> rows = new ArrayList<HistoryRow>();

        for (HistoryDataSource ds : getDataSources(c, u))
        {
            List<HistoryRow> newRows = ds.getRows(c, u, subjectId, minDate, maxDate);
            if (newRows != null)
                rows.addAll(newRows);
        }

        sortRowsByDate(rows);

        return rows;
    }

    public List<HistoryRow> getHistory(Container c, User u, String subjectId, String caseId)
    {
        List<HistoryRow> rows = new ArrayList<HistoryRow>();

        for (HistoryDataSource ds : getDataSources(c, u))
        {
            List<HistoryRow> newRows = ds.getRows(c, u, subjectId, caseId);
            if (newRows != null)
                rows.addAll(newRows);
        }

        sortRowsByDate(rows);

        return rows;
    }

    public void sortRowsByDate(List<HistoryRow> rows)
    {
        Collections.sort(rows, new Comparator<HistoryRow>()
        {
            @Override
            public int compare(HistoryRow o1, HistoryRow o2)
            {
                return (-1 * (o1.getSortDateString().compareTo(o2.getSortDateString())));
            }
        });
    }

    protected List<HistoryDataSource> getDataSources(Container c, User u)
    {
        List<HistoryDataSource> sources = new ArrayList<HistoryDataSource>();
        for (List<HistoryDataSource> list : _dataSources.values())
        {
            for (HistoryDataSource source : list)
            {
                if (source.isAvailable(c, u))
                {
                    sources.add(source);
                    break;
                }
            }
        }

        return sources;
    }
}
