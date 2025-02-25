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
import org.json.JSONObject;
import org.labkey.api.collections.ArrayListMap;
import org.labkey.api.data.Container;
import org.labkey.api.security.User;

import java.util.Map;
import java.util.Objects;

/**
 * Created by marty on 8/4/2017.
 *
 * Class for project item data and related methods. Used in project class.
 */
public class ProjectItem
{
    boolean _active;
    int _projectItemId;
    int _superPkgId;
    String _parentObjectId;
    String _container;
    SuperPackage _superPackage;

    public static final String PROJECTITEM_ID = "projectItemId";
    public static final String PROJECTITEM_PARENTOBJECTID = "parentObjectId";
    public static final String PROJECTITEM_ACTIVE = "active";
    public static final String PROJECTITEM_CONTAINER = "container";
    public static final String PROJECTITEM_SUPERPKGID = "superPkgId";
    public static final String PROJECTITEM_SUPERPKG = "superPkg";

    public int getProjectItemId()
    {
        return _projectItemId;
    }

    public void setProjectItemId(int projectItemId)
    {
        _projectItemId = projectItemId;
    }

    public boolean isActive()
    {
        return _active;
    }

    public void setActive(boolean active)
    {
        _active = active;
    }

    public int getSuperPkgId()
    {
        return _superPkgId;
    }

    public void setSuperPkgId(int superPkgId)
    {
        _superPkgId = superPkgId;
    }

    @Nullable
    public String getParentObjectId()
    {
        return _parentObjectId;
    }

    public void setParentObjectId(String parentObjectId)
    {
        _parentObjectId = parentObjectId;
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

    @Nullable
    public SuperPackage getSuperPackage()
    {
        return _superPackage;
    }

    public void setSuperPackage(SuperPackage superPackage)
    {
        _superPackage = superPackage;
    }

    @NotNull
    public Map<String, Object> getRow(Container c)
    {
        Map<String, Object> projectItemValues = new ArrayListMap<>();
        projectItemValues.put(PROJECTITEM_ID, getProjectItemId());
        projectItemValues.put(PROJECTITEM_PARENTOBJECTID, getParentObjectId());
        projectItemValues.put(PROJECTITEM_SUPERPKGID, getSuperPkgId());
        projectItemValues.put(PROJECTITEM_ACTIVE, isActive());
        projectItemValues.put(PROJECTITEM_CONTAINER, c);

        return projectItemValues;
    }

    @NotNull
    public JSONObject toJSON(Container c, User u)
    {
        JSONObject json = new JSONObject();
        json.put(PROJECTITEM_ID, getProjectItemId());
        json.put(PROJECTITEM_ACTIVE, isActive());
        json.put(PROJECTITEM_SUPERPKG, getSuperPackage().toJSON(c, u));

        return json;
    }

    @Override
    public boolean equals(Object o)
    {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ProjectItem that = (ProjectItem) o;
        return _active == that._active &&
                _projectItemId == that._projectItemId &&
                _superPkgId == that._superPkgId &&
                Objects.equals(_parentObjectId, that._parentObjectId) &&
                Objects.equals(_container, that._container);
    }

    @Override
    public int hashCode()
    {
        return Objects.hash(_active, _projectItemId, _superPkgId, _parentObjectId, _container);
    }
}
