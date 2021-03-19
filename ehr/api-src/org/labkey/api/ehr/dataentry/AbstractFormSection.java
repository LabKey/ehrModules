/*
 * Copyright (c) 2016-2019 LabKey Corporation
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
package org.labkey.api.ehr.dataentry;

import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.LogManager;
import org.jetbrains.annotations.NotNull;
import org.json.JSONObject;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr.security.AbstractEHRPermission;
import org.labkey.api.ehr.security.EHRDataEntryPermission;
import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.api.security.permissions.InsertPermission;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.study.Dataset;
import org.labkey.api.util.Pair;
import org.labkey.api.view.template.ClientDependency;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Supplier;

/**
 * De-facto base class for implementations of @{link {@link FormSection}}
 * User: bimber
 * Date: 4/27/13
 */
abstract public class AbstractFormSection implements FormSection
{
    private String _name;
    private String _label;
    private String _xtype;
    private boolean _hidden = false;
    private String _clientModelClass = "EHR.model.DefaultClientModel";
    private String _clientStoreClass = "EHR.data.DataEntryClientStore";
    private EHRService.FORM_SECTION_LOCATION _location;
    private String _tabName = null;
    private TEMPLATE_MODE _templateMode = TEMPLATE_MODE.MULTI;
    private boolean _allowBulkAdd = true;
    private boolean _supportFormSort = true;
    private Map<String, String> _extraProperties = new HashMap<>();

    /**
    * Use this string as a key to addExtraProperty in FormSection backed by non datasets not having animal id column.
    * This will by pass the getId in Panel.js(line 58) to update the animal details section.
    * */
    protected static final String BY_PASS_ANIMAL_ID = "BY_PASS_ANIMAL_ID";

    private List<String> _configSources = new ArrayList<>();

    private List<Supplier<ClientDependency>> _clientDependencies = new ArrayList<>();

    protected static final Logger _log = LogManager.getLogger(AbstractFormSection.class);

    public AbstractFormSection(String name, String label, String xtype)
    {
        this(name, label, xtype, EHRService.FORM_SECTION_LOCATION.Body);
    }

    public AbstractFormSection(String name, String label, String xtype, EHRService.FORM_SECTION_LOCATION location)
    {
        _name = name;
        _label = label;
        _xtype = xtype;
        _location = location;

        addClientDependency(ClientDependency.supplierFromPath("ehr/window/CopyFromSectionWindow.js"));
    }

    @Override
    public String getName()
    {
        return _name;
    }

    protected void setName(String name)
    {
        _name = name;
    }

    protected void setLabel(String label)
    {
        _label = label;
    }

    public void setSupportFormSort(boolean supportFormSort)
    {
        _supportFormSort = supportFormSort;
    }

    @Override
    public String getLabel()
    {
        return _label;
    }

    @Override
    public String getXtype()
    {
        return _xtype;
    }

    public void setXtype(String xtype)
    {
        _xtype = xtype;
    }

    public void setHidden(boolean hidden)
    {
        _hidden = hidden;
    }

    protected void setTabName(String tabName)
    {
        _tabName = tabName;
    }

    public EHRService.FORM_SECTION_LOCATION getLocation()
    {
        return _location;
    }

    public void setLocation(EHRService.FORM_SECTION_LOCATION location)
    {
        _location = location;
    }

    @Override
    public String getClientModelClass()
    {
        return _clientModelClass;
    }

    public String getClientStoreClass()
    {
        return _clientStoreClass;
    }

    protected void setClientModelClass(String clientModelClass)
    {
        _clientModelClass = clientModelClass;
    }

    public void setClientStoreClass(String clientStoreClass)
    {
        _clientStoreClass = clientStoreClass;
    }

    public List<String> getConfigSources()
    {
        return _configSources;
    }

    @Override
    public void setConfigSources(List<String> configSources)
    {
        _configSources = new ArrayList<>(configSources);
    }

    @Override
    public void addConfigSource(String source)
    {
        _configSources.add(source);
    }

    @Override
    public void setTemplateMode(TEMPLATE_MODE mode)
    {
        _templateMode = mode;
    }

    /** Different modes of template behavior, based on which fields it should operate on and other factors */
    public enum TEMPLATE_MODE
    {
        MULTI("TEMPLATE", "APPLYFORMTEMPLATE"),
        NO_ID("TEMPLATE_NO_ID", "APPLYFORMTEMPLATE_NO_ID"),
        ENCOUNTER("TEMPLATE_ENCOUNTER", "APPLYFORMTEMPLATE_ENCOUNTER"),
        NONE(null, null);

        private String _formBtn;
        private String _sectionBtn;

        TEMPLATE_MODE(String sectionBtn, String formBtn)
        {
            _sectionBtn = sectionBtn;
            _formBtn = formBtn;
        }

        public String getFormBtn()
        {
            return _formBtn;
        }

        public String getSectionBtn()
        {
            return _sectionBtn;
        }
    }

