/*
 * Copyright (c) 2009-2019 LabKey Corporation
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
 * 2021-01-25 update to resolve an auto update ticket 411
 */

package org.labkey.ehr;

import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.Logger;
import org.jetbrains.annotations.NotNull;
import org.json.JSONArray;
import org.json.JSONObject;
import org.labkey.api.action.ApiResponse;
import org.labkey.api.action.ApiSimpleResponse;
import org.labkey.api.action.ConfirmAction;
import org.labkey.api.action.MutatingApiAction;
import org.labkey.api.action.ReadOnlyApiAction;
import org.labkey.api.action.SimpleErrorView;
import org.labkey.api.action.SimpleViewAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.audit.TransactionAuditProvider;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.DataColumn;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.DisplayColumn;
import org.labkey.api.data.JsonWriter;
import org.labkey.api.data.RuntimeSQLException;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.dataiterator.DataIteratorContext;
import org.labkey.api.dataiterator.DetailedAuditLogDataIterator;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr.dataentry.DataEntryForm;
import org.labkey.api.ehr.demographics.AnimalRecord;
import org.labkey.api.ehr.history.HistoryRow;
import org.labkey.api.ehr.security.EHRDataEntryPermission;
import org.labkey.api.exp.api.ExperimentService;
import org.labkey.api.gwt.client.AuditBehaviorType;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.module.ModuleProperty;
import org.labkey.api.pipeline.PipelineStatusUrls;
import org.labkey.api.query.AbstractQueryImportAction;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DetailsURL;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryAction;
import org.labkey.api.query.QueryForm;
import org.labkey.api.query.QueryParseException;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.query.QueryView;
import org.labkey.api.query.QueryWebPart;
import org.labkey.api.query.UserSchema;
import org.labkey.api.query.ValidationError;
import org.labkey.api.query.ValidationException;
import org.labkey.api.reader.DataLoader;
import org.labkey.api.reader.Readers;
import org.labkey.api.reader.TabLoader;
import org.labkey.api.resource.FileResource;
import org.labkey.api.resource.Resource;
import org.labkey.api.security.RequiresPermission;
import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.api.security.permissions.DeletePermission;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.security.permissions.UpdatePermission;
import org.labkey.api.settings.AppProps;
import org.labkey.api.study.DatasetTable;
import org.labkey.api.util.ExceptionUtil;
import org.labkey.api.util.HtmlStringBuilder;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.util.Path;
import org.labkey.api.util.URLHelper;
import org.labkey.api.util.logging.LogHelper;
import org.labkey.api.view.ActionURL;
import org.labkey.api.view.HtmlView;
import org.labkey.api.view.JspView;
import org.labkey.api.view.NavTree;
import org.labkey.api.view.Portal;
import org.labkey.api.view.UnauthorizedException;
import org.labkey.api.view.WebPartFactory;
import org.labkey.api.view.WebPartView;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.ehr.dataentry.DataEntryManager;
import org.labkey.ehr.dataentry.RecordDeleteRunner;
import org.labkey.ehr.demographics.EHRDemographicsServiceImpl;
import org.labkey.ehr.history.ClinicalHistoryManager;
import org.labkey.ehr.history.LabworkManager;
import org.labkey.ehr.pipeline.GeneticCalculationsJob;
import org.labkey.ehr.pipeline.GeneticCalculationsRunnable;
import org.labkey.ehr.query.BloodPlotData;
import org.springframework.validation.BindException;
import org.springframework.validation.Errors;
import org.springframework.web.servlet.ModelAndView;

import java.io.BufferedReader;
import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.labkey.api.query.AbstractQueryUpdateService.createTransactionAuditEvent;

public class EHRController extends SpringActionController
{
    private static final DefaultActionResolver _actionResolver = new EHRActionResolver();

    public EHRController()
    {
        setActionResolver(_actionResolver);
    }

    private static final Logger _log = LogHelper.getLogger(EHRController.class, "EHR API controller.");

    public static class GetDataEntryItemsForm
    {
        private boolean _includeFormElements = false;

        public boolean isIncludeFormElements()
        {
            return _includeFormElements;
        }

        public void setIncludeFormElements(boolean includeFormElements)
        {
            _includeFormElements = includeFormElements;
        }
    }

    @RequiresPermission(ReadPermission.class)
    public class GetDataEntryItemsAction extends ReadOnlyApiAction<GetDataEntryItemsForm>
    {
        @Override
        public ApiResponse execute(GetDataEntryItemsForm form, BindException errors)
        {
            Map<String, Object> resultProperties = new HashMap<>();

            Collection<DataEntryForm> forms = DataEntryManager.get().getForms(getContainer(), getUser());
            List<JSONObject> formJson = new ArrayList<>();
            for (DataEntryForm def : forms)
            {
                formJson.add(def.toJSON(form.isIncludeFormElements()));
            }

            resultProperties.put("forms", formJson);
            resultProperties.put("success", true);

            return new ApiSimpleResponse(resultProperties);
        }
    }

    public static class CacheLivingAnimalsForm
    {
        private boolean _includeAll;

        public boolean isIncludeAll()
        {
            return _includeAll;
        }

        public void setIncludeAll(boolean includeAll)
        {
            _includeAll = includeAll;
        }
    }

    @RequiresPermission(AdminPermission.class)
    public class CacheLivingAnimalsAction extends ConfirmAction<CacheLivingAnimalsForm>
    {
        @Override
        public void validateCommand(CacheLivingAnimalsForm form, Errors errors)
        {

        }

        @Override
        public @NotNull URLHelper getSuccessURL(CacheLivingAnimalsForm form)
        {
            return getContainer().getStartURL(getUser());
        }

        @Override
        public ModelAndView getConfirmView(CacheLivingAnimalsForm form, BindException errors)
        {
            return new HtmlView("This action will force the EHR to cache demographics data on all " + (form.isIncludeAll() ? "" : "living") + " animals, and log errors if there is an existing record that does not match the current record.  This can save significant time during data entry or other screens.  Do you want to do this?<br><br>");
        }

        @Override
        public boolean handlePost(CacheLivingAnimalsForm form, BindException errors)
        {
            EHRDemographicsServiceImpl.get().cacheAnimals(getContainer(), getUser(), true, !form.isIncludeAll());
            return true;
        }
    }

    @RequiresPermission(AdminPermission.class)
    public class PrimeDataEntryCacheAction extends ConfirmAction<Object>
    {
        @Override
        public void validateCommand(Object form, Errors errors)
        {

        }

        @Override
        public @NotNull URLHelper getSuccessURL(Object form)
        {
            return getContainer().getStartURL(getUser());
        }

        @Override
        public ModelAndView getConfirmView(Object form, BindException errors)
        {
            return new HtmlView("This action will cause the EHR to populate several cached items used in data entry, such as reference tables.  Do you want to do this?<br><br>");
        }

        @Override
        public boolean handlePost(Object form, BindException errors)
        {
            DataEntryManager.get().primeCachesForContainer(getContainer(), getUser());
            return true;
        }
    }

    public static class DiscardFormForm
    {
        private String[] taskIds;
        private String[] requestIds;

        public String[] getTaskIds()
        {
            return taskIds;
        }

        public void setTaskIds(String[] taskIds)
        {
            this.taskIds = taskIds;
        }

        public String[] getRequestIds()
        {
            return requestIds;
        }

        public void setRequestIds(String[] requestIds)
        {
            this.requestIds = requestIds;
        }
    }

    @RequiresPermission(DeletePermission.class)
    public class DiscardFormAction extends MutatingApiAction<DiscardFormForm>
    {
        @Override
        public ApiResponse execute(DiscardFormForm form, BindException errors)
        {
            Map<String, Object> resultProperties = new HashMap<>();
            Map<String, List<String>> errorMsgMap = new HashMap<>();

            //first verify permission to delete
            if (form.getTaskIds() != null)
            {
                boolean canDiscard = true;
                for (String taskId : form.getTaskIds())
                {
                    List<String> msgs = new ArrayList<>();
                    if (!EHRManager.get().canDiscardTask(getContainer(), getUser(), taskId, msgs))
                    {
                        canDiscard = false;
                        errorMsgMap.put(taskId, msgs);
                    }
                }

                if (canDiscard)
                {
                    try (DbScope.Transaction transaction = ExperimentService.get().ensureTransaction())
                    {
                        for (String taskId : form.getTaskIds())
                        {
                            EHRManager.get().discardTask(getContainer(), getUser(), taskId);
                        }

                        transaction.commit();
                    }
                    catch (SQLException e)
                    {
                        throw new RuntimeSQLException(e);
                    }
                }
                else
                {
                    errors.reject(ERROR_MSG, "You do not have permission to delete one or more of these tasks");
                    return null;
                }
            }
            else
            {
                errors.reject(ERROR_MSG, "No tasks provided");
                return null;
            }

            resultProperties.put("success", true);

            return new ApiSimpleResponse(resultProperties);
        }
    }

