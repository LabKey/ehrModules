package org.labkey.ehr.history;

import org.labkey.api.data.Container;
import org.labkey.api.security.User;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 3/6/13
 * Time: 9:44 AM
 */
public class LabworkManager
{
    private static final LabworkManager _instance = new LabworkManager();
    private List<LabworkType> _types = new ArrayList<LabworkType>();

    private LabworkManager()
    {
        //TODO
        registerType(new AntibioticSensitivityLabworkType());
        registerType(new ChemistryLabworkType());
        registerType(new HematologyLabworkType());

        registerType(new MicrobiologyLabworkType());
        registerType(new MiscTestsLabworkType());
        registerType(new ParasitologyLabworkType());
        registerType(new UrinalysisLabworkType());

        registerType(new VirologyLabworkType());
    }

    public static LabworkManager get()
    {
        return _instance;
    }

    public void registerType(LabworkType type)
    {
        _types.add(type);
    }

    public List<String> getResults(Container c, User u, String runId)
    {
        List<String> list = new ArrayList<String>();
        for (LabworkType type : _types)
        {
            list.addAll(type.getResults(c, u, runId));
        }

        return list;
    }

    public Map<String, List<String>> getResults(Container c, User u, List<String> runIds)
    {
        Map<String, List<String>> map = new HashMap<String, List<String>>();
        for (LabworkType type : _types)
        {
            merge(map, type.getResults(c, u, runIds));
        }

        return map;
    }

    public Map<String, List<String>> getResults(Container c, User u, String id, Date minDate, Date maxDate)
    {
        Map<String, List<String>> map = new HashMap<String, List<String>>();
        for (LabworkType type : _types)
        {
            merge(map, type.getResults(c, u, id, minDate, maxDate));
        }

        return map;
    }

    private void merge(Map<String, List<String>> map, Map<String, List<String>> newMap)
    {
        for (String runId : newMap.keySet())
        {
            List<String> existing = map.get(runId);
            if (existing == null)
                existing = new ArrayList<String>();

            existing.addAll(newMap.get(runId));

            map.put(runId, existing);
        }
    }
}
