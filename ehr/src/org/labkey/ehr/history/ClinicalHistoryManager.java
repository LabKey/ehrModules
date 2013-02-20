package org.labkey.ehr.history;

import org.apache.log4j.Logger;
import org.labkey.api.data.Container;
import org.labkey.api.ldk.NavItem;
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

    private Map<String, List<HistoryHandler>> _handlers = new HashMap<String, List<HistoryHandler>>();
    private Logger _log = Logger.getLogger(ClinicalHistoryManager.class);

    private HistoryDataSource[] _defaultSources = new HistoryDataSource[]{
        //demographics row
        new DefaultClinicalRemarksDataSource(),
        new DefaultDrugsDataSource(),
        new DefaultWeightDataSource(),
        new DefaultArrivalDataSource(),
        new DefaultAlopeciaDataSource(),
        new DefaultAssignmentDataSource(),
        //assignment enddate
        new DefaultBirthDataSource(),
        //birth where animal was parent

        new DefaultBloodDrawDataSource(),
        new DefaultBodyConditionDataSource(),
        new DefaultProblemListDataSource(),
        new DefaultProblemListCloseDataSource(),

        new DefaultCasesDataSource(),
        //open/close

        new DefaultEncountersDataSource(),
//        new DefaultWeightDataSource("study", "Clinpath Runs"),
        new DefaultDeathsDataSource(),
        new DefaultDepartureDataSource(),
        new DefaultHousingDataSource(),


//        new DefaultWeightDataSource("ehr", "encounter_summaries"),
//        new DefaultWeightDataSource("ehr", "encounter_participants"),
//        new DefaultWeightDataSource("study", "Flags"),
//        new DefaultWeightDataSource("study", "Notes"),
            //delivery, etc
//
        new DefaultTreatmentOrdersDataSource(),
//        //treatment end
//
//        new DefaultWeightDataSource("study", "Clinical Observations"),
    };

    private ClinicalHistoryManager()
    {

    }

    public static ClinicalHistoryManager get()
    {
        return _instance;
    }

    public void registerHandler(String schema, String query, HistoryHandler handler)
    {
        String key = schema + "." + query;
        List<HistoryHandler> handlers = _handlers.get(key);
        if (handlers == null)
            handlers = new ArrayList<HistoryHandler>();

        handlers.add(handler);

        _handlers.put(key, handlers);
    }

    public List<HistoryRow> getHistory(Container c, User u, String subjectId, Date minDate, Date maxDate)
    {
        List<HistoryRow> rows = new ArrayList<HistoryRow>();

        for (HistoryDataSource ds : getDataSources())
        {
            rows.addAll(ds.getRows(c, u, subjectId, minDate, maxDate));
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
                return (-1 * (o1.getSortDate().compareTo(o2.getSortDate())));
            }
        });
    }

    protected List<HistoryDataSource> getDataSources()
    {
        return new ArrayList<HistoryDataSource>(Arrays.asList(_defaultSources));
    }
}