    public static class EHRQueryForm extends QueryForm
    {
        private boolean _showImport = false;
        private boolean _queryUpdateURL = false;

        public boolean isShowImport()
        {
            return _showImport;
        }

        public void setShowImport(boolean showImport)
        {
            _showImport = showImport;
        }

        public boolean isQueryUpdateURL()
        {
            return _queryUpdateURL;
        }

        public void setQueryUpdateURL(boolean queryUpdateURL)
        {
            _queryUpdateURL = queryUpdateURL;
        }
    }

    @RequiresPermission(UpdatePermission.class)
    public class UpdateQueryAction extends SimpleViewAction<EHRQueryForm>
    {
        private EHRQueryForm _form;

        @Override
        public ModelAndView getView(EHRQueryForm form, BindException errors)
        {
            form.ensureQueryExists();

            _form = form;

            String schemaName = form.getSchemaName();

            QueryView queryView = QueryView.create(form, errors);
            TableInfo ti = queryView.getTable();
            List<String> pks = ti.getPkColumnNames();
            String keyField = null;

            String queryName = ti.getName();

            if (pks.size() == 1)
                keyField = pks.get(0);

            ActionURL url = getViewContext().getActionURL().clone();

            if (keyField != null)
            {
                String detailsStr;
                String importStr;
                if (EHRServiceImpl.get().isUseLegacyExt3EditUI(getContainer()) && !isExt4Form(form.getSchemaName(), form.getQueryName()) && !isReactForm(form.getSchemaName(), form.getQueryName()))
                {
                    // Because the Ext3-based UI can rely on loading JS-based metadata that is keyed
                    // off table name, and because when this was originally written LK preferentially used label over title for
                    // datasets, we need to continue to use dataset label here too.
                    String ext3QueryName = (ti instanceof DatasetTable) ? ti.getTitle() : ti.getName();

                    detailsStr = "/ehr/manageRecord.view?schemaName=" + schemaName + "&queryName=" + ext3QueryName;
                    importStr = "";
                    for (String pkCol : ti.getPkColumnNames())
                    {
                        detailsStr += "&keyField=" + pkCol + "&key=${" + pkCol + "}";
                        importStr += "&key=" + pkCol;
                    }

                    if (form.isShowImport())
                    {
                        DetailsURL importUrl = DetailsURL.fromString("/ehr/manageRecord.view?schemaName=" + schemaName + "&queryName=" + ext3QueryName + importStr);
                        importUrl.setContainerContext(getContainer());

                        url.addParameter("importURL", importUrl.toString());
                    }
                }
                else if (isReactForm(form.getSchemaName(), form.getQueryName()))
                {
                    detailsStr = getReactFormFrameworkURL(form.getSchemaName(), form.getQueryName()) + "?";

                    importStr = "";
                    for (String pkCol : ti.getPkColumnNames())
                    {
                        detailsStr += "&" + pkCol + "=${" + pkCol + "}";
                        importStr += "&" + pkCol + "=";
                    }
                    detailsStr += "&" + "formtype=" + queryName;

                    if (form.isShowImport())
                    {
                        DetailsURL importUrl = DetailsURL.fromString("/ehr/test.view?schemaName=" + schemaName + "&queryName=" + queryName + importStr);
                        importUrl.setContainerContext(getContainer());

                        url.addParameter("importURL", importUrl.toString());
                    }
                }
                else
                {
                    detailsStr = "/ehr/dataEntryFormForQuery.view?schemaName=" + schemaName + "&queryName=" + queryName;
                    importStr = "";
                    for (String pkCol : ti.getPkColumnNames())
                    {
                        detailsStr += "&" + pkCol + "=${" + pkCol + "}";
                        importStr += "&" + pkCol + "=";
                    }

                    if (form.isShowImport())
                    {
                        DetailsURL importUrl = DetailsURL.fromString("/ehr/dataEntryFormForQuery.view?schemaName=" + schemaName + "&queryName=" + queryName + importStr);
                        importUrl.setContainerContext(getContainer());

                        url.addParameter("importURL", importUrl.toString());
                    }
                }

                DetailsURL updateUrl;
                if (form.isQueryUpdateURL())
                {
                    // Send to the query controller's basic row-level update form
                    StringBuilder sb = new StringBuilder("query-updateQueryRow.view?schemaName=");
                    sb.append(ti.getUserSchema().getName());
                    sb.append("&queryName=");
                    sb.append(ti.getName());
                    for (String pk : pks)
                    {
                        sb.append("&");
                        sb.append(pk);
                        sb.append("=${");
                        sb.append(pk);
                        sb.append("}");
                    }
                    updateUrl = DetailsURL.fromString(sb.toString());
                }
                else if (EHRServiceImpl.get().isUseFormEditUI(getContainer()) && null != ti.getColumn("taskid"))
                {
                    updateUrl = DetailsURL.fromString("/ehr/dataEntryForm.view?taskid=${taskid}&formType=${taskid/formType}");
                }
                else
                {
                    updateUrl = DetailsURL.fromString(detailsStr);
                }
                updateUrl.setContainerContext(getContainer());

                String deleteQueryName = ti.getName();

                DetailsURL deleteUrl = DetailsURL.fromString("/query/deleteQueryRows.view?schemaName=" + schemaName + "&query.queryName=" + deleteQueryName);
                deleteUrl.setContainerContext(getContainer());

                url.addParameter("updateURL", updateUrl.toString());
                url.addParameter("deleteURL", deleteUrl.toString());
                url.addParameter("showInsertNewButton", false);
            }

            url.addParameter("queryName", queryName);
            url.addParameter("allowChooseQuery", false);
            url.addParameter("dataRegionName", "query");

            WebPartFactory factory = Portal.getPortalPartCaseInsensitive("Query");
            Portal.WebPart part = factory.createWebPart();
            part.setProperties(url.getQueryString());

            QueryWebPart qwp = new QueryWebPart(getViewContext(), part);
            qwp.setTitle(ti.getTitle());
            qwp.setFrame(WebPartView.FrameType.NONE);
            return qwp;
        }

        @Override
        public void addNavTrail(NavTree root)
        {
            TableInfo ti = null;
            try
            {
                ti = _form.getSchema() == null ? null : _form.getSchema().getTable(_form.getQueryName());
            }
            catch (QueryParseException x)
            {
                /* */
            }

            root.addChild(ti == null ? _form.getQueryName() : ti.getTitle(), _form.urlFor(QueryAction.executeQuery));
        }

        protected boolean isExt4Form(String schemaName, String queryName)
        {
            boolean isExt4Form = false;
            UserSchema us = QueryService.get().getUserSchema(getUser(), getContainer(), EHRSchema.EHR_SCHEMANAME);
            if (us == null) { return false; }

            TableInfo ti = us.getTable(EHRSchema.TABLE_FORM_FRAMEWORK_TYPES);
            if (ti == null) { return false; }

            TableSelector ts = new TableSelector(ti, Collections.singleton("framework"), new SimpleFilter(FieldKey.fromString("schemaname"), schemaName).addCondition(FieldKey.fromString("queryname"), queryName), null);
            String[] ret = ts.getArray(String.class);

            if (ret.length > 0 && "extjs4".equalsIgnoreCase(ret[0]))
            {
                isExt4Form = true;
            }

            return isExt4Form;
        }

