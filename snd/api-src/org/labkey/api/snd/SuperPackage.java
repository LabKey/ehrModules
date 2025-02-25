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
import org.labkey.api.security.User;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

import static org.labkey.api.snd.Package.PKG_ATTRIBUTES;

/**
 * Created by marty on 8/14/2017.
 *
 * Class for holding super package data and methods. Used when saving, updating, getting and deleting super packages
 */
public class SuperPackage
{
    private Integer _superPkgId;
    private List<SuperPackage> _childPackages;
    private Integer _pkgId;
    private Package _pkg;
    private String _superPkgPath;
    private String _treePath;
    private Integer _parentSuperPkgId;
    private Integer _topLevelPkgId;
    private String _description; // From referenced package
    private String _narrative; // From referenced package
    private Integer _sortOrder;
    private Boolean _repeatable;
    private boolean _required;
    // NOTE: if you add a variable here, add it to the copy constructor, getSuperPackageRow(), and toJson() too!

    public static final String SUPERPKG_ID = "superPkgId";
    public static final String SUPERPKG_PARENTID = "parentSuperPkgId";
    public static final String SUPERPKG_TOP_LEVEL_PKGID = "topLevelPkgId";
    public static final String SUPERPKG_PKGID = "pkgId";
    public static final String SUPERPKG_DESCRIPTION = "description";
    public static final String SUPERPKG_NARRATIVE = "narrative";
    public static final String SUPERPKG_ORDER = "sortOrder";
    public static final String SUPERPKG_REPEATABLE = "repeatable";
    public static final String SUPERPKG_PATH = "superPkgPath";
    public static final String SUPERPKG_TREEPATH = "treePath";
    public static final String SUPERPKG_REQUIRED = "required";
    public static final String SUPERPKG_PKGID_CSS_CLASS = "snd-superpkg-pkg-id";

    public SuperPackage()
    {

    }

    // copy constructor
    public SuperPackage(SuperPackage _superPackage)
    {
        _superPkgId = _superPackage.getSuperPkgId();  // Integers are immutable
        _childPackages = new ArrayList<>();
        List<SuperPackage> childPackages = _superPackage.getChildPackages();
        if (childPackages != null)
        {
            for (SuperPackage childPackage : _superPackage.getChildPackages())
                _childPackages.add(new SuperPackage(childPackage));
        }
        _pkgId = _superPackage.getPkgId();
        _superPkgId = _superPackage.getSuperPkgId();  // Strings are also immutable
        _parentSuperPkgId = _superPackage.getParentSuperPkgId();
        _description = _superPackage.getDescription();
        _narrative = _superPackage.getNarrative();
        _sortOrder = _superPackage.getSortOrder();
        _repeatable = _superPackage.getRepeatable();
        _required = _superPackage.getRequired();
    }

    @Nullable
    public Integer getParentSuperPkgId()
    {
        return _parentSuperPkgId;
    }

    public void setParentSuperPkgId(Integer parentSuperPkgId)
    {
        _parentSuperPkgId = parentSuperPkgId;
    }

    @Nullable
    public Integer getTopLevelPkgId() { return _topLevelPkgId; }

    public void setTopLevelPkgId(Integer topLevelPkgId) { _topLevelPkgId = topLevelPkgId; }

    @Nullable
    public List<SuperPackage> getChildPackages()
    {
        return _childPackages;
    }

    @Nullable
    public Integer getSortOrder()
    {
        return _sortOrder;
    }

    public void setSortOrder(Integer sortOrder)
    {
        _sortOrder = sortOrder;
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
    public Boolean getRepeatable() { return _repeatable; }

    public void setRepeatable(Boolean repeatable) { _repeatable = repeatable; }

    @Nullable
    public String getNarrative()
    {
        return _narrative;
    }

    public void setNarrative(String narrative)
    {
        _narrative = narrative;
    }

    public void setChildPackages(List<SuperPackage> childPackages)
    {
        _childPackages = childPackages;
    }

    @Nullable
    public String getSuperPkgPath()
    {
        return _superPkgPath;
    }

    public void setSuperPkgPath(String superPkgPath)
    {
        _superPkgPath = superPkgPath;
    }

    @Nullable
    public String getTreePath() { return _treePath; }

    public void setTreePath(String treePath) { _treePath = treePath; }

    @Nullable
    public Integer getSuperPkgId()
    {
        return _superPkgId;
    }

    public void setSuperPkgId(Integer superPkgId)
    {
        _superPkgId = superPkgId;
    }

    @Nullable
    public Integer getPkgId()
    {
        return _pkgId;
    }

    public void setPkgId(Integer pkgId)
    {
        _pkgId = pkgId;
    }

    @Nullable
    public Package getPkg()
    {
        return _pkg;
    }

    public void setPkg(Package pkg)
    {
        _pkg = pkg;
    }

    public boolean getRequired()
    {
        return _required;
    }

    public void setRequired(boolean required)
    {
        _required = required;
    }

    @NotNull
    public Map<String, Object> getSuperPackageRow(Container c)
    {
        Map<String, Object> superPkgValues = new ArrayListMap<>();
        superPkgValues.put(SUPERPKG_ID, getSuperPkgId());
        superPkgValues.put(SUPERPKG_PARENTID, getParentSuperPkgId());
        superPkgValues.put(SUPERPKG_PKGID, getPkgId());
        superPkgValues.put(SUPERPKG_ORDER, getSortOrder());
        superPkgValues.put(SUPERPKG_REPEATABLE, getRepeatable());
        superPkgValues.put("container", c);
        superPkgValues.put(SUPERPKG_PATH, getSuperPkgPath());
        superPkgValues.put(SUPERPKG_REQUIRED, getRequired());
        superPkgValues.put(SUPERPKG_TREEPATH, getTreePath());
        superPkgValues.put(SUPERPKG_TOP_LEVEL_PKGID, getTopLevelPkgId());

        return superPkgValues;
    }

    @NotNull
    public JSONObject toJSON(Container c, User u)
    {
        JSONObject json = new JSONObject();
        json.put(SUPERPKG_ID, getSuperPkgId());
        json.put(SUPERPKG_PKGID, getPkgId());
        json.put(SUPERPKG_DESCRIPTION, getDescription());
        json.put(SUPERPKG_NARRATIVE, getNarrative());
        json.put(SUPERPKG_ORDER, getSortOrder());
        json.put(SUPERPKG_REPEATABLE, getRepeatable());
        json.put(SUPERPKG_REQUIRED, getRequired());
        if (getPkg() != null)
        {
            json.put(PKG_ATTRIBUTES, getPkg().attributesToJson(c, u));
        }

        JSONArray subPackages = new JSONArray();
        if (getChildPackages() != null)
        {
            for (SuperPackage subPackage : getChildPackages())
            {
                subPackages.put(subPackage.toJSON(c, u));
            }
        }

        json.put("subPackages", subPackages);
        return json;
    }
}
