/*
 * Copyright (c) 2014-2019 LabKey Corporation
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
package org.labkey.ehr.demographics;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.data.Container;
import org.labkey.api.ehr.demographics.AnimalRecord;
import org.labkey.api.ehr.demographics.DemographicsProvider;
import org.labkey.api.query.FieldKey;

import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * Immutable cached animal demographic record
 *
 * User: bimber
 * Date: 7/14/13
 */
public class AnimalRecordImpl implements AnimalRecord
{
    private Map<String, Object> _props = Collections.unmodifiableMap(new CaseInsensitiveHashMap<>());
    private final Container _container;
    private final String _id;
    private final Date _created;

    private AnimalRecordImpl(Container c, String id)
    {
        _container = c;
        _id = id;
        _created = new Date();
    }

    private AnimalRecordImpl(Container c, String id, Map<String, Object> props)
    {
        this(c, id);
        if (props != null)
        {
            _props = Collections.unmodifiableMap(new CaseInsensitiveHashMap<>(props));
        }
    }

    public static AnimalRecordImpl create(Container c, String id, Map<String, Object> props)
    {
        return new AnimalRecordImpl(c, id, props);
    }

    @Override
    public AnimalRecord createCopy()
    {
        return new AnimalRecordImpl(getContainer(), getId(), _props);
    }

    public synchronized void update(DemographicsProvider p, Map<String, Object> props)
    {
        Map<String, Object> mergedProps = new CaseInsensitiveHashMap<>(_props);
        for (String key : p.getKeys())
        {
            mergedProps.remove(key);
        }

        if (props != null)
            mergedProps.putAll(props);

        _props = Collections.unmodifiableMap(mergedProps);
    }

    @Override
    public String getId()
    {
        return _id;
    }

    @Override
    public Container getContainer()
    {
        return _container;
    }

    @Override
    public Date getCreated()
    {
        return _created;
    }

    @Override
    @NotNull
    public Map<String, Object> getProps()
    {
        return _props;
    }

    @Override
    public String getGender()
    {
        return (String)_props.get("gender");
    }

    @Override
    public String getGenderMeaning()
    {
        return (String)_props.get(FieldKey.fromString("gender/meaning").toString());
    }

    @Override
    public String getOrigGender()
    {
        return (String)_props.get(FieldKey.fromString("gender/origGender").toString());
    }

    @Override
    public String getAgeInYearsAndDays()
    {
        return (String)_props.get(FieldKey.fromString("Id/age/yearAndDays").toString());
    }

    @Override
    public String getSpecies()
    {
        return (String)_props.get("species");
    }

    @Override
    public String getCalculatedStatus()
    {
        return (String)_props.get("calculated_status");
    }

    public String getCalculatedStatusMeaning()
    {
        return (String)_props.get("calculated_status/meaning");
    }

    @Override
    public Date getBirth()
    {
        return (Date)_props.get("birth");
    }

    @Override
    public boolean hasBirthRecord()
    {
        return _props.containsKey("birthInfo") && !getListProperty("birthInfo").isEmpty();
    }

    public boolean hasArrivalRecord()
    {
        return _props.containsKey("arrivalInfo") && !getListProperty("arrivalInfo").isEmpty();
    }

    @Override
    public Date getDeath()
    {
        return (Date)_props.get("death");
    }

    @Override
    public String getGeographicOrigin()
    {
        return (String)_props.get("geographic_origin");
    }

    public String getGeographicOriginDescription()
    {
        return (String)_props.get("geographic_origin/description");
    }

    //used to determine whether this row exists in the demographics table
    @Override
    public String getDemographicsObjectId()
    {
        return (String)_props.get("demographicsObjectId");
    }

    @Override
    public List<Map<String, Object>> getActiveAssignments()
    {
        return getListProperty("activeAssignments");
    }

    @Override
    public List<Map<String, Object>> getActiveTreatments()
    {
        return getListProperty("activeTreatments");
    }

    @Override
    public List<Map<String, Object>> getActiveHousing()
    {
        return getListProperty("activeHousing");
    }

    private List<Map<String, Object>> getListProperty(String prop)
    {
        if (_props.containsKey(prop) && _props.get(prop) instanceof List)
            return Collections.unmodifiableList((List)_props.get(prop));

        return null;
    }

    @Override
    public String getCurrentRoom()
    {
        List<Map<String, Object>> housing = getActiveHousing();
        if (housing != null && housing.size() > 0)
            return (String)housing.get(0).get("room");

        return null;
    }

    @Override
    public String getCurrentCage()
    {
        List<Map<String, Object>> housing = getActiveHousing();
        if (housing != null && housing.size() > 0)
            return (String)housing.get(0).get("cage");

        return null;
    }

    @Override
    public List<Map<String, Object>> getActiveFlags()
    {
        return getListProperty("activeFlags");
    }

    @Override
    public List<Map<String, Object>> getActiveProblem()
    {
        return getListProperty("activeProblems");
    }

    @Override
    public List<Map<String, Object>> getActiveCases()
    {
        return getListProperty("activeCases");
    }

    @Override
    public List<Map<String, Object>> getParents()
    {
        return getListProperty("parents");
    }

    @Override
    public List<Map<String, Object>> getWeights()
    {
        return getListProperty("weights");
    }

    @Override
    public Double getMostRecentWeight()
    {
        return (Double)_props.get(FieldKey.fromString("mostRecentWeight").toString());
    }

    @Override
    public Date getMostRecentWeightDate()
    {
        return (Date)_props.get(FieldKey.fromString("mostRecentWeightDate").toString());
    }

    @Override
    public Date getMostRecentDeparture()
    {
        return (Date)_props.get(FieldKey.fromString("mostRecentDeparture").toString());
    }

    @Override
    public Date getMostRecentArrival()
    {
        if (_props.containsKey("source"))
        {
            List<Map<String, Object>> rows = (List)_props.get("source");
            if (rows.size() > 0)
                return (Date)rows.get(0).get("date");
        }

        return null;
    }

    @Override
    public Integer getDaysSinceWeight()
    {
        return (Integer)_props.get(FieldKey.fromString("daysSinceWeight").toString());
    }
}