        //Checks the TABLE_FORM_FRAMEWORK_TYPES table to see if there are any forms that should be rendered using react view
        protected boolean isReactForm(String schemaName, String queryName)
        {
            boolean isReactForm = false;
            UserSchema us = QueryService.get().getUserSchema(getUser(), getContainer(), EHRSchema.EHR_SCHEMANAME);
            if (us == null) { return false; }

            TableInfo ti = us.getTable(EHRSchema.TABLE_FORM_FRAMEWORK_TYPES);
            if (ti == null) { return false; }

            TableSelector ts = new TableSelector(ti, Collections.singleton("framework"), new SimpleFilter(FieldKey.fromString("schemaname"), schemaName).addCondition(FieldKey.fromString("queryname"), queryName), null);
            String[] ret = ts.getArray(String.class);

            if (ret.length > 0 && "reactjs".equalsIgnoreCase(ret[0]))
            {
                isReactForm = true;
            }

            return isReactForm;
        }

        protected String getReactFormFrameworkURL(String schemaName, String queryName)
        {
            String reactFormURL = null;
            UserSchema us = QueryService.get().getUserSchema(getUser(), getContainer(), EHRSchema.EHR_SCHEMANAME);
            if (us == null) { return null; }

            TableInfo ti = us.getTable(EHRSchema.TABLE_FORM_FRAMEWORK_TYPES);
            if (ti == null) { return null; }

            TableSelector ts = new TableSelector(ti, Collections.singleton("url"), new SimpleFilter(FieldKey.fromString("schemaname"), schemaName).addCondition(FieldKey.fromString("queryname"), queryName), null);
            Map<String, Object> mp = ts.getMap();
            return (String) mp.get("url");

        }
    }

    public static class GetDemographicsForm
    {
        private String[] _ids;

        public String[] getIds()
        {
            return _ids;
        }

        public void setIds(String[] ids)
        {
            _ids = ids;
        }
    }

    @RequiresPermission(ReadPermission.class)
    public class GetDemographicsAction extends ReadOnlyApiAction<GetDemographicsForm>
    {
        @Override
        public ApiResponse execute(GetDemographicsForm form, BindException errors)
        {
            Map<String, Object> props = new HashMap<>();

            if (form.getIds() == null || form.getIds().length == 0)
            {
                errors.reject(ERROR_MSG, "No Ids Provided");
                return null;
            }

            try
            {
                JSONObject json = new JSONObject();
                for (AnimalRecord r : EHRDemographicsServiceImpl.get().getAnimals(getContainer(), Arrays.asList(form.getIds())))
                {
                    json.put(r.getId(), r.getProps());
                }

                props.put("results", json);
            }
            catch (Exception e)
            {
                ExceptionUtil.logExceptionToMothership(getViewContext().getRequest(), e);
                throw e;
            }

            return new ApiSimpleResponse(props);
        }
    }

    @RequiresPermission(AdminPermission.class)
    public class SetGeneticCalculationTaskSettingsAction extends MutatingApiAction<ScheduleGeneticCalculationForm>
    {
        @Override
        public ApiResponse execute(ScheduleGeneticCalculationForm form, BindException errors)
        {
            Container c;
            if (form.getContainerPath() == null)
                c = getContainer();
            else
                c = ContainerManager.getForPath(form.getContainerPath());

            if (c == null)
            {
                errors.reject(ERROR_MSG, "Unable to find container for path: " + form.getContainerPath());
                return null;
            }
            GeneticCalculationsJob.setProperties(form.isEnabled(), c, form.getHourOfDay(), form.isKinshipValidation());

            return new ApiSimpleResponse("success", true);
        }
    }

    public static class RecordDeleteForm
    {
        private boolean _enabled;
        private int hourOfDay;

        public boolean isEnabled()
        {
            return _enabled;
        }

        public void setEnabled(boolean enabled)
        {
            _enabled = enabled;
        }

        public int getHourOfDay()
        {
            return hourOfDay;
        }

        public void setHourOfDay(int hourOfDay)
        {
            this.hourOfDay = hourOfDay;
        }
    }

    @RequiresPermission(AdminPermission.class)
    public class SetRecordDeleteSettingsAction extends MutatingApiAction<RecordDeleteForm>
    {
        @Override
        public ApiResponse execute(RecordDeleteForm form, BindException errors)
        {
            RecordDeleteRunner.setProperties(getContainer(), form.isEnabled());

            return new ApiSimpleResponse("success", true);
        }
    }

    public static class AnimalDetailsForm
    {
        private String[] _animalIds;
        private boolean _includeAssignment;
        private boolean _includeTreatments;
        private boolean _includeFlags;

        public String[] getAnimalIds()
        {
            return _animalIds;
        }

        public void setAnimalIds(String[] animalIds)
        {
            _animalIds = animalIds;
        }

        public boolean isIncludeAssignment()
        {
            return _includeAssignment;
        }

        public void setIncludeAssignment(boolean includeAssignment)
        {
            _includeAssignment = includeAssignment;
        }

        public boolean isIncludeTreatments()
        {
            return _includeTreatments;
        }

        public void setIncludeTreatments(boolean includeTreatments)
        {
            _includeTreatments = includeTreatments;
        }

        public boolean isIncludeFlags()
        {
            return _includeFlags;
        }

        public void setIncludeFlags(boolean includeFlags)
        {
            _includeFlags = includeFlags;
        }
    }

    @RequiresPermission(ReadPermission.class)
    public class GetAnimalDetailsAction extends ReadOnlyApiAction<AnimalDetailsForm>
    {
        @Override
        public ApiResponse execute(AnimalDetailsForm form, BindException errors)
        {
            Map<String, Object> props = new HashMap<String, Object>();
            Set<String> sources = new HashSet<String>();
            if (form.isIncludeAssignment())
                sources.add("assignment");
            if (form.isIncludeFlags())
                sources.add("flags");
            if (form.isIncludeTreatments())
                sources.add("treatments");

            EHRManager.get().getAnimalDetails(getUser(), getContainer(), form.getAnimalIds(), sources);

            return new ApiSimpleResponse(props);
        }
    }

    public static class ScheduleGeneticCalculationForm
    {
        private boolean _enabled;
        private String containerPath;
        private int hourOfDay;

        private boolean _kinshipValidation;

        public boolean isEnabled()
        {
            return _enabled;
        }

        public void setEnabled(boolean enabled)
        {
            _enabled = enabled;
        }

        public String getContainerPath()
        {
            return containerPath;
        }

        public void setContainerPath(String containerPath)
        {
            this.containerPath = containerPath;
        }

        public int getHourOfDay()
        {
            return hourOfDay;
        }

        public void setHourOfDay(int hourOfDay)
        {
            this.hourOfDay = hourOfDay;
        }

        public boolean isKinshipValidation()
        {
            return _kinshipValidation;
        }

        public void setKinshipValidation(boolean kinshipValidation)
        {
            _kinshipValidation = kinshipValidation;
        }
    }

    @RequiresPermission(AdminPermission.class)
    public class GetGeneticCalculationTaskSettingsAction extends ReadOnlyApiAction<ScheduleGeneticCalculationForm>
    {
        @Override
        public ApiResponse execute(ScheduleGeneticCalculationForm form, BindException errors)
        {
            Map<String, Object> ret = new HashMap<>();

            Container c = GeneticCalculationsJob.getContainer();
            if (c != null)
                ret.put("containerPath", c.getPath());

            ret.put("isScheduled", GeneticCalculationsJob.isScheduled());
            ret.put("enabled", GeneticCalculationsJob.isEnabled());
            ret.put("hourOfDay", GeneticCalculationsJob.getHourOfDay());
            ret.put("kinshipValidation", GeneticCalculationsJob.isKinshipValidation());

            return new ApiSimpleResponse(ret);
        }
    }

    @RequiresPermission(AdminPermission.class)
    public class GetRecordDeleteSettingsAction extends ReadOnlyApiAction<Object>
    {
        @Override
        public ApiResponse execute(Object form, BindException errors)
        {
            Map<String, Object> ret = new HashMap<>();

            ret.put("enabled", RecordDeleteRunner.isEnabled(getContainer()));

            return new ApiSimpleResponse(ret);
        }
    }

    public static class LabResultSummaryForm
    {
        String[] _runId;

        public String[] getRunId()
        {
            return _runId;
        }

        public void setRunId(String[] runId)
        {
            _runId = runId;
        }
    }

