/*
 * Copyright (c) 2012-2017 LabKey Corporation
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
package org.labkey.api.ehr;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.AbstractTableInfo;
import org.labkey.api.data.Container;
import org.labkey.api.data.TableCustomizer;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ehr.dataentry.DataEntryForm;
import org.labkey.api.ehr.dataentry.DataEntryFormFactory;
import org.labkey.api.ehr.dataentry.SingleQueryFormProvider;
import org.labkey.api.ehr.demographics.DemographicsProvider;
import org.labkey.api.ehr.history.HistoryDataSource;
import org.labkey.api.ehr.history.LabworkType;
import org.labkey.api.ldk.table.ButtonConfigFactory;
import org.labkey.api.module.Module;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DetailsURL;
import org.labkey.api.query.FieldKey;
import org.labkey.api.resource.Resource;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.util.URLHelper;
import org.labkey.api.view.ActionURL;
import org.labkey.api.view.template.ClientDependency;

import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Provides a variety of hooks for EHR customization in other modules, and services for external modules to use.
 * User: bimber
 * Date: 9/14/12
 */
abstract public class EHRService
{
    static EHRService instance;

    public static EHRService get()
    {
        return instance;
    }

    static public void setInstance(EHRService instance)
    {
        EHRService.instance = instance;
    }

    /** Registers a module as being an EHR customization, usually specific to an individual NPRC */
    abstract public void registerModule(Module module);

    /** @return the known other modules that provide customized versions of the EHR */
    abstract public Set<Module> getRegisteredModules();

    abstract public void registerLabworkType(LabworkType type);

    /**
     * Registers an additional JavaScript trigger script that runs whenever the core EHR's trigger script is initialized,
     * in containers in which the owning module is enabled.
     */
    abstract public void registerTriggerScript(Module owner, Resource script);

    abstract public List<Resource> getExtraTriggerScripts(Container c);

    /** Registers a demographics provider, used to cache commonly used info for animals, based on which modules are enabled in a container */
    abstract public void registerDemographicsProvider(DemographicsProvider provider);

    /** @return the providers enabled in the container */
    abstract public Collection<DemographicsProvider> getDemographicsProviders(Container c, User u);

    /**
     * Attaches additional TableCustomizer that runs as part of DefaultEHRCustomizer whenever the owning
     * module is enabled in a container
     */
    abstract public void registerTableCustomizer(Module owner, Class<? extends TableCustomizer> customizer);

    /**
     * Attaches additional TableCustomizer that runs as part of DefaultEHRCustomizer whenever the owning
     * module is enabled in a container
     */
    abstract public void registerTableCustomizer(Module owner, Class<? extends TableCustomizer> customizer, String schema, String query);

    abstract public List<TableCustomizer> getCustomizers(Container c, String schema, String query);

    /**
     * Allow modules to provide JS and other dependencies that will be loaded whenever
     * ehr.context is requested, assuming the supplying module is enabled in the current container
     */
    abstract public void registerClientDependency(ClientDependency cd, Module owner);

    abstract public Set<ClientDependency> getRegisteredClientDependencies(Container c);

    /**
     * @return the user configured via the EHR module property, to be used when running queries to populate the
     * demographics cache and similar utility operations
     */
    abstract public User getEHRUser(Container c);

    abstract public void registerReportLink(REPORT_LINK_TYPE type, String label, Module owner, DetailsURL url, @Nullable String category);

    abstract public void registerReportLink(REPORT_LINK_TYPE type, String label, Module owner, URLHelper url, @Nullable String category);

    /** Categories where pre-configured reports can be offered to the user */
    public enum REPORT_LINK_TYPE
    {
        housing(),
        project(),
        projectDetails(),
        protocol(),
        protocolDetails(),
        assignment(),
        moreReports(),
        datasets(),
        animalSearch();

        REPORT_LINK_TYPE()
        {

        }
    }

    /**
     * Allows center-specific modules to override a particular action provided by the core EHR.
     * If the module is enabled, its version of the action will be served up when the core EHR's action
     * is requested. Useful so that all links can target the general EHR action.
     */
    abstract public void registerActionOverride(String actionName, Module owner, String resourcePath);

    abstract public void registerHistoryDataSource(HistoryDataSource source);

    abstract public void registerOptionalClinicalHistoryResources(Module module);