    @Override
    public boolean hasPermission(DataEntryFormContext ctx, Class<? extends Permission> perm)
    {
        Map<String, Dataset> datasetMap = ctx.getDatasetMap();
        for (Pair<String, String> pair : getTableNames())
        {
            //datasets can be tested directly
            if ("study".equalsIgnoreCase(pair.first) && datasetMap.containsKey(pair.second))
            {
                Dataset ds = datasetMap.get(pair.second);
                if (!ds.getPermissions(ctx.getUser()).contains(perm))
                    return false;
            }
            else
            {
                // non-datasets are a little awkward.  unlike datasets we cannot assign permissions directly,
                // so this is a best guess.  if this is an EHR-specific permission, like EHRInProgressInsertPermission, we default back to
                // checking EHRDataEntryPermission at the container level.  otherwise we construct the table info and test it directly
                // the latter is expensive and unfortunate, but it does allow CustomPermissionTable to function properly.
                if (AbstractEHRPermission.class.isAssignableFrom(perm))
                {
                    if (!ctx.getContainer().hasPermission(ctx.getUser(), EHRDataEntryPermission.class))
                        return false;

                    //finally check InsertPermission, which will be required for CustomPermissionTable
                    TableInfo ti = ctx.getTable(pair.first, pair.second);
                    return ti != null && ti.hasPermission(ctx.getUser(), InsertPermission.class);
                }
            }
        }

        return true;
    }

    @Override
    public Set<Pair<String, String>> getTableNames()
    {
        return new HashSet<>();
    }

    @Override
    public Set<TableInfo> getTables(DataEntryFormContext ctx)
    {
        Set<TableInfo> tables = new HashSet<>();
        Set<Pair<String, String>> pairs = getTableNames();

        for (Pair<String, String> pair : pairs)
        {
            TableInfo ti = ctx.getTable(pair.first, pair.second);
            if (ti == null)
            {
                _log.error("Unable to create table: " + pair.first + "." + pair.second);
                continue;
            }

            tables.add(ti);
        }

        return tables;
    }

    /** Subclasses can override this method for finer control of who can save templates - defaults to only allowing admins */
    protected boolean canSaveTemplates(@NotNull DataEntryFormContext ctx)
    {
        return ctx.getContainer().hasPermission(ctx.getUser(), AdminPermission.class);
    }

    @Override
    public JSONObject toJSON(DataEntryFormContext ctx, boolean includeFormElements)
    {
        JSONObject json = new JSONObject();

        json.put("name", getName());
        json.put("label", getLabel());
        json.put("xtype", getXtype());
        json.put("hidden", _hidden);
        json.put("clientModelClass", getClientModelClass());
        json.put("clientStoreClass", getClientStoreClass());
        json.put("location", getLocation().name());

        if (includeFormElements)
            json.put("fieldConfigs", getFieldConfigs(ctx));

        json.put("supportsTemplates", _templateMode != TEMPLATE_MODE.NONE);
        json.put("canSaveTemplates", canSaveTemplates(ctx));
        json.put("configSources", getConfigSources());
        json.put("tbarButtons", getTbarButtons());
        json.put("tbarMoreActionButtons", getTbarMoreActionButtons());
        json.put("serverStoreSort", getServerSort());
        json.put("extraProperties", _extraProperties);

        if (_tabName != null)
            json.put("tabName", _tabName);

        return json;
    }

    protected String getServerSort()
    {
        return _supportFormSort ? "formSort" : null;
    }

    public void setAllowBulkAdd(boolean allowBulkAdd)
    {
        _allowBulkAdd = allowBulkAdd;
    }

    /**
     * @return the buttons that should be shown on the button bar for this form section. These are implemented in
     * JavaScript code that must register the button via a call to EHR.DataEntryUtils.registerGridButton().
     * The JS code must be included in the set of ClientDependencies for the form.
     */
    public List<String> getTbarButtons()
    {
        List<String> defaultButtons = new ArrayList<>();
        defaultButtons.add("ADDRECORD");

        if (_allowBulkAdd)
            defaultButtons.add("ADDANIMALS");

        defaultButtons.add("DELETERECORD");
        defaultButtons.add("SELECTALL");

        //omit the template btn from any formtype with specialized parent->child inheritance
        List<String> sources = getConfigSources();
        if (!sources.contains("Encounter") && !sources.contains("Labwork"))
        {
            defaultButtons.add("COPYFROMSECTION");
        }

        if (_templateMode.getSectionBtn() != null)
            defaultButtons.add(_templateMode.getSectionBtn());

        return defaultButtons;
    }

    /**
     * @return the actions to be shown under the More Actions popup menu button.
     * Must be registered on the client side with EHR.DataEntryUtils.registerGridButton()
     */
    public List<String> getTbarMoreActionButtons()
    {
        List<String> defaultButtons = new ArrayList<>();

        //omit the template btn from any formtype with specialized parent->child inheritance
        List<String> sources = getConfigSources();
        if (!sources.contains("Encounter"))
        {
            defaultButtons.add("DUPLICATE");
        }

        defaultButtons.add("BULKEDIT");
        defaultButtons.add("GUESSPROJECT");
        defaultButtons.add("REFRESH");
        defaultButtons.add("COPY_IDS");

        return defaultButtons;
    }

    /** @return metadata for each of the fields to be included in the generated UI */
    abstract protected List<FormElement> getFormElements(DataEntryFormContext ctx);

    private List<JSONObject> getFieldConfigs(DataEntryFormContext ctx)
    {
        List<JSONObject> ret = new ArrayList<>();
        for (FormElement fe : getFormElements(ctx))
        {
            ret.add(fe.toJSON(ctx.getContainer(), ctx.getUser()));
        }

        return ret;
    }

    @Override
    public List<Supplier<ClientDependency>> getClientDependencies()
    {
        return _clientDependencies;
    }

    @Override
    public void addClientDependency(Supplier<ClientDependency> cd)
    {
        _clientDependencies.add(cd);
    }

    /** Extra name/value pairs that are sent via JSON to JS UI for extra configuration info that doesn't fit anywhere else */
    public void addExtraProperty(String key, String value)
    {
        _extraProperties.put(key, value);
    }
}