    @RequiresPermission(ReadPermission.class)
    public class GetLabResultSummary extends ReadOnlyApiAction<LabResultSummaryForm>
    {
        @Override
        public ApiResponse execute(LabResultSummaryForm form, BindException errors)
        {
            Map<String, Object> resultProperties = new HashMap<>();

            if (form.getRunId() == null || form.getRunId().length == 0)
            {
                errors.reject(ERROR_MSG, "No Run Ids Provided");
                return null;
            }

            Map<String, List<String>> results = LabworkManager.get().getResults(getContainer(), getUser(), Arrays.asList(form.getRunId()), false);
            resultProperties.put("results", results);
            resultProperties.put("success", true);

            return new ApiSimpleResponse(resultProperties);
        }
    }

    public static class HistoryForm
    {
        private String _parentId;
        private String _runId;
        private String _caseId;

        private String[] _subjectIds;
        private Date _minDate;
        private Date _maxDate;
        private boolean _redacted = false;
        private boolean _includeDistinctTypes = false;

        public String getParentId()
        {
            return _parentId;
        }

        public void setParentId(String parentId)
        {
            _parentId = parentId;
        }

        public String getRunId()
        {
            return _runId;
        }

        public void setRunId(String runId)
        {
            _runId = runId;
        }

        public String getCaseId()
        {
            return _caseId;
        }

        public void setCaseId(String caseId)
        {
            _caseId = caseId;
        }

        public String[] getSubjectIds()
        {
            return _subjectIds;
        }

        public void setSubjectIds(String[] subjectIds)
        {
            _subjectIds = subjectIds;
        }

        public Date getMinDate()
        {
            return _minDate;
        }

        public void setMinDate(Date minDate)
        {
            _minDate = minDate;
        }

        public Date getMaxDate()
        {
            return _maxDate;
        }

        public void setMaxDate(Date maxDate)
        {
            _maxDate = maxDate;
        }

        public boolean isRedacted()
        {
            return _redacted;
        }

        public void setRedacted(boolean redacted)
        {
            _redacted = redacted;
        }

        public boolean isIncludeDistinctTypes()
        {
            return _includeDistinctTypes;
        }

        public void setIncludeDistinctTypes(boolean includeDistinctTypes)
        {
            _includeDistinctTypes = includeDistinctTypes;
        }
    }

    @RequiresPermission(ReadPermission.class)
    //TODO: should enable @CSRF if we have SSRS updated to pass token.
    public class GetClinicalHistoryAction extends ReadOnlyApiAction<HistoryForm>
    {
        @Override
        public ApiResponse execute(HistoryForm form, BindException errors)
        {
            Map<String, Object> resultProperties = new HashMap<>();

            if (form.getSubjectIds() == null || form.getSubjectIds().length == 0)
            {
                errors.reject(ERROR_MSG, "Must provide at least one subject Id");
                return null;
            }

            try
            {
                JSONArray results = new JSONArray();
                for (String subjectId : form.getSubjectIds())
                {
                    List<HistoryRow> rows = ClinicalHistoryManager.get().getHistory(getContainer(), getUser(), subjectId, form.getMinDate(), form.getMaxDate(), form.isRedacted());
                    for (HistoryRow row : rows)
                    {
                        results.put(row.toJSON());
                    }
                }

                resultProperties.put("success", true);
                resultProperties.put("results", results);

                if (form.isIncludeDistinctTypes())
                    resultProperties.put("distinctTypes", ClinicalHistoryManager.get().getTypes(getContainer(), getUser()));

                return new ApiSimpleResponse(resultProperties);
            }
            catch (IllegalArgumentException e)
            {
                ExceptionUtil.logExceptionToMothership(getViewContext().getRequest(), e);

                errors.reject(ERROR_MSG, e.getMessage());
                return null;
            }
        }
    }

    @RequiresPermission(ReadPermission.class)
    public class GetCaseHistoryAction extends ReadOnlyApiAction<HistoryForm>
    {
        @Override
        public ApiResponse execute(HistoryForm form, BindException errors)
        {
            Map<String, Object> resultProperties = new HashMap<>();

            if (form.getCaseId() == null || form.getSubjectIds() == null || form.getSubjectIds().length != 1)
            {
                errors.reject(ERROR_MSG, "Must provide a caseId and one subjectId");
                return null;
            }

            try
            {
                String subjectId = form.getSubjectIds()[0];
                JSONArray results = new JSONArray();
                List<HistoryRow> rows = ClinicalHistoryManager.get().getHistory(getContainer(), getUser(), subjectId, form.getCaseId(), form.isRedacted());
                for (HistoryRow row : rows)
                {
                    results.put(row.toJSON());
                }

                resultProperties.put("success", true);
                resultProperties.put("results", results);
                return new ApiSimpleResponse(resultProperties);
            }
            catch (IllegalArgumentException e)
            {
                ExceptionUtil.logExceptionToMothership(getViewContext().getRequest(), e);

                errors.reject(ERROR_MSG, e.getMessage());
                return null;
            }
        }
    }

    public static class EnsureDatasetPropertiesForm
    {
        boolean commitChanges = false;
        boolean rebuildIndexes = false;

        public void setCommitChanges(boolean commitChanges)
        {
            this.commitChanges = commitChanges;
        }

        public boolean isCommitChanges()
        {
            return commitChanges;
        }

        public boolean isRebuildIndexes()
        {
            return rebuildIndexes;
        }

        public void setRebuildIndexes(boolean rebuildIndexes)
        {
            this.rebuildIndexes = rebuildIndexes;
        }
    }

    @RequiresPermission(AdminPermission.class)
    public class EnsureDatasetPropertiesAction extends ConfirmAction<EnsureDatasetPropertiesForm>
    {
        @Override
        public void validateCommand(EnsureDatasetPropertiesForm form, Errors errors)
        {

        }

        @Override
        public @NotNull URLHelper getSuccessURL(EnsureDatasetPropertiesForm form)
        {
            return getContainer().getStartURL(getUser());
        }

        @Override
        public ModelAndView getConfirmView(EnsureDatasetPropertiesForm form, BindException errors)
        {
            StringBuilder msg = new StringBuilder();
            msg.append("The EHR expects certain columns to be present on all datasets.  The following changes will be made:<br><br>");

            List<String> messages = EHRManager.get().ensureDatasetPropertyDescriptors(getContainer(), getUser(), false, form.isRebuildIndexes());
            for (String message : messages)
            {
                msg.append("\t").append(message).append("<br>");
            }

            if (messages.size() > 0)
                msg.append("<br>Do you want to make these changes?");
            else
                msg.append("There are no changes to be made");

            return new HtmlView(msg.toString());
        }

        @Override
        public boolean handlePost(EnsureDatasetPropertiesForm form, BindException errors)
        {
            List<String> messages = EHRManager.get().ensureDatasetPropertyDescriptors(getContainer(), getUser(), true, form.isRebuildIndexes());
            return true;
        }
    }

    @RequiresPermission(AdminPermission.class)
    public class EnsureEHRSchemaIndexesAction extends ConfirmAction<Object>
    {
        @Override
        public void validateCommand(Object form, Errors errors)
        {

        }

        @Override
        public @NotNull URLHelper getSuccessURL(Object form)
        {
            return getContainer().getStartURL(getUser());
        }

        @Override
        public ModelAndView getConfirmView(Object form, BindException errors)
        {
            if (!getUser().hasSiteAdminPermission())
            {
                throw new UnauthorizedException("Only site admins can view this page");
            }

            return new HtmlView("Several of the EHR schema tables can contain a large number of records.  Indexes are created by the SQL scripts; however, they are not automatically compressed.  This action will switch row compression on for these indexes.  It will only work for SQLServer.  Do you want to continue?");
        }

        @Override
        public boolean handlePost(Object form, BindException errors)
        {
            EHRManager.get().compressEHRSchemaIndexes();
            return true;
        }
    }

    @RequiresPermission(AdminPermission.class)
    public class EnsureQcStatesAction extends ConfirmAction<Object>
    {
        @Override
        public void validateCommand(Object form, Errors errors)
        {

        }

        @Override
        public @NotNull URLHelper getSuccessURL(Object form)
        {
            return getContainer().getStartURL(getUser());
        }

