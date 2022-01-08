/*
 * Copyright (c) 2012-2019 LabKey Corporation
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
package org.labkey.ehr;

import org.apache.commons.collections4.MultiValuedMap;
import org.apache.commons.collections4.multimap.ArrayListValuedHashMap;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.json.JSONObject;
import org.labkey.api.action.NullSafeBindException;
import org.labkey.api.admin.ImportOptions;
import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.data.AbstractTableInfo;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.JdbcType;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.TableCustomizer;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ehr.EHRQCState;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr.dataentry.DataEntryForm;
import org.labkey.api.ehr.dataentry.DataEntryFormFactory;
import org.labkey.api.ehr.dataentry.SingleQueryFormProvider;
import org.labkey.api.ehr.demographics.DemographicsProvider;
import org.labkey.api.ehr.demographics.ProjectValidator;
import org.labkey.api.ehr.history.*;
import org.labkey.api.ehr.security.EHRDataEntryPermission;
import org.labkey.api.gwt.client.FacetingBehaviorType;
import org.labkey.api.ldk.LDKService;
import org.labkey.api.ldk.table.ButtonConfigFactory;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleHtmlView;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.module.ModuleProperty;
import org.labkey.api.pipeline.PipeRoot;
import org.labkey.api.pipeline.PipelineService;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DetailsURL;
import org.labkey.api.query.ExprColumn;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.resource.DirectoryResource;
import org.labkey.api.resource.Resource;
import org.labkey.api.security.SecurableResource;
import org.labkey.api.security.SecurityPolicy;
import org.labkey.api.security.SecurityPolicyManager;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.study.DatasetTable;
import org.labkey.api.study.StudyService;
import org.labkey.api.util.FileUtil;
import org.labkey.api.util.Pair;
import org.labkey.api.util.Path;
import org.labkey.api.util.URLHelper;
import org.labkey.api.view.ActionURL;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.ehr.dataentry.DataEntryManager;
import org.labkey.ehr.history.ClinicalHistoryManager;
import org.labkey.ehr.history.DefaultDeliveryDataSource;
import org.labkey.ehr.history.DefaultEncountersDataSource;
import org.labkey.ehr.history.DefaultObservationsDataSource;
import org.labkey.ehr.history.DefaultPregnanciesDataSource;
import org.labkey.ehr.history.LabworkManager;
import org.labkey.ehr.security.EHRSecurityManager;
import org.labkey.ehr.table.DefaultEHRCustomizer;
import org.labkey.ehr.table.SNOMEDCodesDisplayColumn;
import org.springframework.validation.BindException;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.lang.reflect.InvocationTargetException;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Supplier;

/**
 * User: bimber
 * Date: 9/14/12
 */
public class EHRServiceImpl extends EHRService
{
    private Set<Module> _registeredModules = new HashSet<>();
    private List<DemographicsProvider> _demographicsProviders = new ArrayList<>();
    private Map<REPORT_LINK_TYPE, List<ReportLink>> _reportLinks = new HashMap<>();
    private MultiValuedMap<String, Pair<Module, Path>> _actionOverrides = new ArrayListValuedHashMap<>();
    private List<Pair<Module, Resource>> _extraTriggerScripts = new ArrayList<>();
    private Map<Module, List<Supplier<ClientDependency>>> _clientDependencies = new HashMap<>();
    private Map<String, Map<String, List<Pair<Module, Class<? extends TableCustomizer>>>>> _tableCustomizers = new CaseInsensitiveHashMap<>();
    private Map<String, Map<String, List<ButtonConfigFactory>>> _moreActionsButtons = new CaseInsensitiveHashMap<>();
    private Map<String, Map<String, List<ButtonConfigFactory>>> _tbarButtons = new CaseInsensitiveHashMap<>();
    private Set<Module> _modulesRequiringLegacyExt3UI = new HashSet<>();
    private Set<Module> _modulesRequiringFormEditUI = new HashSet<>();
    private ProjectValidator _projectValidator = null;

    private static final Logger _log = LogManager.getLogger(EHRServiceImpl.class);

    public EHRServiceImpl()
    {

    }

    public static EHRServiceImpl get()
    {
        return (EHRServiceImpl)EHRService.get();
    }

    @Override
    public void registerModule(Module module)
    {
        _registeredModules.add(module);
    }

    @Override
    public Set<Module> getRegisteredModules()
    {
        return _registeredModules;
    }

    @Override
    public void registerTriggerScript(Module owner, Resource script)
    {
        _extraTriggerScripts.add(Pair.of(owner, script));
    }

    @Override
    public void registerLabworkType(LabworkType type)
    {
        LabworkManager.get().registerType(type);
    }

