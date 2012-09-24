package org.labkey.ehr.utils;

import org.labkey.api.data.TableInfo;
import org.labkey.api.security.User;
import org.labkey.ehr.EHRManager;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 9/17/12
 * Time: 8:35 PM
 */
public class DemographicsCache
{
    private DemographicsCache _instance;
    private TableInfo _demographicsQuery;
    private Map<String, AnimalRecord> _records = new HashMap<String, AnimalRecord>();

    private DemographicsCache()
    {
        User u = EHRManager.get().getEHRUser();


    }

    private DemographicsCache get()
    {
        return _instance;
    }

    public List<AnimalRecord> getAnimals(String... ids)
    {
        List<AnimalRecord> records = new ArrayList<AnimalRecord>();
        for (String id : ids)
        {
            if (!_records.containsKey(id))
            {
                queryRecord(id);
            }

            records.add(_records.get(id));
        }


        return records;
    }

    public AnimalRecord queryRecord(String id)
    {
        return new AnimalRecord();
    }

    public void updateAnimal(String id)
    {
        updateAnimal(id, null);
    }

    public void updateAnimal(String id, Map<String, Object> values)
    {

    }

    public static class AnimalRecord
    {
        String _id;
        String _currentArea;
        String _currentRoom;
        String _currentCage;

    }
}