        @Override
        public ModelAndView getConfirmView(Object form, BindException errors)
        {
            StringBuilder msg = new StringBuilder();
            msg.append("The EHR expects certain QCStates to exist in the study.  The following QCStates will be added:<br><br>");

            List<String> messages = EHRManager.get().ensureStudyQCStates(getContainer(), getUser(), false);
            for (String message : messages)
            {
                msg.append("\t").append(message).append("<br>");
            }

            if (messages.size() > 0)
                msg.append("<br>Do you want to make these changes?");
            else
                msg.append("There are no changes to be made");

            return new HtmlView(msg.toString());
        }

        @Override
        public boolean handlePost(Object form, BindException errors)
        {
            List<String> messages = EHRManager.get().ensureStudyQCStates(getContainer(), getUser(), true);
            return true;
        }
    }

    @RequiresPermission(AdminPermission.class)
    public class VerifyDatasetResourcesAction extends SimpleViewAction<Object>
    {
        public void validateCommand(Object form, Errors errors)
        {

        }

        public URLHelper getSuccessURL(Object form)
        {
            return getContainer().getStartURL(getUser());
        }

        @Override
        public ModelAndView getView(Object form, BindException errors)
        {
            StringBuilder msg = new StringBuilder();
            msg.append("For each dataset, we expect to find a trigger script and .query.xml file.  The following datasets lack one or more of these:<br><br>");

            List<String> messages = EHRManager.get().verifyDatasetResources(getContainer(), getUser());
            for (String message : messages)
            {
                msg.append("\t").append(message).append("<br>");
            }

            if (messages.size() == 0)
                msg.append("There are no missing files");

            return new HtmlView(msg.toString());
        }

        @Override
        public void addNavTrail(NavTree tree)
        {
            tree.addChild("Dataset Validation");
        }
    }

    @RequiresPermission(AdminPermission.class)
    public class DoGeneticCalculationsAction extends ConfirmAction<Object>
    {
        @Override
        public void validateCommand(Object form, Errors errors)
        {
        }

        @Override
        public @NotNull URLHelper getSuccessURL(Object form)
        {
            return PageFlowUtil.urlProvider(PipelineStatusUrls.class).urlBegin(getContainer());
        }

        @Override
        public ModelAndView getConfirmView(Object form, BindException errors)
        {
            return new HtmlView("This will cause the system to recalculate kinship and inbreeding coefficients on the colony.  Do you want to continue?");
        }

        @Override
        public boolean handlePost(Object form, BindException errors) throws Exception
        {
            return new GeneticCalculationsRunnable().run(getContainer(), true);
        }
    }

    @RequiresPermission(AdminPermission.class)
    public class DeletedRecordsRunnerAction extends ConfirmAction<Object>
    {
        @Override
        public void validateCommand(Object form, Errors errors)
        {
        }

        @Override
        public @NotNull URLHelper getSuccessURL(Object form)
        {
            return getContainer().getStartURL(getUser());
        }

        @Override
        public ModelAndView getConfirmView(Object form, BindException errors)
        {
            return new HtmlView("This will cause the system to scan all datasets for records flagged as either Delete: Requested, or Cancelled or Denied Requests and permanently delete these records.  Do you want to continue?");
        }

        @Override
        public boolean handlePost(Object form, BindException errors)
        {
            new RecordDeleteRunner().run(getContainer());

            return true;
        }
    }

    public static class PopulateLookupsForm
    {
        private boolean _delete;
        private String _manifest;

        public boolean isDelete()
        {
            return _delete;
        }

        public void setDelete(boolean delete)
        {
            _delete = delete;
        }

        public String getManifest()
        {
            return _manifest;
        }

        public void setManifest(String manifest)
        {
            _manifest = manifest;
        }
    }

    @RequiresPermission(AdminPermission.class)
    public class PopulateLookupsAction extends MutatingApiAction<PopulateLookupsForm>
    {
        private final String _manifestDirectory = "data/";
        private final String _manifestDefault = "lookupsManifest";
        private final String _manifestFileExt = ".tsv";
        private final String _lookupSetsPath = "data/lookup_sets.tsv";
        private Resource _lookupsManifest;
        private Resource _lookupSets;
        private Module _lookupsManifestModule;

        @Override
        public void validateForm(PopulateLookupsForm form, Errors errors)
        {
            super.validateForm(form, errors);

            Module ehrModule = ModuleLoader.getInstance().getModule("ehr");
            if (null == ehrModule)
            {
                errors.reject(ERROR_MSG, "EHR module missing.");
            }
            else
            {
                ModuleProperty mp = ehrModule.getModuleProperties().get(EHRManager.EHRCustomModulePropName);
                _lookupsManifestModule = null;
                if (mp != null && mp.getEffectiveValue(getContainer()) != null)
                {
                    _lookupsManifestModule = ModuleLoader.getInstance().getModule(mp.getEffectiveValue(getContainer()));
                    if (null != _lookupsManifestModule)
                    {
                        if (form.getManifest() != null)
                        {
                            _lookupsManifest = _lookupsManifestModule.getModuleResource(_manifestDirectory + form.getManifest() + _manifestFileExt);
                        }
                        else
                        {
                            _lookupsManifest = _lookupsManifestModule.getModuleResource(_manifestDirectory + _manifestDefault + _manifestFileExt);
                        }
                        _lookupSets = _lookupsManifestModule.getModuleResource(_lookupSetsPath);
                    }
                }
                else
                {
                    _log.warn("Attempted to access EHRCustomModule Module Property, which has not been set for this folder." +
                            "Populating base EHR lookups.");
                }

                if (_lookupsManifest == null || !_lookupsManifest.exists() || _lookupSets == null || !_lookupSets.exists())
                {
                    if (form.getManifest() != null)
                    {
                        _lookupsManifest = _lookupsManifestModule.getModuleResource(_manifestDirectory + form.getManifest() + _manifestFileExt);
                    }
                    else
                    {
                        _lookupsManifest = _lookupsManifestModule.getModuleResource(_manifestDirectory + _manifestDefault + _manifestFileExt);
                    }
                    _lookupSets = ehrModule.getModuleResource(_lookupSetsPath);
                    _lookupsManifestModule = ehrModule;
                }

                if (_lookupsManifest == null || !_lookupsManifest.exists() || _lookupSets == null || !_lookupSets.exists())
                {
                    errors.reject(ERROR_MSG, "Unable to find lookups manifest and lookupSets in module '" + _lookupsManifestModule.getName() + "'");
                }
            }

        }

        private void loadFile(UserSchema schema, String tableName, Resource resource, boolean isDelete) throws SQLException, BatchValidationException, QueryUpdateServiceException, IOException
        {
            TableInfo table = schema.getTable(tableName);
            if (table == null)
            {
                // If table not created yet just skip on delete
                if (isDelete)
                    return;

                throw new IllegalArgumentException("Could not find " + tableName + " table in " + schema.getName() + " schema in " + getContainer().getPath());
            }
            QueryUpdateService updateService = table.getUpdateService();
            if (updateService == null)
            {
                throw new IllegalArgumentException("No query update service for " + schema.getName() + "." + tableName + ".");
            }

            updateService.truncateRows(getUser(), getContainer(), null, null);

            if (!isDelete)
            {
                DataLoader loader = DataLoader.get().createLoader(resource, true, null, TabLoader.TSV_FILE_TYPE);

                BatchValidationException batchErrors = new BatchValidationException();
                AuditBehaviorType behaviorType = table.getAuditBehavior();
                TransactionAuditProvider.TransactionAuditEvent auditEvent = null;
                if (behaviorType != null && behaviorType != AuditBehaviorType.NONE)
                    auditEvent = createTransactionAuditEvent(getContainer(), QueryService.AuditAction.INSERT);

                AbstractQueryImportAction.importData(loader, table, updateService, QueryUpdateService.InsertOption.INSERT,
                        false, false, batchErrors, behaviorType, auditEvent, getUser(), getContainer());

                if (batchErrors.hasErrors())
                {
                    throw batchErrors;
                }
            }
        }