    @Override
    public List<Resource> getExtraTriggerScripts(Container c)
    {
        List<Resource> resources = new ArrayList<>();
        Set<Module> activeModules = c.getActiveModules();

        for (Pair<Module, Resource> pair : _extraTriggerScripts)
        {
            if (activeModules.contains(pair.first))
            {
                resources.add(pair.second);
            }
        }
        return Collections.unmodifiableList(resources);
    }

    @Override
    public void registerDemographicsProvider(DemographicsProvider provider)
    {
        _demographicsProviders.add(provider);
    }

    @Override
    public Collection<DemographicsProvider> getDemographicsProviders(Container c, User u)
    {
        Map<String, DemographicsProvider> providers = new HashMap<>();
        for (DemographicsProvider p : _demographicsProviders)
        {
            if (p.isAvailable(c,u))
                providers.put(p.getName(), p);
        }

        return Collections.unmodifiableCollection(providers.values());
    }

    @Override
    public void setProjectValidator(ProjectValidator projectValidator)
    {
        if (projectValidator != null)
            _projectValidator = projectValidator;
    }

    @Override
    public ProjectValidator getProjectValidator()
    {
        return _projectValidator;
    }

    @Override
    public void registerTableCustomizer(Module owner, Class<? extends TableCustomizer> customizerClass)
    {
        registerTableCustomizer(owner, customizerClass, LDKService.ALL_SCHEMAS, LDKService.ALL_TABLES);
    }

    @Override
    public void registerTableCustomizer(Module owner, Class<? extends TableCustomizer> customizerClass, String schema, String query)
    {
        Map<String, List<Pair<Module, Class<? extends TableCustomizer>>>> map = _tableCustomizers.get(schema);
        if (map == null)
            map = new CaseInsensitiveHashMap<>();

        List<Pair<Module, Class<? extends TableCustomizer>>> list = map.get(query);
        if (list == null)
            list = new ArrayList<>();

        list.add(Pair.of(owner, customizerClass));

        map.put(query, list);
        _tableCustomizers.put(schema, map);
    }

    @Override
    public List<TableCustomizer> getCustomizers(Container c, String schema, String query)
    {
        List<TableCustomizer> list = new ArrayList<>();
        Set<Module> modules = c.getActiveModules();

        if (_tableCustomizers.get(LDKService.ALL_SCHEMAS) != null)
        {
            for (Pair<Module, Class<? extends TableCustomizer>> pair : _tableCustomizers.get(LDKService.ALL_SCHEMAS).get(LDKService.ALL_TABLES))
            {
                if (modules.contains(pair.first))
                {
                    TableCustomizer tc = instantiateCustomizer(pair.second);
                    if (tc != null)
                        list.add(tc);
                }
            }
        }

        if (_tableCustomizers.containsKey(schema))
        {
            if (_tableCustomizers.get(schema).containsKey(LDKService.ALL_TABLES))
            {
                for (Pair<Module, Class<? extends TableCustomizer>> pair : _tableCustomizers.get(schema).get(LDKService.ALL_TABLES))
                {
                    if (modules.contains(pair.first))
                    {
                        TableCustomizer tc = instantiateCustomizer(pair.second);
                        if (tc != null)
                            list.add(tc);
                    }
                }
            }

            if (_tableCustomizers.get(schema).containsKey(query))
            {
                for (Pair<Module, Class<? extends TableCustomizer>> pair : _tableCustomizers.get(schema).get(query))
                {
                    if (modules.contains(pair.first))
                    {
                        TableCustomizer tc = instantiateCustomizer(pair.second);
                        if (tc != null)
                            list.add(tc);
                    }
                }
            }
        }

        return Collections.unmodifiableList(list);
    }

    private TableCustomizer instantiateCustomizer(Class<? extends TableCustomizer> customizerClass)
    {
        try
        {
            return customizerClass.getDeclaredConstructor().newInstance();
        }
        catch (InstantiationException | IllegalAccessException | NoSuchMethodException | InvocationTargetException e)
        {
            _log.error("Unable to create instance of class '" + customizerClass.getName() + "'", e);
        }

        return null;
    }

    @Override
    public void registerClientDependency(Supplier<ClientDependency> cd, Module owner)
    {
        List<Supplier<ClientDependency>> list = _clientDependencies.get(owner);
        if (list == null)
            list = new ArrayList<>();

        list.add(cd);

        _clientDependencies.put(owner, list);
    }

    @Override
    public List<Supplier<ClientDependency>> getRegisteredClientDependencies(Container c)
    {
        List<Supplier<ClientDependency>> list = new ArrayList<>();
        for (Module m : _clientDependencies.keySet())
        {
            if (c.getActiveModules().contains(m))
            {
                list.addAll(_clientDependencies.get(m));
            }
        }

        return Collections.unmodifiableList(list);
    }

    @Override
    public User getEHRUser(Container c)
    {
        return EHRManager.get().getEHRUser(c);
    }

