/*
 * Copyright (c) 2017-2018 LabKey Corporation
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
package org.labkey.api.snd;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.json.JSONArray;
import org.json.JSONObject;
import org.labkey.api.collections.ArrayListMap;
import org.labkey.api.data.Container;
import org.labkey.api.gwt.client.model.GWTPropertyDescriptor;
import org.labkey.api.security.User;
import org.labkey.api.util.DateUtil;
import org.labkey.api.util.GUID;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

/**
 * Created by marty on 8/4/2017.
 *
 * Class for project data and related methods. Used when saving, updating, deleting and getting a project
 */

public class Project
{
    private int _projectId = -1;
    private int _revisionNum;
    private String _objectId;
    private Date _startDate;
    private Date  _endDate;
    private String _description;
    private boolean _active;
    private int _referenceId;
    private boolean _hasEvent;
    private boolean _copyRevisedPkgs;
    private Date _endDateRevised;
    private List<ProjectItem> _projectItems = new ArrayList<>();
    private Map<GWTPropertyDescriptor, Object> _extraFields = new HashMap<>();

    private String _container;
    private String _revisedObjectId;
    private Integer _revisedRevNum;

    public static final String PROJECT_ID = "projectId";
    public static final String PROJECT_DESCRIPTION = "description";
    public static final String PROJECT_ACTIVE = "active";
    public static final String PROJECT_STARTDATE = "startDate";
    public static final String PROJECT_ENDDATE = "endDate";
    public static final String PROJECT_OBJECTID = "objectId";
    public static final String PROJECT_CONTAINER = "container";
    public static final String PROJECT_REVNUM = "revisionNum";
    public static final String PROJECT_REFID = "referenceId";
    public static final String PROJECT_ITEMS = "projectItems";

    public static final String PROJECT_HASEVENT = "hasEvent";

    public Project (int id, @Nullable Integer revNum, boolean edit, boolean revision, @NotNull Container c)
    {
        _projectId = ((edit || revision) ? id : SNDSequencer.PROJECTID.ensureId(c, id));
        _objectId = ((edit || revision) ? null : GUID.makeGUID());
        _revisionNum = ((edit || revision) ? revNum : 0);

        if (revision)
        {
            _revisedObjectId = GUID.makeGUID();
            _revisedRevNum = ++revNum;
        }
    }

    public Project () {}

    public int getProjectId()
    {
        return _projectId;
    }

    public void setProjectId(int projectId)
    {
        _projectId = projectId;
    }

    public int getReferenceId()
    {
        return _referenceId;
    }

    public void setReferenceId(int refId)
    {
        _referenceId = refId;
    }

    @Nullable
    public String getContainer()
    {
        return _container;
    }

    public void setContainer(String container)
    {
        _container = container;
    }

    public int getRevisionNum()
    {
        return _revisionNum;
    }

    public void setRevisionNum(int revisionNum)
    {
        _revisionNum = revisionNum;
    }

    @Nullable
    public String getObjectId()
    {
        return _objectId;
    }

    public void setObjectId(String objectId)
    {
        _objectId = objectId;
    }

    public void updateObjectId(String objectId)
    {
        setObjectId(objectId);
        for (ProjectItem projectItem : _projectItems)
        {
            projectItem.setParentObjectId(objectId);
        }
    }

    @Nullable
    public String getRevisedObjectId()
    {
        return _revisedObjectId;
    }

    public void setRevisedObjectId(String revisedObjectId)
    {
        _revisedObjectId = revisedObjectId;
    }

    @Nullable
    public Integer getRevisedRevNum()
    {
        return _revisedRevNum;
    }

    public void setRevisedRevNum(Integer revisedRevNum)
    {
        _revisedRevNum = revisedRevNum;
    }

    @Nullable
    public Date getStartDate()
    {
        return _startDate;
    }

    @Nullable
    public String startDateToString()
    {
        return DateUtil.formatDateISO8601(getStartDate());
    }

    public void setStartDate(Date startDate)
    {
        _startDate = startDate;
    }

    @Nullable
    public Date getEndDate()
    {
        return _endDate;
    }

    @Nullable
    public String endDateToString()
    {
        return DateUtil.formatDateISO8601(getEndDate());
    }

    public void setEndDate(Date endDate)
    {
        _endDate = endDate;
    }

    @Nullable
    public String getDescription()
    {
        return _description;
    }

    public void setDescription(String description)
    {
        _description = description;
    }

    public boolean isActive()
    {
        return _active;
    }

    public void setActive(boolean active)
    {
        _active = active;
    }

    public boolean hasEvent()
    {
        return _hasEvent;
    }

    public void setHasEvent(boolean hasEvent)
    {
        _hasEvent = hasEvent;
    }