        @Override
        public Object execute(PopulateLookupsForm form, BindException errors) throws Exception
        {
            // Should reject before getting here
            if (null == _lookupsManifest || null == _lookupSets)
                return null;

            ApiSimpleResponse response = new ApiSimpleResponse();
            HtmlStringBuilder responseText = HtmlStringBuilder.of((form.isDelete() ? "Deleting" : "Loading") + " lookups from module: " + _lookupsManifestModule.getName() + "\n");

            UserSchema schema = QueryService.get().getUserSchema(getUser(), getContainer(), "ehr_lookups");
            if (schema == null)
            {
                throw new IllegalArgumentException("Could not find ehr_lookups schema in " + getContainer().getPath());
            }

            responseText.append("Lookup tables: \n");
            try (DbScope.Transaction transaction = schema.getDbSchema().getScope().ensureTransaction())
            {
                loadFile(schema, "lookup_sets", _lookupSets, form.isDelete());
                responseText.append("lookup_sets\n");

                BufferedReader reader = Readers.getReader(_lookupsManifest.getInputStream());
                String line;
                String header = null;

                while ((line = reader.readLine()) != null)
                {
                    if (header == null)
                    {
                        header = line;
                        continue;
                    }

                    String [] cols = line.split("\t");
                    Resource r = _lookupsManifestModule.getModuleResource("data/" + cols[0] + ".tsv");
                    if (r != null && r.exists())
                    {
                        responseText.append(cols[0] + "\n");
                        loadFile(schema, cols[0], r, form.isDelete());
                    }
                    else
                    {
                        responseText.append(cols[0] + " - file not found\n");
                    }
                }

                transaction.commit();
            }

            responseText.append((form.isDelete() ? "Deleting" : "Loading") + " lookups is complete.");
            response.put("result", responseText);
            response.put("success", true);
            return response;

        }
    }

    @RequiresPermission(AdminPermission.class)
    public class PopulateReportsAction extends MutatingApiAction<PopulateLookupsForm>
    {
        private final String _reportsPath = "reports/reports.tsv";
        private final String _additionalReportsPath = "reports/additionalReports.tsv";
        private Resource _reportsResource;
        private Resource _additionalReportsResource;

        private Module _additionalReportsModule;

        @Override
        public void validateForm(PopulateLookupsForm form, Errors errors)
        {
            super.validateForm(form, errors);

            Module ehrModule = ModuleLoader.getInstance().getModule("ehr");
            if (null == ehrModule)
            {
                errors.reject(ERROR_MSG, "EHR module missing.");
            }
            else if (!form.isDelete())
            {
                _reportsResource = ehrModule.getModuleResource(_reportsPath);
                if (_reportsResource == null || !_reportsResource.exists())
                    errors.reject(ERROR_MSG, "Reports file '" + _reportsPath + "' not found in EHR module.");

                ModuleProperty mp = ehrModule.getModuleProperties().get(EHRManager.EHRCustomModulePropName);
                if (mp == null || mp.getEffectiveValue(getContainer()) == null)
                {
                    _log.warn("Attempted to access EHRCustomModule Module Property, which has not been set for this folder");
                }
                else
                {
                    _additionalReportsModule = ModuleLoader.getInstance().getModule(mp.getEffectiveValue(getContainer()));
                    if (null != _additionalReportsModule)
                    {
                        _additionalReportsResource = _additionalReportsModule.getModuleResource(_additionalReportsPath);
                        if (_additionalReportsResource == null || !_additionalReportsResource.exists())
                            _log.info("No additional reports found in " + mp.getEffectiveValue(getContainer()) + " module.");
                    }
                }
            }
        }

        @Override
        public Object execute(PopulateLookupsForm form, BindException errors) throws Exception
        {
            // Should reject before getting here
            if (!form.isDelete() && null == _reportsResource)
                return null;

            ApiSimpleResponse response = new ApiSimpleResponse();
            HtmlStringBuilder responseText;

            if (form.isDelete())
            {
                responseText = HtmlStringBuilder.of("Deleting reports\n");
            }
            else
            {
                responseText = HtmlStringBuilder.of("Populating reports from EHR module\n");
            }

            UserSchema schema = QueryService.get().getUserSchema(getUser(), getContainer(), "ehr");
            if (schema == null)
            {
                throw new IllegalArgumentException("Could not find EHR schema in " + getContainer().getPath());
            }
            TableInfo table = schema.getTable("reports");
            if (table == null)
            {
                throw new IllegalArgumentException("Could not find reports table in EHR schema in " + getContainer().getPath());
            }
            QueryUpdateService updateService = table.getUpdateService();
            if (updateService == null)
            {
                throw new IllegalArgumentException("No query update service for ehr.reports.");
            }

            try (DbScope.Transaction transaction = table.getSchema().getScope().ensureTransaction())
            {
                updateService.truncateRows(getUser(), getContainer(), null, null);

                if (!form.isDelete())
                {
                    // Initially insert core reports
                    DataLoader loader = DataLoader.get().createLoader(_reportsResource, true, null, TabLoader.TSV_FILE_TYPE);

                    BatchValidationException batchErrors = new BatchValidationException();
                    AuditBehaviorType behaviorType = table.getAuditBehavior();
                    TransactionAuditProvider.TransactionAuditEvent auditEvent = null;
                    if (behaviorType != null && behaviorType != AuditBehaviorType.NONE)
                        auditEvent = createTransactionAuditEvent(getContainer(), QueryService.AuditAction.INSERT);

                    DataIteratorContext context = new DataIteratorContext(batchErrors);

                    Map<Enum, Object> configParameters = new HashMap<>();
                    configParameters.put(DetailedAuditLogDataIterator.AuditConfigs.AuditBehavior, behaviorType);

                    context.setConfigParameters(configParameters);
                    context.setInsertOption(QueryUpdateService.InsertOption.INSERT);

                    AbstractQueryImportAction.importData(loader, table, updateService, context, auditEvent, getUser(), getContainer());

                    if (batchErrors.hasErrors())
                    {
                        throw batchErrors;
                    }

                    if (null != _additionalReportsResource)
                    {
                        // Merge in additional reports (based on report name) with replace option
                        responseText.append("Populating additional reports from " + _additionalReportsModule.getName() + " module\n");
                        if (behaviorType != null && behaviorType != AuditBehaviorType.NONE)
                            auditEvent = createTransactionAuditEvent(getContainer(), QueryService.AuditAction.INSERT);

                        context = new DataIteratorContext(batchErrors);
                        context.setConfigParameters(configParameters);
                        context.setInsertOption(QueryUpdateService.InsertOption.REPLACE);
                        context.getAlternateKeys().add("reportname");

                        loader = DataLoader.get().createLoader(_additionalReportsResource, true, null, TabLoader.TSV_FILE_TYPE);
                        AbstractQueryImportAction.importData(loader, table, updateService, context, auditEvent, getUser(), getContainer());
                    }
                }
                transaction.commit();
            }

            responseText.append((form.isDelete() ? "Deleting" : "Loading") + " reports is complete.");
            response.put("result", responseText);
            response.put("success", true);
            return response;
        }
    }

    public static class ReportLinkForm
    {
        private String[] _linkTypes;

        public String[] getLinkTypes()
        {
            return _linkTypes;
        }

        public void setLinkTypes(String[] linkTypes)
        {
            _linkTypes = linkTypes;
        }
    }

    @RequiresPermission(ReadPermission.class)
    public class GetReportLinksAction extends ReadOnlyApiAction<ReportLinkForm>
    {
        @Override
        public ApiResponse execute(ReportLinkForm form, BindException errors)
        {
            Map<String, Object> resultProperties = new HashMap<>();

            List<JSONObject> ret = new ArrayList<>();

            if (form.getLinkTypes() == null)
            {
                errors.reject(ERROR_MSG, "No link types specified");
                return null;
            }

            for (String linkType : form.getLinkTypes())
            {
                try
                {
                    EHRService.REPORT_LINK_TYPE type = EHRService.REPORT_LINK_TYPE.valueOf(linkType);

                    List<EHRServiceImpl.ReportLink> items = EHRServiceImpl.get().getReportLinks(getContainer(), getUser(), type);
                    for (EHRServiceImpl.ReportLink link : items)
                    {
                        JSONObject item = link.toJSON(getContainer());
                        item.put("type", type.name());
                        ret.add(item);
                    }
                }
                catch (IllegalArgumentException e)
                {
                    errors.reject(ERROR_MSG, "Invalid link type: " + linkType);
                    return null;
                }
            }

            resultProperties.put("items", ret);
            return new ApiSimpleResponse(resultProperties);
        }
    }