    @Override
    public void registerReportLink(REPORT_LINK_TYPE type, String label, Module owner, DetailsURL url, @Nullable String category)
    {
        List<ReportLink> links = _reportLinks.get(type);

        if (links == null)
            links = new ArrayList<>();

        links.add(new ReportLink(label, owner, url, category));

        _reportLinks.put(type, links);
    }

    @Override
    public void registerReportLink(REPORT_LINK_TYPE type, String label, Module owner, URLHelper url, @Nullable String category)
    {
        List<ReportLink> links = _reportLinks.get(type);

        if (links == null)
            links = new ArrayList<>();

        links.add(new ReportLink(label, owner, url, category));

        _reportLinks.put(type, links);
    }

    public List<ReportLink> getReportLinks(Container c, User u, REPORT_LINK_TYPE type)
    {
        List<ReportLink> links = _reportLinks.get(type);
        if (links == null)
            return Collections.emptyList();

        List<ReportLink> ret = new ArrayList<>();
        for (ReportLink l : links)
        {
            if (l.isAvailable(c, u))
                ret.add(l);
        }

        return Collections.unmodifiableList(ret);
    }

    public static class ReportLink
    {
        private URLHelper _url = null;
        private DetailsURL _detailsURL = null;
        private String _label;
        private Module _owner;
        private String _category;

        public ReportLink(String label, Module owner, DetailsURL url, @Nullable String category)
        {
            _detailsURL = url;
            _label = label;
            _owner = owner;
            _category = category;
        }

        public ReportLink(String label, Module owner, URLHelper url, @Nullable String category)
        {
            _url = url;
            _label = label;
            _owner = owner;
            _category = category;
        }

        public boolean isAvailable(Container c, User u)
        {
            return c.getActiveModules().contains(_owner);
        }

        public DetailsURL getDetailsUrl()
        {
            return _detailsURL;
        }

        public URLHelper getUrl()
        {
            return _url;
        }

        public String getLabel()
        {
            return _label;
        }

        public String getCategory()
        {
            return _category;
        }

        public JSONObject toJSON(Container c)
        {
            Map<String, Object> item = new HashMap<>();

            if (getDetailsUrl() != null)
            {
                ActionURL url = getDetailsUrl().copy(c).getActionURL();
                item.put("controller", url.getController());
                item.put("action", url.getAction());
                item.put("params", url.getParameterMap());
            }

            if (getUrl() != null)
            {
                item.put("url", getUrl().toString());
            }

            item.put("label", getLabel());
            item.put("category", getCategory());

            return new JSONObject(item);
        }
    }

    @Override
    public void registerHistoryDataSource(HistoryDataSource source)
    {
        ClinicalHistoryManager.get().registerDataSource(source);
    }

    /**Adds a set of resources found to be common for ONPRC and WNPRC and not included by SNPRC.
     */
    @Override
    public void registerOptionalClinicalHistoryResources(Module module)
    {
        EHRService.get().registerHistoryDataSource(new DefaultObservationsDataSource(module));
        EHRService.get().registerHistoryDataSource(new DefaultPregnanciesDataSource(module));
        EHRService.get().registerHistoryDataSource(new DefaultDeliveryDataSource(module));
        EHRService.get().registerHistoryDataSource(new DefaultAnimalRecordFlagDataSource(module));
        EHRService.get().registerHistoryDataSource(new DefaultArrivalDataSource(module));
        EHRService.get().registerHistoryDataSource(new DefaultAssignmentEndDataSource(module));
        EHRService.get().registerHistoryDataSource(new DefaultBirthDataSource(module));
        EHRService.get().registerHistoryDataSource(new DefaultDeathsDataSource(module));
        EHRService.get().registerHistoryDataSource(new DefaultDepartureDataSource(module));
        EHRService.get().registerHistoryDataSource(new DefaultDrugsDataSource(module));
        EHRService.get().registerHistoryDataSource(new DefaultEncountersDataSource(module));
        EHRService.get().registerHistoryDataSource(new DefaultProblemListCloseDataSource(module));
        EHRService.get().registerHistoryDataSource(new DefaultProblemListDataSource(module));
        EHRService.get().registerHistoryDataSource(new DefaultTreatmentEndDataSource(module));

        //Labwork
        EHRService.get().registerLabworkType(new AntibioticSensitivityLabworkType(module));
        EHRService.get().registerLabworkType(new ChemistryLabworkType(module));
        EHRService.get().registerLabworkType(new HematologyLabworkType(module));
        EHRService.get().registerLabworkType(new MicrobiologyLabworkType(module));
        EHRService.get().registerLabworkType(new MiscTestsLabworkType(module));
        EHRService.get().registerLabworkType(new ParasitologyLabworkType(module));
        EHRService.get().registerLabworkType(new SerologyLabworkType(module));
    }