    public boolean isCopyRevisedPkgs()
    {
        return _copyRevisedPkgs;
    }

    public void setCopyRevisedPkgs(boolean copyRevisedPkgs)
    {
        _copyRevisedPkgs = copyRevisedPkgs;
    }

    @Nullable
    public Date getEndDateRevised()
    {
        return _endDateRevised;
    }

    public void setEndDateRevised(Date endDateRevised)
    {
        _endDateRevised = endDateRevised;
    }

    @NotNull
    public List<ProjectItem> getProjectItems()
    {
        return _projectItems;
    }

    public void setProjectItems(@NotNull List<ProjectItem> subpackages)
    {
        _projectItems = subpackages;
    }

    @NotNull
    public Map<GWTPropertyDescriptor, Object> getExtraFields()
    {
        return _extraFields;
    }

    public void setExtraFields(@NotNull Map<GWTPropertyDescriptor, Object> extraFields)
    {
        _extraFields = extraFields;
    }

    @NotNull
    public Map<String, Object> getProjectRow(Container c)
    {
        Map<String, Object> projectValues = new ArrayListMap<>();
        projectValues.put(PROJECT_ID, getProjectId());
        projectValues.put(PROJECT_OBJECTID, getObjectId());
        projectValues.put(PROJECT_REVNUM, getRevisionNum());
        projectValues.put(PROJECT_DESCRIPTION, getDescription());
        projectValues.put(PROJECT_ACTIVE, isActive());
        projectValues.put(PROJECT_STARTDATE, getStartDate());
        projectValues.put(PROJECT_ENDDATE, getEndDate());
        projectValues.put(PROJECT_REFID, getReferenceId());
        projectValues.put(PROJECT_CONTAINER, c);

        Map<GWTPropertyDescriptor, Object> extras = getExtraFields();
        for (GWTPropertyDescriptor gpd : extras.keySet())
        {
            projectValues.put(gpd.getName(), extras.get(gpd));
        }

        return projectValues;
    }

    @NotNull
    public List<Map<String, Object>> getProjectItemRows(Container c)
    {
        List<Map<String, Object>> rows = new ArrayList<>();

        for (ProjectItem projectItem : getProjectItems())
        {
            rows.add(projectItem.getRow(c));
        }

        return rows;
    }

    @NotNull
    public JSONObject toJSON(Container c, User u)
    {
        JSONObject json = new JSONObject();
        json.put(PROJECT_ID, getProjectId());
        json.put(PROJECT_DESCRIPTION, getDescription());
        json.put(PROJECT_ACTIVE, isActive());
        json.put(PROJECT_STARTDATE, startDateToString());
        json.put(PROJECT_REVNUM, getRevisionNum());
        json.put(PROJECT_REFID, getReferenceId());
        json.put(PROJECT_HASEVENT, hasEvent());
        if (getEndDate() != null)
            json.put(PROJECT_ENDDATE, endDateToString());

        if (getProjectItems().size() > 0)
        {
            JSONArray jsonProjectItems = new JSONArray();
            for (ProjectItem projectItem : getProjectItems())
            {
                jsonProjectItems.put(projectItem.toJSON(c, u));
            }
            json.put(PROJECT_ITEMS, jsonProjectItems);
        }

        JSONArray extras = new JSONArray();
        Map<GWTPropertyDescriptor, Object> extraFields = getExtraFields();
        if(extraFields.size() > 0)
        {
            JSONObject jsonExtra;
            Set<GWTPropertyDescriptor> keys = new TreeSet<>(
                    Comparator.comparing(GWTPropertyDescriptor::getName)
            );
            keys.addAll(extraFields.keySet());
            for (GWTPropertyDescriptor extraPd : keys)
            {
                jsonExtra = SNDService.get().convertPropertyDescriptorToJson(c, u, extraPd, true);
                jsonExtra.put("value", extraFields.get(extraPd));
                extras.put(jsonExtra);
            }

            json.put("extraFields", extras);
        }

        return json;
    }

    @NotNull
    public Map<String, Object> toShallowMap(Container c, User u)
    {
        Map<String, Object> map = new ArrayListMap<>();

        map.put(PROJECT_ID, getProjectId());
        map.put(PROJECT_DESCRIPTION, getDescription());
        map.put(PROJECT_ACTIVE, isActive());
        map.put(PROJECT_STARTDATE, startDateToString());
        map.put(PROJECT_REVNUM, getRevisionNum());
        map.put(PROJECT_REFID, getReferenceId());
        map.put(PROJECT_HASEVENT, hasEvent());
        if (getEndDate() != null)
            map.put(PROJECT_ENDDATE, endDateToString());
        map.put(PROJECT_OBJECTID, getObjectId());

        return map;
    }
}