    public static class EnterDataForm
    {
        private String _formType;
        private String _taskId;
        private String _requestId;

        private String _schemaName;
        private String _queryName;

        public String getFormType()
        {
            return _formType;
        }

        public void setFormType(String formType)
        {
            _formType = formType;
        }

        public String getTaskId()
        {
            return _taskId;
        }

        public void setTaskId(String taskId)
        {
            _taskId = taskId;
        }

        public String getRequestId()
        {
            return _requestId;
        }

        public void setRequestId(String requestId)
        {
            _requestId = requestId;
        }

        public String getSchemaName()
        {
            return _schemaName;
        }

        public void setSchemaName(String schemaName)
        {
            _schemaName = schemaName;
        }

        public String getQueryName()
        {
            return _queryName;
        }

        public void setQueryName(String queryName)
        {
            _queryName = queryName;
        }
    }

    @RequiresPermission(ReadPermission.class)
    public class GetDataEntryFormDetailsAction extends ReadOnlyApiAction<EnterDataForm>
    {
        @Override
        public ApiResponse execute(EnterDataForm form, BindException errors)
        {
            Map<String, Object> props = new HashMap<String, Object>();

            if (form.getFormType() == null && form.getTaskId() == null && form.getRequestId() == null)
            {
                errors.reject(ERROR_MSG, "Must provide either the form type, taskId or requestId");
                return null;
            }

            String formType = form.getFormType();
            if (formType == null && form.getTaskId() != null)
            {
                formType = EHRManager.get().getFormTypeForTask(getContainer(), getUser(), form.getTaskId());
            }

            if (formType == null && form.getRequestId() != null)
            {
                formType = EHRManager.get().getFormTypeForRequest(getContainer(), getUser(), form.getRequestId());
            }

            if (formType == null)
            {
                errors.reject(ERROR_MSG, "Unable to find formType for task: " + form.getTaskId());
                return null;
            }

            DataEntryForm def = DataEntryManager.get().getFormByName(formType, getContainer(), getUser());
            if (def == null)
            {
                errors.reject(ERROR_MSG, "Unknown form type: " + formType);
                return null;
            }

            if (!def.canRead())
            {
                props.put("success", false);
                props.put("canRead", false);
            }
            else
            {
                props.put("success", true);
                props.put("canRead", true);
                props.put("form", def.toJSON());
            }

            return new ApiSimpleResponse(props);
        }
    }

    @RequiresPermission(EHRDataEntryPermission.class)
    public class DataEntryFormAction extends SimpleViewAction<EnterDataForm>
    {
        private String _title = null;
        private DataEntryForm _def;

        @Override
        public ModelAndView getView(EnterDataForm form, BindException errors)
        {
            if (form.getFormType() == null)
            {
                errors.reject(ERROR_MSG, "Must provide a form type");
                return new SimpleErrorView(errors);
            }

            _def = DataEntryManager.get().getFormByName(form.getFormType(), getContainer(), getUser());
            if (_def == null)
            {
                errors.reject(ERROR_MSG, "Unknown form type: " + form.getFormType());
                return new SimpleErrorView(errors);
            }

            _title = _def.getLabel();
            getPageConfig().setIncludePostParameters(true);
            return _def.createView();
        }

        @Override
        public void addNavTrail(NavTree root)
        {
            if (_def != null)
            {
                _def.addNavTrail(root, _title);
            }
        }
    }

    @RequiresPermission(EHRDataEntryPermission.class)
    public class DataEntryFormForQueryAction extends SimpleViewAction<EnterDataForm>
    {
        private String _title = null;

        @Override
        public ModelAndView getView(EnterDataForm form, BindException errors)
        {
            if (form.getQueryName() == null || form.getSchemaName() == null)
            {
                errors.reject(ERROR_MSG, "Must provide either the schema/query");
                return null;
            }

            DataEntryForm def = DataEntryManager.get().getFormForQuery(form.getSchemaName(), form.getQueryName(), getContainer(), getUser());
            if (def == null)
            {
                errors.reject(ERROR_MSG, "Unable to create form for query: " + form.getSchemaName() + "." + form.getQueryName());
                return new SimpleErrorView(errors);
            }

            _title = def.getLabel();

            JspView<DataEntryForm> view = new JspView<>("/org/labkey/ehr/view/dataEntryForm.jsp", def);
            view.setFrame(WebPartView.FrameType.NONE);

            view.addClientDependency(ClientDependency.fromPath("ehr/ehr_ext4_dataEntry"));
            view.addClientDependencies(ClientDependency.getClientDependencySet(def.getClientDependencies()));
            getPageConfig().setIncludePostParameters(true);
            return view;

        }

        @Override
        public void addNavTrail(NavTree root)
        {
            root.addChild("Enter Data" + (_title == null ? "" : ": " + _title));
        }
    }

    @RequiresPermission(EHRDataEntryPermission.class)
    public class DataEntryFormJsonForQueryAction extends ReadOnlyApiAction<EnterDataForm>
    {
        @Override
        public ApiResponse execute(EnterDataForm form, BindException errors)
        {
            if (form.getQueryName() == null || form.getSchemaName() == null)
            {
                errors.reject(ERROR_MSG, "Must provide either the schema/query");
                return null;
            }

            DataEntryForm def = DataEntryManager.get().getFormForQuery(form.getSchemaName(), form.getQueryName(), getContainer(), getUser());
            if (def == null)
            {
                errors.reject(ERROR_MSG, "Unable to create form for query: " + form.getSchemaName() + "." + form.getQueryName());
                return null;
            }

            JSONObject ret = new JSONObject();
            ret.put("formConfig", def.toJSON());

            LinkedHashSet<String> jsDependencyPaths = new LinkedHashSet<>();
            LinkedHashSet<String> cssDependencyPaths = new LinkedHashSet<>();

            LinkedHashSet<ClientDependency> dependencies = new LinkedHashSet<>();
            dependencies.add(ClientDependency.fromPath("ehr/ehr_ext4_dataEntry"));
            dependencies.addAll(ClientDependency.getClientDependencySet(def.getClientDependencies()));
            for (ClientDependency cd : dependencies)
            {
                jsDependencyPaths.addAll(cd.getJsPaths(getContainer(), AppProps.getInstance().isDevMode()));
                cssDependencyPaths.addAll(cd.getCssPaths(getContainer()));
            }
            ret.put("jsDependencies", jsDependencyPaths);
            ret.put("cssDsDependencies", cssDependencyPaths);

            return new ApiSimpleResponse(ret);
        }

    }

    public static class ManageFlagsForm
    {
        private String _flag;
        private Date _date;
        private Date _enddate;
        private String _remark;
        private String[] _animalIds;
        private String _mode;
        private Boolean _livingAnimalsOnly = true;

        public String getFlag()
        {
            return _flag;
        }

        public void setFlag(String flag)
        {
            _flag = flag;
        }

        public Date getDate()
        {
            return _date;
        }

        public void setDate(Date date)
        {
            _date = date;
        }

        public Date getEnddate()
        {
            return _enddate;
        }

        public void setEnddate(Date enddate)
        {
            _enddate = enddate;
        }

        public String getRemark()
        {
            return _remark;
        }

        public void setRemark(String remark)
        {
            _remark = remark;
        }

        public String[] getAnimalIds()
        {
            return _animalIds;
        }

        public void setAnimalIds(String[] animalIds)
        {
            _animalIds = animalIds;
        }

        public String getMode()
        {
            return _mode;
        }

        public void setMode(String mode)
        {
            _mode = mode;
        }

        public Boolean getLivingAnimalsOnly()
        {
            return _livingAnimalsOnly;
        }

        public void setLivingAnimalsOnly(Boolean livingAnimalsOnly)
        {
            _livingAnimalsOnly = livingAnimalsOnly;
        }
    }