    @Override
    public void registerActionOverride(String actionName, Module owner, String resourcePath)
    {
        _actionOverrides.put(actionName, Pair.of(owner, Path.parse(resourcePath)));
    }

    public Pair<Module, Path> getActionOverride(String actionName, Container c)
    {
        if (!_actionOverrides.containsKey(actionName))
            return null;

        Set<Module> activeModules = c.getActiveModules();

        for (Pair<Module, Path> pair : _actionOverrides.get(actionName))
        {
            if (activeModules.contains(pair.first))
            {
                if (ModuleHtmlView.exists(pair.first, pair.second))
                    return pair;
                else
                    _log.error("Unable to find registered EHR action: " + pair.first.getName() + " / " + pair.second);
            }
        }

        return null;
    }

    @Override
    public Container getEHRStudyContainer(Container c)
    {
        Module ehr = ModuleLoader.getInstance().getModule(EHRModule.NAME);
        ModuleProperty mp = ehr.getModuleProperties().get(EHRManager.EHRStudyContainerPropName);
        String path = mp.getEffectiveValue(c);
        if (path == null)
            return null;

        return ContainerManager.getForPath(path);
    }

    @Override
    @NotNull
    public Map<String, EHRQCState> getQCStates(Container c)
    {
        return EHRSecurityManager.get().getQCStateInfo(c);
    }

    @Override
    public void registerFormType(DataEntryFormFactory fact)
    {
        DataEntryManager.get().registerFormType(fact);
    }

    @Override
    public DataEntryForm getDataEntryForm(String name, Container c, User u)
    {
        return DataEntryManager.get().getFormByName(name, c, u);
    }

    @Override
    public ActionURL getDataEntryFormActionURL(Container c)
    {
        return new ActionURL(EHRController.DataEntryFormAction.class, c);
    }

    @Override
    public void registerDefaultFieldKeys(String schemaName, String queryName, List<FieldKey> keys)
    {
        DataEntryManager.get().registerDefaultFieldKeys(schemaName, queryName, keys);
    }

    @Override
    public List<FieldKey> getDefaultFieldKeys(TableInfo ti)
    {
        return DataEntryManager.get().getDefaultFieldKeys(ti);
    }

    @Override
    public void registerTbarButton(ButtonConfigFactory btn, String schema, String query)
    {
        registerButton(btn, schema, query, _tbarButtons);
    }

    @Override
    public void registerMoreActionsButton(ButtonConfigFactory btn, String schema, String query)
    {
        registerButton(btn, schema, query, _moreActionsButtons);
    }

    private void registerButton(ButtonConfigFactory btn, String schema, String query, Map<String, Map<String, List<ButtonConfigFactory>>> map)
    {
        Map<String, List<ButtonConfigFactory>> schemaMap = map.get(schema);
        if (schemaMap == null)
            schemaMap = new CaseInsensitiveHashMap<>();

        List<ButtonConfigFactory> list = schemaMap.get(query);
        if (list == null)
            list = new ArrayList<>();

        list.add(btn);

        schemaMap.put(query, list);
        map.put(schema, schemaMap);
    }

    @Override
    @NotNull
    public List<ButtonConfigFactory> getMoreActionsButtons(TableInfo ti)
    {
        return getButtons(ti, _moreActionsButtons);
    }

    @Override
    @NotNull
    public List<ButtonConfigFactory> getTbarButtons(TableInfo ti)
    {
        return getButtons(ti, _tbarButtons);
    }

    @NotNull
    private List<ButtonConfigFactory> getButtons(TableInfo ti, Map<String, Map<String, List<ButtonConfigFactory>>> map)
    {
        List<ButtonConfigFactory> buttons = new ArrayList<>();

        if (map.containsKey(LDKService.ALL_SCHEMAS))
        {
            Map<String, List<ButtonConfigFactory>> factories = map.get(LDKService.ALL_SCHEMAS);
            buttons.addAll(getButtonsForTable(ti, factories, LDKService.ALL_TABLES));
            buttons.addAll(getButtonsForTable(ti, factories, ti.getPublicName()));
        }

        if (map.containsKey(ti.getPublicSchemaName()))
        {
            Map<String, List<ButtonConfigFactory>> factories = map.get(ti.getPublicSchemaName());
            buttons.addAll(getButtonsForTable(ti, factories, LDKService.ALL_TABLES));
            buttons.addAll(getButtonsForTable(ti, factories, ti.getPublicName()));
        }

        return Collections.unmodifiableList(buttons);
    }

    private List<ButtonConfigFactory> getButtonsForTable(TableInfo ti, Map<String, List<ButtonConfigFactory>> factories, String query)
    {
        if (factories.containsKey(query))
        {
            List<ButtonConfigFactory> ret = new ArrayList<>();
            for (ButtonConfigFactory btn : factories.get(query))
            {
                if (btn.isAvailable(ti))
                    ret.add(btn);
            }

            return ret;
        }

        return Collections.emptyList();
    }