    /**
     * @return the container holding the EHR study, as defined by the passed container's module properties
     */
    abstract public Container getEHRStudyContainer(Container c);

    @NotNull
    abstract public Map<String, EHRQCState> getQCStates(Container c);

    abstract public void registerFormType(DataEntryFormFactory fact);

    abstract public DataEntryForm getDataEntryForm(String name, Container c, User u);

    abstract public ActionURL getDataEntryFormActionURL(Container c);

    abstract public void registerDefaultFieldKeys(String schemaName, String queryName, List<FieldKey> keys);

    public enum FORM_SECTION_LOCATION
    {
        Header(),
        Body(),
        Tabs()
    }

    public enum QCSTATES
    {
        Abnormal("Abnormal"),
        DeleteRequested("Delete Requested"),
        RequestApproved("Request: Approved"),
        RequestSampleDelivered("Request: Sample Delivered"),
        RequestDenied("Request: Denied"),
        RequestCancelled("Request: Cancelled"),
        RequestPending("Request: Pending"),
        InProgress("In Progress"),
        ReviewRequired("Review Required"),
        Scheduled("Scheduled"),
        Completed("Completed");

        private String _label;

        QCSTATES(String label)
        {
            _label = label;
        }

        public String getLabel()
        {
            return _label;
        }

        /** @throws java.lang.IllegalArgumentException if the QC state doesn't exist in the container */
        @NotNull
        public EHRQCState getQCState(@NotNull Container c)
        {
            EHRQCState result = EHRService.get().getQCStates(c).get(_label);
            if (result == null)
            {
                throw new IllegalArgumentException("Could not find QC state " + _label + " in container " + c.getPath());
            }
            return result;
        }
    }

    abstract public List<FieldKey> getDefaultFieldKeys(TableInfo ti);

    /** Attaches top-level buttons in grid views for the specified query */
    abstract public void registerTbarButton(ButtonConfigFactory btn, String schema, String query);

    /** Attaches menu items to the More Actions button in grid views for the specified query */
    abstract public void registerMoreActionsButton(ButtonConfigFactory btn, String schema, String query);

    @NotNull
    abstract public List<ButtonConfigFactory> getMoreActionsButtons(TableInfo ti);

    @NotNull
    abstract public List<ButtonConfigFactory> getTbarButtons(TableInfo ti);

    abstract public boolean hasDataEntryPermission (String schemaName, String queryName, Container c, User u);

    abstract public boolean hasDataEntryPermission (TableInfo ti);

    abstract public boolean hasPermission (TableInfo ti, Class<? extends Permission> perm);

    abstract public boolean hasPermission (String schemaName, String queryName, Container c, User u, Class<? extends Permission> perm);

    abstract public boolean hasPermission (String schemaName, String queryName, Container c, User u, Class<? extends Permission> perm, EHRQCState qcState);

    abstract public void customizeDateColumn(AbstractTableInfo ti, String colName);

    /**
     * @return the customizer that merges the core EHR table customizer with any center-specific customizers that have also been registered via registerTableCustomizer()
     */
    abstract public TableCustomizer getEHRCustomizer();

    abstract public void registerSingleFormOverride(SingleQueryFormProvider p);

    abstract public void appendCalculatedIdCols(AbstractTableInfo ti, String dateFieldName);

    /** Makes sure that a flag, persisted in the study.flags dataset, is currently active for the animals */
    @NotNull
    abstract public Collection<String> ensureFlagActive(User u, Container c, String flag, Date date, String remark, Collection<String> animalIds, boolean livingAnimalsOnly) throws BatchValidationException;

    /** Makes sure that a flag, persisted in the study.flags dataset, is present for the date range specified for the animals */
    @NotNull
    abstract public Collection<String> ensureFlagActive(User u, Container c, String flag, Date date, Date enddate, String remark, Collection<String> animalIds, boolean livingAnimalsOnly) throws BatchValidationException;

    /** Closes out a previously created flag, from the study.flags dataset, if present, but without creating new flags */
    @NotNull
    abstract public Collection<String> terminateFlagsIfExists(User u, Container c, String flag, Date enddate, Collection<String> animalIds);

    abstract public String getEHRDefaultClinicalProjectName(Container c);

    /** Used to register EHR modules that use the ExtJS 3-based data entry UI */
    abstract public void addModuleRequiringLegacyExt3EditUI(Module m);
}