    @RequiresPermission(UpdatePermission.class)
    public class ManageFlagsAction extends MutatingApiAction<ManageFlagsForm>
    {
        @Override
        public ApiResponse execute(ManageFlagsForm form, BindException errors)
        {
            Map<String, Object> resp = new HashMap<>();

            if (form.getFlag() == null)
            {
                errors.reject(ERROR_MSG, "No flag supplied");
                return null;
            }

            if (form.getAnimalIds() == null || form.getAnimalIds().length == 0)
            {
                errors.reject(ERROR_MSG, "No animal IDs supplied");
                return null;
            }

            try
            {
                String mode = form.getMode();
                if ("add".equalsIgnoreCase(mode))
                {
                    if (form.getDate() == null)
                    {
                        errors.reject(ERROR_MSG, "Must supply a date");
                        return null;
                    }

                    Collection<String> added = EHRManager.get().ensureFlagActive(getUser(), getContainer(), form.getFlag(), form.getDate(), null, form.getRemark(), Arrays.asList(form.getAnimalIds()), form.getLivingAnimalsOnly());
                    resp.put("added", added);
                }
                else if ("remove".equalsIgnoreCase(mode))
                {
                    if (form.getEnddate() == null)
                    {
                        errors.reject(ERROR_MSG, "Must supply an end date");
                        return null;
                    }

                    Collection<String> removed = EHRManager.get().terminateFlagsIfExists(getUser(), getContainer(), form.getFlag(), form.getEnddate(), Arrays.asList(form.getAnimalIds()));
                    resp.put("removed", removed);
                }
                else
                {
                    errors.reject(ERROR_MSG, "Unknown mode, must either be add or remove");
                    return null;
                }

                resp.put("success", true);
            }
            catch (IllegalArgumentException e)
            {
                errors.reject(ERROR_MSG, e.getMessage());
                return null;
            }
            catch (BatchValidationException e)
            {
                List<String> errs = new ArrayList<>();
                for (ValidationException ve : e.getRowErrors())
                {
                    for (ValidationError v : ve.getErrors())
                    {
                        errs.add(v.getMessage());
                    }
                }
                errors.reject(ERROR_MSG, StringUtils.join(errs, ";\n"));
                return null;
            }

            return new ApiSimpleResponse(resp);
        }
    }

    public static class IdForm
    {
        private String _ids;
        private int _interval;

        public String getIds()
        {
            return _ids;
        }

        public void setIds(String id)
        {
            _ids = id;
        }

        public int getInterval()
        {
            return _interval;
        }

        public void setInterval(int interval)
        {
            _interval = interval;
        }

        public List<String> getIdList()
        {
            List<String> list = new ArrayList<>();
            String[] ids = _ids.split(",");
            for (String id : ids)
                list.add(id);

            return list;
        }
    }

    @RequiresPermission(ReadPermission.class)
    public class BloodPlotDataAction extends ReadOnlyApiAction<IdForm>
    {

        @Override
        public ApiResponse execute(IdForm idForm, BindException errors)
        {
            ApiSimpleResponse response = new ApiSimpleResponse();

            UserSchema schema = QueryService.get().getUserSchema(getUser(), getContainer(), "study");
            TableInfo bloodDrawsTable = schema.getTable("currentBloodDraws");

            SimpleFilter filter = new SimpleFilter();
            filter.addCondition(FieldKey.fromParts("id"), idForm.getIdList(), CompareType.IN);

            TableSelector selector = new TableSelector(bloodDrawsTable, filter, null);

            Map<String, Object> params = new HashMap<>();
            params.put("DATE_INTERVAL", idForm.getInterval());
            selector.setNamedParameters(params);

            List<BloodPlotData> bloodData = selector.getArrayList(BloodPlotData.class);
            List<JSONObject> jsonData = new ArrayList<>();
            for (BloodPlotData data : bloodData)
            {
                jsonData.add(data.toJSON());
            }

            List<DisplayColumn> cols = new ArrayList<>();
            List<JSONObject> colModels = new ArrayList<>();
            for (ColumnInfo ci : bloodDrawsTable.getColumns())
            {
                DisplayColumn dc = new DataColumn(ci);
                colModels.add(new JSONObject(JsonWriter.getColModel(dc)));
                cols.add(dc);
            }

            JSONArray fields = new JSONArray(JsonWriter.getNativeColProps(cols, null, false).values());
            JSONArray columnModel = new JSONArray(colModels);
            JSONObject meta = new JSONObject().put("fields", fields).put("root", "rows");

            response.put("rows", jsonData);
            response.put("metaData", meta);
            response.put("rowCount", jsonData.size());
            response.put("columnModel", columnModel);

            return response;
        }
    }

    @RequiresPermission(AdminPermission.class)
    public class ValidateDatasetColsAction extends ConfirmAction<Object>
    {
        @Override
        public void validateCommand(Object form, Errors errors)
        {

        }

        @Override
        public @NotNull URLHelper getSuccessURL(Object form)
        {
            return PageFlowUtil.urlProvider(PipelineStatusUrls.class).urlBegin(getContainer());
        }

        @Override
        public ModelAndView getConfirmView(Object form, BindException errors) throws Exception
        {
            //NOTE: consider allowing moduleName as a URL param?
            List<String> msgs = new ArrayList<>();
            for (Module module : EHRService.get().getRegisteredModules())
            {
                if (!getContainer().getActiveModules().contains(module))
                {
                    continue;
                }

                msgs.add("Validating using the datasets.xml file from module: " + module.getName() + ":<br>");

                FileResource resource = (FileResource) module.getModuleResolver().lookup(Path.parse("referenceStudy/datasets/datasets_metadata.xml"));
                if (resource == null || !resource.getFile().exists())
                {
                    msgs.add("dataset XML not found in module.  expected: referenceStudy/datasets/datasets_metadata.xml");
                    continue;
                }

                List<String> moduleMsgs = EHRManager.get().validateDatasetCols(getContainer(), getUser(), resource.getFile());
                if (moduleMsgs.isEmpty())
                {
                    msgs.add("No discrepanies found");
                }
                else
                {
                    msgs.addAll(moduleMsgs);
                }

                msgs.add("<hr>");
            }

            return new HtmlView("This action will compare the columns in the study datasets against those expected in the reference XML file.  " + (msgs.isEmpty() ? "No problems were found." : "The following discrepancies were found:<br><br> " + StringUtils.join(msgs, "<br>")));
        }

        @Override
        public boolean handlePost(Object form, BindException errors)
        {
            //TODO: consider automatically fixing?

            return true;
        }
    }


    @RequiresPermission(ReadPermission.class)
    public class GetAnimalLockAction extends ReadOnlyApiAction<Object>
    {
        @Override
        public ApiResponse execute(Object form, BindException errors)
        {
            return new ApiSimpleResponse(EHRManager.get().getAnimalLockProperties(getContainer()));
        }
    }

    @RequiresPermission(EHRDataEntryPermission.class)
    public class SetAnimalLockAction extends MutatingApiAction<LockAnimalForm>
    {
        @Override
        public ApiResponse execute(LockAnimalForm form, BindException errors)
        {
            ///Added by Lakshmi on 02/26/2015: This is server side validation code to check if the Birth/Arrival screens are locked or not.
            //If already locked: show the lock results
            //If not locked: Check if its locked and display the lock results instead of locking the screen again.
            Map<String, Object> props = EHRManager.get().getAnimalLockProperties(getContainer());
            if (!Boolean.TRUE.equals(props.get("locked") ) || (!form.isLock()) )
            {
                EHRManager.get().lockAnimalCreation(getContainer(), getUser(), form.isLock(), form.getStartingId(), form.getIdCount());
            }

            return new ApiSimpleResponse(EHRManager.get().getAnimalLockProperties(getContainer()));
        }
    }

    public static class LockAnimalForm
    {
        private boolean _lock;
        private Integer _startingId;
        private Integer _idCount;

        public boolean isLock()
        {
            return _lock;
        }

        public void setLock(boolean lock)
        {
            _lock = lock;
        }

        public Integer getIdCount()
        {
            return _idCount;
        }

        public void setIdCount(Integer idCount)
        {
            _idCount = idCount;
        }

        public Integer getStartingId()
        {
            return _startingId;
        }

        public void setStartingId(Integer startingId)
        {
            _startingId = startingId;
        }
    }
}