    @Override
    public boolean hasDataEntryPermission (String schemaName, String queryName, Container c, User u)
    {
        return hasPermission(schemaName, queryName, c, u, EHRDataEntryPermission.class);
    }

    @Override
    public boolean hasDataEntryPermission (TableInfo ti)
    {
        return hasPermission(ti, EHRDataEntryPermission.class);
    }

    @Override
    public boolean hasPermission (String schemaName, String queryName, Container c, User u, Class<? extends Permission> perm)
    {
        Container ehrContainer = EHRService.get().getEHRStudyContainer(c);
        if (ehrContainer == null)
            return false;

        UserSchema studySchema = QueryService.get().getUserSchema(u, ehrContainer, schemaName);
        if (studySchema == null)
            return false;

        TableInfo ti = studySchema.getTable(queryName);
        if (ti == null)
            return false;

        return hasPermission(ti, perm);
    }

    @Override
    public boolean hasPermission (TableInfo ti, Class<? extends Permission> perm)
    {
        SecurableResource sr;
        if (ti instanceof DatasetTable)
        {
            sr =((DatasetTable) ti).getDataset();
        }
        else
        {
            sr = ti.getUserSchema().getContainer();
        }

        SecurityPolicy policy = SecurityPolicyManager.getPolicy(sr);
        return policy.hasPermission(ti.getUserSchema().getUser(), perm);
    }

    @Override
    public boolean hasPermission (String schemaName, String queryName, Container c, User u, Class<? extends Permission> perm, EHRQCState qcState)
    {
        SecurableResource sr = EHRSecurityManager.get().getSecurableResource(c, u, schemaName, queryName);
        if (sr == null)
        {
            _log.warn("Unable to find SecurableResource for table: " + schemaName + "." + queryName);
            return false;
        }

        return EHRSecurityManager.get().testPermission(u, sr, perm, qcState);
    }

    @Override
    public void addIsActiveCol(AbstractTableInfo ti, boolean includeExpired, EndingOption... endOptions)
    {
        if (ti.getColumn("date") == null || ti.getColumn("enddate") == null)
        {
            return;
        }

        String name = "isActive";
        if (ti.getColumn(name) == null)
        {
            SQLFragment sql = new SQLFragment("(CASE " +
                    // when the start is in the future, using whole-day increments, it is not active
                    " WHEN (CAST(" + ExprColumn.STR_TABLE_ALIAS + ".date as DATE) > {fn curdate()}) THEN " + ti.getSqlDialect().getBooleanFALSE() +
                    // when enddate is null, it is active
                    " WHEN (" + ExprColumn.STR_TABLE_ALIAS + ".enddate IS NULL) THEN " + ti.getSqlDialect().getBooleanTRUE());
            for (EHRService.EndingOption endOption : endOptions)
            {
                sql.append(endOption.getSql());
            }
            sql.append(
                    " WHEN (CAST(" + ExprColumn.STR_TABLE_ALIAS + ".enddate AS DATE) > {fn curdate()}) THEN " + ti.getSqlDialect().getBooleanTRUE() +
                            " ELSE " + ti.getSqlDialect().getBooleanFALSE() +
                            " END)");

            ExprColumn col = new ExprColumn(ti, name, sql, JdbcType.BOOLEAN, ti.getColumn("date"), ti.getColumn("enddate"));
            col.setLabel("Is Active?");
            ti.addColumn(col);
        }

        if (includeExpired)
        {
            String expired = "isExpired";
            if (ti.getColumn(expired) == null)
            {
                SQLFragment sql = new SQLFragment("(CASE " +
                        // any record with a null or future enddate (considering time) is active
                        " WHEN (" + ExprColumn.STR_TABLE_ALIAS + ".enddate IS NULL) THEN " + ti.getSqlDialect().getBooleanFALSE() +
                        " WHEN (" + ExprColumn.STR_TABLE_ALIAS + ".enddate < {fn now()}) THEN " + ti.getSqlDialect().getBooleanTRUE() +
                        " ELSE " + ti.getSqlDialect().getBooleanFALSE() +
                        " END)");

                ExprColumn col = new ExprColumn(ti, expired, sql, JdbcType.BOOLEAN, ti.getColumn("enddate"));
                col.setLabel("Is Expired?");
                ti.addColumn(col);
            }
        }
    }
    
