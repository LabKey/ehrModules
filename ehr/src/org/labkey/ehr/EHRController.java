/*
 * Copyright (c) 2009-2013 LabKey Corporation
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

import org.json.JSONArray;
import org.json.JSONObject;
import org.labkey.api.action.ApiAction;
import org.labkey.api.action.ApiResponse;
import org.labkey.api.action.ApiSimpleResponse;
import org.labkey.api.action.ConfirmAction;
import org.labkey.api.action.SimpleViewAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr.HistoryRow;
import org.labkey.api.ehr.dataentry.DataEntryForm;
import org.labkey.api.pipeline.PipelineStatusUrls;
import org.labkey.api.security.RequiresPermissionClass;
import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.util.ExceptionUtil;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.util.URLHelper;
import org.labkey.api.view.ActionURL;
import org.labkey.api.view.HtmlView;
import org.labkey.api.view.JspView;
import org.labkey.api.view.NavTree;
import org.labkey.api.view.UnauthorizedException;
import org.labkey.api.view.WebPartView;
import org.labkey.ehr.dataentry.DataEntryManager;
import org.labkey.ehr.history.ClinicalHistoryManager;
import org.labkey.ehr.history.LabworkManager;
import org.labkey.ehr.pipeline.GeneticCalculationsJob;
import org.labkey.ehr.pipeline.GeneticCalculationsRunnable;
import org.labkey.ehr.security.EHRDataEntryPermission;
import org.springframework.validation.BindException;
import org.springframework.validation.Errors;
import org.springframework.web.servlet.ModelAndView;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class EHRController extends SpringActionController
{
    private static final DefaultActionResolver _actionResolver = new EHRActionResolver();

    public EHRController()
    {
        setActionResolver(_actionResolver);
    }

    @RequiresPermissionClass(ReadPermission.class)
    public class GetDataEntryItemsAction extends ApiAction<Object>
    {
        public ApiResponse execute(Object form, BindException errors)
        {
            Map<String, Object> resultProperties = new HashMap<>();

            Collection<DataEntryForm> forms = DataEntryManager.get().getForms(getContainer(), getUser());
            List<JSONObject> formJson = new ArrayList<JSONObject>();
            for (DataEntryForm def : forms)
            {
                formJson.add(def.toJSON(getContainer(), getUser()));
            }

            resultProperties.put("forms", formJson);
            resultProperties.put("success", true);

            return new ApiSimpleResponse(resultProperties);
        }
    }

    @RequiresPermissionClass(AdminPermission.class)
    public class SetGeneticCalculationTaskSettingsAction extends ApiAction<ScheduleGeneticCalculationForm>
    {
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
            GeneticCalculationsJob.setProperties(form.isEnabled(), c, form.getHourOfDay());

            return new ApiSimpleResponse("success", true);
        }
    }

    @RequiresPermissionClass(AdminPermission.class)
    public class GetGeneticCalculationTaskSettingsAction extends ApiAction<ScheduleGeneticCalculationForm>
    {
        public ApiResponse execute(ScheduleGeneticCalculationForm form, BindException errors)
        {
            Map<String, Object> ret = new HashMap<String, Object>();

            Container c  = GeneticCalculationsJob.getContainer();
            if (c != null)
                ret.put("containerPath", c.getPath());

            ret.put("isScheduled", GeneticCalculationsJob.isScheduled());
            ret.put("enabled", GeneticCalculationsJob.isEnabled());
            ret.put("hourOfDay", GeneticCalculationsJob.getHourOfDay());

            return new ApiSimpleResponse(ret);
        }
    }

    public static class ScheduleGeneticCalculationForm
    {
        private boolean _enabled;
        private String containerPath;
        private int hourOfDay;

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
    }

    @RequiresPermissionClass(ReadPermission.class)
    public class GetLabResultSummary extends ApiAction<LabResultSummaryForm>
    {
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

    @RequiresPermissionClass(ReadPermission.class)
    public class GetClinicalHistoryAction extends ApiAction<HistoryForm>
    {
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
                Map<String, JSONArray> results = new HashMap<String, JSONArray>();
                for (String subjectId : form.getSubjectIds())
                {
                    JSONArray arr = new JSONArray();

                    List<HistoryRow> rows = ClinicalHistoryManager.get().getHistory(getContainer(), getUser(), subjectId, form.getMinDate(), form.getMaxDate(), form.isRedacted());
                    for (HistoryRow row : rows)
                    {
                        arr.put(row.toJSON());
                    }

                    results.put(subjectId, arr);
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

    @RequiresPermissionClass(ReadPermission.class)
    public class GetCaseHistoryAction extends ApiAction<HistoryForm>
    {
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
                Map<String, JSONArray> results = new HashMap<>();
                List<HistoryRow> rows = ClinicalHistoryManager.get().getHistory(getContainer(), getUser(), subjectId, form.getCaseId(), form.isRedacted());
                for (HistoryRow row : rows)
                {
                    JSONArray arr = results.get(subjectId);
                    if (arr == null)
                        arr = new JSONArray();

                    arr.put(row.toJSON());

                    results.put(subjectId, arr);
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

    @RequiresPermissionClass(AdminPermission.class)
    public class EnsureDatasetPropertiesAction extends ConfirmAction<EnsureDatasetPropertiesForm>
    {
        public void validateCommand(EnsureDatasetPropertiesForm form, Errors errors)
        {

        }

        public URLHelper getSuccessURL(EnsureDatasetPropertiesForm form)
        {
            return getContainer().getStartURL(getUser());
        }

        public ModelAndView getConfirmView(EnsureDatasetPropertiesForm form, BindException errors) throws Exception
        {
            StringBuilder msg = new StringBuilder();
            msg.append("The EHR expects certain columns to be present on all datasets.  The following changes will be made:<br><br>");

            List<String> messages = EHRManager.get().ensureDatasetPropertyDescriptors(getContainer(),  getUser(), false, form.isRebuildIndexes());
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

        public boolean handlePost(EnsureDatasetPropertiesForm form, BindException errors) throws Exception
        {
            List<String> messages = EHRManager.get().ensureDatasetPropertyDescriptors(getContainer(),  getUser(), true, form.isRebuildIndexes());
            return true;
        }
    }

    @RequiresPermissionClass(AdminPermission.class)
    public class EnsureEHRSchemaIndexesAction extends ConfirmAction<Object>
    {
        public void validateCommand(Object form, Errors errors)
        {

        }

        public URLHelper getSuccessURL(Object form)
        {
            return getContainer().getStartURL(getUser());
        }

        public ModelAndView getConfirmView(Object form, BindException errors) throws Exception
        {
            if (!getUser().isAdministrator())
            {
                throw new UnauthorizedException("Only site admins can view this page");
            }

            return new HtmlView("Several of the EHR schema tables can contain a large number of records.  Indexes are created by the SQL scripts; however, they are not automatically compressed.  This action will switch row compression on for these indexes.  It will only work for SQLServer.  Do you want to continue?");
        }

        public boolean handlePost(Object form, BindException errors) throws Exception
        {
            EHRManager.get().compressEHRSchemaIndexes();
            return true;
        }
    }

    @RequiresPermissionClass(AdminPermission.class)
    public class EnsureQcStatesAction extends ConfirmAction<Object>
    {
        public void validateCommand(Object form, Errors errors)
        {

        }

        public URLHelper getSuccessURL(Object form)
        {
            return getContainer().getStartURL(getUser());
        }

        public ModelAndView getConfirmView(Object form, BindException errors) throws Exception
        {
            StringBuilder msg = new StringBuilder();
            msg.append("The EHR expects certain QCStates to exist in the study.  The following QCStates will be added:<br><br>");

            List<String> messages = EHRManager.get().ensureStudyQCStates(getContainer(),  getUser(), false);
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

        public boolean handlePost(Object form, BindException errors) throws Exception
        {
            List<String> messages = EHRManager.get().ensureStudyQCStates(getContainer(),  getUser(), true);
            return true;
        }
    }

    @RequiresPermissionClass(AdminPermission.class)
    public class VerifyDatasetResourcesAction extends SimpleViewAction<Object>
    {
        public void validateCommand(Object form, Errors errors)
        {

        }

        public URLHelper getSuccessURL(Object form)
        {
            return getContainer().getStartURL(getUser());
        }

        public ModelAndView getView(Object form, BindException errors) throws Exception
        {
            StringBuilder msg = new StringBuilder();
            msg.append("For each dataset, we expect to find a triger script and .query.xml file.  The following datasets lack one or more of these:<br><br>");

            List<String> messages = EHRManager.get().verifyDatasetResources(getContainer(), getUser());
            for (String message : messages)
            {
                msg.append("\t").append(message).append("<br>");
            }

            if (messages.size() == 0)
                msg.append("There are no missing files");

            return new HtmlView(msg.toString());
        }

        public NavTree appendNavTrail(NavTree tree)
        {
            return tree.addChild("Dataset Validation");

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

    @RequiresPermissionClass(AdminPermission.class)
    public class DoGeneticCalculationsAction extends ConfirmAction<Object>
    {
        public void validateCommand(Object form, Errors errors)
        {

        }

        public URLHelper getSuccessURL(Object form)
        {
            return PageFlowUtil.urlProvider(PipelineStatusUrls.class).urlBegin(getContainer());
        }

        public ModelAndView getConfirmView(Object form, BindException errors) throws Exception
        {
            return new HtmlView("This will cause the system to recalculate kinship and inbreeding coefficients on the colony.  Do you want to continue?");
        }

        public boolean handlePost(Object form, BindException errors) throws Exception
        {
            return new GeneticCalculationsRunnable().run(getContainer());
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
        private Boolean _redacted = false;

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

        public Boolean isRedacted()
        {
            return _redacted == null ? false : _redacted;
        }

        public void setRedacted(Boolean redacted)
        {
            _redacted = redacted;
        }
    }

    @RequiresPermissionClass(ReadPermission.class)
    public class GetReportLinksAction extends ApiAction<ReportLinkForm>
    {
        public ApiResponse execute(ReportLinkForm form, BindException errors)
        {
            Map<String, Object> resultProperties = new HashMap<>();

            List<Map<String, Object>> ret = new ArrayList<>();

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

                    List<EHRServiceImpl.ReportLink> items = ((EHRServiceImpl)EHRServiceImpl.get()).getReportLinks(getContainer(), getUser(), type);
                    for (EHRServiceImpl.ReportLink link : items)
                    {
                        Map<String, Object> item = new HashMap<String, Object>();
                        ActionURL url = link.getUrl().copy(getContainer()).getActionURL();
                        item.put("label", link.getLabel());
                        item.put("category", link.getCategory());
                        item.put("type", type.name());
                        item.put("controller", url.getController());
                        item.put("action", url.getAction());
                        item.put("params", url.getParameterMap());
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

    @RequiresPermissionClass(EHRDataEntryPermission.class)
    public class DataEntryFormAction extends SimpleViewAction<EnterDataForm>
    {
        private String _title = null;

        @Override
        public ModelAndView getView(EnterDataForm form, BindException errors) throws Exception
        {
            if (form.getFormType() == null)
            {
                errors.reject(ERROR_MSG, "No form type provided");
                return null;
            }

            DataEntryForm def = DataEntryManager.get().getFormByName(form.getFormType(), getContainer(), getUser());
            if (def == null)
            {
                errors.reject(ERROR_MSG, "No form type provided");
                return null;
            }

            _title = def.getLabel();

            JspView<DataEntryForm> view = new JspView<DataEntryForm>("/org/labkey/ehr/view/dataEntryForm.jsp", def);
            view.setTitle(def.getLabel());
            view.setHidePageTitle(true);
            view.setFrame(WebPartView.FrameType.PORTAL);
            view.addClientDependencies(def.getClientDependencies());

            return view;
        }

        @Override
        public NavTree appendNavTrail(NavTree root)
        {
            return root.addChild(_title == null ? "Enter Data" : _title);
        }
    }

    public static class EnterDataForm
    {
        private String formType;

        public String getFormType()
        {
            return formType;
        }

        public void setFormType(String formType)
        {
            this.formType = formType;
        }
    }
}