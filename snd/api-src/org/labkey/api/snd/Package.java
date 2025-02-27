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

import java.util.ArrayList;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;

/**
 * Created by marty on 8/4/2017.
 *
 * Class for package data and related methods. Used when saving, updating, deleting and getting a package
 */
public class Package
{
    private Integer _pkgId;
    private String _description;
    private String _narrative;
    private boolean _repeatable;
    private boolean _active;
    private boolean _hasEvent;
    private boolean _hasProject;
    private Date _modified; // column will be used as a timestamp
    private Map<Integer, String> _categories = new HashMap<>();
    private List<GWTPropertyDescriptor> _attributes = new ArrayList<>();
    private List<SuperPackage> _subpackages = new ArrayList<>();
    private Map<GWTPropertyDescriptor, Object> _extraFields = new HashMap<>();
    private Map<String, String> _lookups = new TreeMap<>();
    private Integer _qcState;
    private Integer _topLevelSuperPkgId;

    public static final String PKG_ID = "pkgId";
    public static final String PKG_DESCRIPTION = "description";
    public static final String PKG_ACTIVE = "active";
    public static final String PKG_REPEATABLE = "repeatable";
    public static final String PKG_TOPLEVEL_SUPERPKG = "superPkgId";
    public static final String PKG_QCSTATE = "qcState";
    public static final String PKG_NARRATIVE = "narrative";
    public static final String PKG_CONTAINER = "container";
    public static final String PKG_HASEVENT = "hasEvent";
    public static final String PKG_HASPROJECT = "hasProject";

    public static final String PKG_CATEGORIES = "categories";
    public static final String PKG_ATTRIBUTES = "attributes";
    public static final String PKG_SUBPACKAGES = "subPackages";
    public static final String PKG_MODIFIED = "modified";

    @Nullable
    public Integer getPkgId()
    {
        return _pkgId;
    }

    public void setPkgId(int pkgId)
    {
        _pkgId = pkgId;
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

    @Nullable
    public String getNarrative()
    {
        return _narrative;
    }

    public void setNarrative(String narrative)
    {
        _narrative = narrative;
    }

    public boolean isRepeatable()
    {
        return _repeatable;
    }

    public void setRepeatable(boolean repeatable)
    {
        _repeatable = repeatable;
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

    public boolean hasProject()
    {
        return _hasProject;
    }

    public void setHasProject(boolean hasProject)
    {
        _hasProject = hasProject;
    }

    @NotNull
    public Map<Integer, String> getCategories()
    {
        return _categories;
    }

    public void setCategories(@NotNull Map<Integer, String> categories)
    {
        _categories = categories;
    }

    @NotNull
    public List<GWTPropertyDescriptor> getAttributes()
    {
        return _attributes;
    }

    public void setAttributes(@NotNull List<GWTPropertyDescriptor> attributes)
    {
        _attributes = attributes;
    }

    @NotNull
    public List<SuperPackage> getSubpackages()
    {
        return _subpackages;
    }

    public void setSubpackages(@NotNull List<SuperPackage> subpackages)
    {
        _subpackages = subpackages;
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
    public Map<String, String> getLookups()
    {
        return _lookups;
    }

    public void setLookups(@NotNull Map<String, String> lookups)
    {
        _lookups = lookups;
    }

    @Nullable
    public Integer getQcState()
    {
        return _qcState;
    }

    public void setQcState(Integer qcState)
    {
        _qcState = qcState;
    }

    public Date getModified()
    {
        return _modified;
    }

    public void setModified(Date modified)
    {
        _modified = modified;
    }

    @Nullable
    public Integer getTopLevelSuperPkgId()
    {
        return _topLevelSuperPkgId;
    }

    public void setTopLevelSuperPkgId(Integer topLevelSuperPkgId)
    {
        _topLevelSuperPkgId = topLevelSuperPkgId;
    }

    @NotNull
    public Map<String, Object> getPackageRow(Container c)
    {
        Map<String, Object> pkgValues = new ArrayListMap<>();
        pkgValues.put(PKG_ID, getPkgId());
        pkgValues.put(PKG_NARRATIVE, getNarrative());
        pkgValues.put(PKG_DESCRIPTION, getDescription());
        pkgValues.put(PKG_ACTIVE, isActive());
        pkgValues.put(PKG_REPEATABLE, isRepeatable());
        pkgValues.put(PKG_QCSTATE, getQcState());
        pkgValues.put(PKG_CONTAINER, c);
        pkgValues.put(PKG_MODIFIED, getModified());

        Map<GWTPropertyDescriptor, Object> extras = getExtraFields();
        for (GWTPropertyDescriptor gpd : extras.keySet())
        {
            pkgValues.put(gpd.getName(), extras.get(gpd));
        }

        return pkgValues;
    }

    @NotNull
    public List<Map<String, Object>> getCategoryRows(Container c)
    {
        List<Map<String, Object>> rows = new ArrayList<>();
        Map<String, Object> row;

        for (Integer categoryId : getCategories().keySet())
        {
            row = new ArrayListMap<>();
            row.put(PKG_ID, getPkgId());
            row.put("categoryId", categoryId);
            row.put(PKG_CONTAINER, c);
            rows.add(row);
        }

        return rows;
    }

    @NotNull
    public JSONArray attributesToJson(Container c, User u)
    {
        JSONArray attributes = new JSONArray();
        if(getAttributes() != null)
        {
            for (GWTPropertyDescriptor pd : getAttributes())
            {
                attributes.put(SNDService.get().convertPropertyDescriptorToJson(c, u, pd, true));
            }
        }

        return attributes;
    }

    @NotNull
    public JSONObject toJSON(Container c, User u)
    {
        JSONObject json = new JSONObject();
        json.put(PKG_ID, getPkgId());
        json.put(PKG_DESCRIPTION, getDescription());
        json.put(PKG_REPEATABLE, isRepeatable());
        json.put(PKG_ACTIVE, isActive());
        json.put(PKG_NARRATIVE, getNarrative());
        json.put(PKG_HASEVENT, hasEvent());
        json.put(PKG_HASPROJECT, hasProject());
        json.put(PKG_QCSTATE, getQcState());
        json.put(PKG_TOPLEVEL_SUPERPKG, getTopLevelSuperPkgId());
        json.put(PKG_CONTAINER, c.getId());
        json.put(PKG_MODIFIED, getModified());

        JSONArray categories = new JSONArray();

        for (Integer categoryId : getCategories().keySet())
        {
            categories.put(categoryId);
        }
        json.put(PKG_CATEGORIES, categories);


        if (getAttributes() != null)
        {
            json.put(PKG_ATTRIBUTES, attributesToJson(c, u));
        }

        JSONArray subPackages = new JSONArray();
        if(getSubpackages() != null)
        {
            for (SuperPackage subPackage : getSubpackages())
            {
                subPackages.put(subPackage.toJSON(c, u));
            }
            json.put(PKG_SUBPACKAGES, subPackages);
        }

        JSONArray extras = new JSONArray();
        Map<GWTPropertyDescriptor, Object> extraFields = getExtraFields();
        if(extraFields != null)
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

        JSONArray lookups = new JSONArray();
        Map<String, String> lookupMap = getLookups();

        JSONObject jsonLookup;
        for (String key : lookupMap.keySet())
        {
            jsonLookup = new JSONObject();
            jsonLookup.put("value", key);
            jsonLookup.put("label", lookupMap.get(key));
            lookups.put(jsonLookup);
        }

        json.put("attributeLookups", lookups);

        return json;
    }
}