    @Override
    public void customizeDateColumn(AbstractTableInfo ti, String colName)
    {
        ColumnInfo dateCol = ti.getColumn(colName);
        if (dateCol == null)
            return;

        String calendarYear = "calendarYear";
        if (ti.getColumn(calendarYear, false) == null)
        {
            String colSql = dateCol.getValueSql(ExprColumn.STR_TABLE_ALIAS).getSQL();
            SQLFragment sql = new SQLFragment(ti.getSqlDialect().getDatePart(Calendar.YEAR, colSql));
            ExprColumn calCol = new ExprColumn(ti, calendarYear, sql, JdbcType.INTEGER, dateCol);
            calCol.setLabel("Calendar Year");
            calCol.setFacetingBehaviorType(FacetingBehaviorType.ALWAYS_OFF);
            calCol.setHidden(true);
            ti.addColumn(calCol);

            String fiscalYear = "fiscalYear";
            SQLFragment sql2 = new SQLFragment("(" + ti.getSqlDialect().getDatePart(Calendar.YEAR, colSql) + " + CASE WHEN " + ti.getSqlDialect().getDatePart(Calendar.MONTH, colSql) + " < 5 THEN -1 ELSE 0 END)");
            ExprColumn fiscalYearCol = new ExprColumn(ti, fiscalYear, sql2, JdbcType.INTEGER, dateCol);
            fiscalYearCol.setLabel("Fiscal Year (May 1)");
            fiscalYearCol.setDescription("This column will calculate the fiscal year of the record, based on a May 1 cycle");
            fiscalYearCol.setFacetingBehaviorType(FacetingBehaviorType.ALWAYS_OFF);
            fiscalYearCol.setHidden(true);
            ti.addColumn(fiscalYearCol);

            String fiscalYearJuly = "fiscalYearJuly";
            SQLFragment sql3 = new SQLFragment("(" + ti.getSqlDialect().getDatePart(Calendar.YEAR, colSql) + " + CASE WHEN " + ti.getSqlDialect().getDatePart(Calendar.MONTH, colSql) + " < 7 THEN -1 ELSE 0 END)");
            ExprColumn fiscalYearJulyCol = new ExprColumn(ti, fiscalYearJuly, sql3, JdbcType.INTEGER, dateCol);
            fiscalYearJulyCol.setLabel("Fiscal Year (July 1)");
            fiscalYearJulyCol.setDescription("This column will calculate the fiscal year of the record, based on a July 1 cycle");
            fiscalYearJulyCol.setFacetingBehaviorType(FacetingBehaviorType.ALWAYS_OFF);
            fiscalYearJulyCol.setHidden(true);
            ti.addColumn(fiscalYearJulyCol);
        }

        addDatePartCol(ti, dateCol, "Year", "This column shows the year portion of the record's date", Calendar.YEAR);
        addDatePartCol(ti, dateCol, "Month Number", "This column shows the month number (based on the record's date)", Calendar.MONTH);
        addDatePartCol(ti, dateCol, "Day Of Month", "This column shows the day of month (based on the record's date)", Calendar.DATE);
    }

    private void addDatePartCol(AbstractTableInfo ti, ColumnInfo dateCol, String label, String description, Integer datePart)
    {
        String colName = dateCol.getName() + label.replaceAll(" ", "");
        if (ti.getColumn(colName, false) == null)
        {
            String colSql = dateCol.getValueSql(ExprColumn.STR_TABLE_ALIAS).getSQL();
            SQLFragment sql = new SQLFragment("(" + ti.getSqlDialect().getDatePart(datePart, colSql) + ")");
            ExprColumn newCol = new ExprColumn(ti, colName, sql, JdbcType.INTEGER, dateCol);
            newCol.setLabel(label);
            newCol.setDescription(description);
            newCol.setFacetingBehaviorType(FacetingBehaviorType.ALWAYS_OFF);
            newCol.setHidden(true);
            ti.addColumn(newCol);
        }
    }

    @Override
    public TableCustomizer getEHRCustomizer()
    {
        return new DefaultEHRCustomizer();
    }

    @Override
    public void registerSingleFormOverride(SingleQueryFormProvider p)
    {
        DataEntryManager.get().registerSingleFormOverride(p);
    }

    @Override
    public void appendCalculatedIdCols(AbstractTableInfo ti, String dateFieldName)
    {
        DefaultEHRCustomizer t = new DefaultEHRCustomizer();
        t.appendCalculatedCols(ti, dateFieldName);
    }

    @NotNull
    @Override
    public Collection<String> ensureFlagActive(User u, Container c, String flag, Date date, String remark, Collection<String> animalIds, boolean livingAnimalsOnly) throws BatchValidationException
    {
        return ensureFlagActive(u, c, flag, date, null, remark, animalIds, livingAnimalsOnly);
    }

    @Override
    @NotNull
    public Collection<String> ensureFlagActive(User u, Container c, String flag, Date date, Date enddate, String remark, Collection<String> animalIds, boolean livingAnimalsOnly) throws BatchValidationException
    {
        return EHRManager.get().ensureFlagActive(u, c, flag, date, enddate, remark, animalIds, livingAnimalsOnly);
    }

    @NotNull
    @Override
    public Collection<String> terminateFlagsIfExists(User u, Container c, String flag, Date enddate, Collection<String> animalIds)
    {
        return EHRManager.get().terminateFlagsIfExists(u, c, flag, enddate, animalIds);
    }

    @Override
    public String getEHRDefaultClinicalProjectName(Container c)
    {
        return EHRManager.get().getEHRDefaultClinicalProjectName(c);
    }

    @Override
    public void addModuleRequiringLegacyExt3EditUI(Module m)
    {
        _modulesRequiringLegacyExt3UI.add(m);
    }

    @Override
    public void addModulePreferringTaskFormEditUI(Module m)
    {
        _modulesRequiringFormEditUI.add(m);
    }

    @Override
    public void importStudyDefinition(Container container, User user, Module m, Path sourceStudyDirPath) throws IOException
    {
        Resource root = m.getModuleResource(sourceStudyDirPath);
        PipeRoot pipeRoot = PipelineService.get().findPipelineRoot(container);
        java.nio.file.Path pipeRootPath = pipeRoot.getRootNioPath();

        java.nio.file.Path studyXmlPath;

        if (root instanceof DirectoryResource && ((DirectoryResource)root).getDir().equals(pipeRootPath.toFile()))
        {
            // The pipeline root is already pointed at the study definition's folder, like it might be on a dev machine.
            // No need to copy, especially since copying can cause infinite recursion when the paths are nested
            studyXmlPath = pipeRootPath.resolve("study.xml");
        }
        else
        {
            java.nio.file.Path studyPath = pipeRootPath.resolve("moduleStudyImport");
            studyXmlPath = studyPath.resolve("study.xml");
            if (Files.exists(studyPath))
            {
                FileUtil.deleteDir(studyPath);
            }
            copyResourceToPath(root, studyPath);
        }

        if (!Files.exists(studyXmlPath))
        {
            throw new FileNotFoundException("Couldn't find an extracted " + studyXmlPath);
        }
        ImportOptions options = new ImportOptions(container.getId(), user.getUserId());
        options.setSkipQueryValidation(true);

        BindException errors = new NullSafeBindException(new Object(), "reload");
        StudyService.get().runStudyImportJob(container, user, null, studyXmlPath, "study.xml", errors, pipeRoot, options);
    }

    @Override
    public void importFolderDefinition(Container container, User user, Module m, Path sourceFolderDirPath) throws IOException
    {
        Resource root = m.getModuleResource(sourceFolderDirPath);
        PipeRoot pipeRoot = PipelineService.get().findPipelineRoot(container);
        java.nio.file.Path pipeRootPath = pipeRoot.getRootNioPath();

        java.nio.file.Path folderXmlPath;

        if (root instanceof DirectoryResource && ((DirectoryResource)root).getDir().equals(pipeRootPath.toFile()))
        {
            // The pipeline root is already pointed at the folder definition, like it might be on a dev machine.
            // No need to copy, especially since copying can cause infinite recursion when the paths are nested
            folderXmlPath = pipeRootPath.resolve("folder.xml");
        }
        else
        {
            java.nio.file.Path folderPath = pipeRootPath.resolve("moduleFolderImport");
            folderXmlPath = folderPath.resolve("folder.xml");
            if (Files.exists(folderPath))
            {
                FileUtil.deleteDir(folderPath);
            }
            copyResourceToPath(root, folderPath);
        }

        if (!Files.exists(folderXmlPath))
        {
            throw new FileNotFoundException("Couldn't find an extracted " + folderXmlPath);
        }
        ImportOptions options = new ImportOptions(container.getId(), user.getUserId());
        options.setSkipQueryValidation(true);

        BindException errors = new NullSafeBindException(new Object(), "reload");
        PipelineService.get().runFolderImportJob(container, user, null, folderXmlPath, "folder.xml", errors, pipeRoot, options);
    }

    private void copyResourceToPath(Resource resource, java.nio.file.Path target) throws IOException
    {
        if (resource.isCollection())
        {
            Files.createDirectory(target);
            for (Resource child : resource.list())
            {
                java.nio.file.Path childTarget = target.resolve(child.getName());
                copyResourceToPath(child, childTarget);
            }
        }
        else
        {
            try (InputStream in = resource.getInputStream();
                OutputStream out = Files.newOutputStream(target))
            {
                FileUtil.copyData(in, out);
            }
        }
    }

    public boolean isUseLegacyExt3EditUI(Container c)
    {
        return isRegisteredUI(_modulesRequiringLegacyExt3UI, c);
    }

    public boolean isUseFormEditUI(Container c)
    {
        return isRegisteredUI(_modulesRequiringFormEditUI, c);
    }

    private boolean isRegisteredUI(Set<Module> modules, Container c)
    {
        Set<Module> am = c.getActiveModules();
        for (Module m : modules)
        {
            if (am.contains(m))
            {
                return true;
            }
        }

        return false;
    }

    @Override
    public void appendSNOMEDCols(AbstractTableInfo ti, String displayColumnName, String title, @Nullable String codeFilter)
    {
        var existing = ti.getMutableColumn(displayColumnName);
        if (existing == null && ti.getColumn("objectid") != null && ti.getUserSchema() != null)
        {
            //display version of the column
            String chr = ti.getSqlDialect().isPostgreSQL() ? "chr" : "char";
            SQLFragment groupConcatSQL = ti.getSqlDialect().getGroupConcat(new SQLFragment(ti.getSqlDialect().concatenate("CAST(t.sort as varchar(10))", "': '", "s.meaning", "' ('", "t.code", "')'")), true, true, chr + "(10)");
            SQLFragment displaySQL = new SQLFragment("(SELECT ");
            displaySQL.append(groupConcatSQL);
            displaySQL.append(" FROM ehr.snomed_tags t JOIN ehr_lookups.snomed s ON (s.code = t.code AND s.container = t.container) ");
            displaySQL.append(" WHERE t.recordid = " + ExprColumn.STR_TABLE_ALIAS + ".objectid AND ");
            if (codeFilter != null)
            {
                displaySQL.append(" t.code LIKE '" + codeFilter + "%' AND " );
            }
            displaySQL.append(ExprColumn.STR_TABLE_ALIAS + ".participantid = t.id AND ");
            displaySQL.append("t.container = '" + ti.getUserSchema().getContainer().getId() + "' \n");
            displaySQL.append(" GROUP BY t.recordid)");

            ExprColumn displayCol = new ExprColumn(ti, displayColumnName, displaySQL, JdbcType.VARCHAR, ti.getColumn("objectid"));
            displayCol.setLabel(title);
            displayCol.setFacetingBehaviorType(FacetingBehaviorType.ALWAYS_OFF);
            displayCol.setDisplayColumnFactory(SNOMEDCodesDisplayColumn::new);
            displayCol.setDisplayWidth("250");
            ti.addColumn(displayCol);

            //programmatic version
            SQLFragment rawSQL = new SQLFragment("(SELECT " + ti.getSqlDialect().getGroupConcat(new SQLFragment(ti.getSqlDialect().concatenate("CAST(t.sort as varchar(10))", "'<>'", "t.code")), true, true, "';'").getSqlCharSequence());
            rawSQL.append("FROM ehr.snomed_tags t ");
            rawSQL.append(" WHERE t.recordid = " + ExprColumn.STR_TABLE_ALIAS + ".objectid AND ");
            rawSQL.append(ExprColumn.STR_TABLE_ALIAS + ".participantid = t.id AND ");
            if (codeFilter != null)
            {
                rawSQL.append(" t.code LIKE '" + codeFilter + "%' AND " );
            }
            rawSQL.append("t.container = '" + ti.getUserSchema().getContainer().getId() + "'\n");
            rawSQL.append("GROUP BY t.recordid)");

            ExprColumn rawCol = new ExprColumn(ti, displayColumnName + "Raw", rawSQL, JdbcType.VARCHAR, ti.getColumn("objectid"));
            rawCol.setLabel(title + " raw values");
            rawCol.setHidden(true);
            rawCol.setFacetingBehaviorType(FacetingBehaviorType.ALWAYS_OFF);
            rawCol.setDisplayWidth("250");
            ti.addColumn(rawCol);

            // Variant that's just the codes concatenated, without the sort index
            SQLFragment simpleRawSQL = new SQLFragment("(SELECT " + ti.getSqlDialect().getGroupConcat(new SQLFragment("t.code"), true, true, "';'").getSqlCharSequence());
            simpleRawSQL.append("FROM ehr.snomed_tags t ");
            simpleRawSQL.append(" WHERE t.recordid = " + ExprColumn.STR_TABLE_ALIAS + ".objectid AND ");
            simpleRawSQL.append(ExprColumn.STR_TABLE_ALIAS + ".participantid = t.id AND ");
            if (codeFilter != null)
            {
                simpleRawSQL.append(" t.code LIKE '" + codeFilter + "%' AND " );
            }
            simpleRawSQL.append("t.container = '" + ti.getUserSchema().getContainer().getId() + "'\n");
            simpleRawSQL.append("GROUP BY t.recordid)");

            ExprColumn simpleRawCol = new ExprColumn(ti, displayColumnName + "RawSimple", simpleRawSQL, JdbcType.VARCHAR, ti.getColumn("objectid"));
            simpleRawCol.setLabel(title + " simple raw values");
            simpleRawCol.setHidden(true);
            simpleRawCol.setFacetingBehaviorType(FacetingBehaviorType.ALWAYS_OFF);
            simpleRawCol.setDisplayWidth("250");
            ti.addColumn(simpleRawCol);
        }
    }
}
