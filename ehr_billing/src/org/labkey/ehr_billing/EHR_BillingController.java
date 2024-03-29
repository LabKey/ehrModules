/*
 * Copyright (c) 2017-2019 LabKey Corporation
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

package org.labkey.ehr_billing;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.action.ApiResponse;
import org.labkey.api.action.ApiSimpleResponse;
import org.labkey.api.action.ConfirmAction;
import org.labkey.api.action.MutatingApiAction;
import org.labkey.api.action.SimpleViewAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.data.BaseColumnInfo;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.DataRegionSelection;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ehr.security.EHR_BillingAdminPermission;
import org.labkey.api.ehr_billing.pipeline.InvoicedItemsProcessingService;
import org.labkey.api.pipeline.PipeRoot;
import org.labkey.api.pipeline.PipelineJobException;
import org.labkey.api.pipeline.PipelineService;
import org.labkey.api.pipeline.PipelineValidationException;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DetailsURL;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryAction;
import org.labkey.api.query.QueryForm;
import org.labkey.api.query.QueryParseException;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.query.QueryView;
import org.labkey.api.query.QueryWebPart;
import org.labkey.api.security.RequiresPermission;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.security.permissions.UpdatePermission;
import org.labkey.api.util.GUID;
import org.labkey.api.util.Pair;
import org.labkey.api.util.URLHelper;
import org.labkey.api.view.ActionURL;
import org.labkey.api.view.HtmlView;
import org.labkey.api.view.NavTree;
import org.labkey.api.view.Portal;
import org.labkey.api.view.WebPartFactory;
import org.labkey.api.view.WebPartView;
import org.labkey.ehr_billing.pipeline.BillingPipelineForm;
import org.labkey.ehr_billing.pipeline.BillingPipelineJob;
import org.springframework.validation.BindException;
import org.springframework.validation.Errors;
import org.springframework.web.servlet.ModelAndView;

import java.io.File;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class EHR_BillingController extends SpringActionController
{
    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(EHR_BillingController.class);
    public static final String NAME = "ehr_billing";

    public EHR_BillingController()
    {
        setActionResolver(_actionResolver);
    }

    @RequiresPermission(UpdatePermission.class)
    public class RunBillingPipelineAction extends MutatingApiAction<BillingPipelineForm>
    {
        @Override
        public ApiResponse execute(BillingPipelineForm form, BindException errors)
        {
            Map<String, Object> resultProperties = new HashMap<>();

            try
            {
                Date startDate = form.getStartDate();
                Date endDate = form.getEndDate();

                if (endDate.before(startDate))
                {
                    throw new PipelineJobException("Cannot create a billing run with an end date before the start date");
                }

                if(endDate.equals(startDate))
                {
                    throw new PipelineJobException("Cannot create a billing run with the same start and end date");
                }

                InvoicedItemsProcessingService processingService = InvoicedItemsProcessingService.get();
                if (null != processingService)
                {
                    Pair<String,String> previousInvoice = processingService.verifyBillingRunPeriod(getUser(), getContainer(), form.getStartDate(), form.getEndDate());

                    if (null != previousInvoice)
                    {
                        form.setPreviousInvoice(previousInvoice);
                    }
                }

                PipeRoot pipelineRoot = PipelineService.get().findPipelineRoot(getContainer());
                File analysisDir = BillingPipelineJob.createAnalysisDir(pipelineRoot, form.getProtocolName());
                PipelineService.get().queueJob(new BillingPipelineJob(getContainer(), getUser(), getViewContext().getActionURL(), pipelineRoot, analysisDir, form));

                resultProperties.put("success", true);
            }
            catch (PipelineValidationException | PipelineJobException e)
            {
                errors.reject(ERROR_MSG, e.getMessage());
                return null;
            }

            return new ApiSimpleResponse(resultProperties);
        }
    }

    @RequiresPermission(EHR_BillingAdminPermission.class)
    public class DeleteBillingPeriodAction extends ConfirmAction<QueryForm>
    {
        @Override
        public void validateCommand(QueryForm form, Errors errors)
        {
            Set<String> ids = DataRegionSelection.getSelected(form.getViewContext(), true);
            if (ids.size() == 0)
            {
                errors.reject(ERROR_MSG, "Must select at least one item to delete");
            }
        }

        @Override
        public ModelAndView getConfirmView(QueryForm form, BindException errors) throws BatchValidationException, InvalidKeyException, QueryUpdateServiceException
        {
            Set<String> ids = DataRegionSelection.getSelected(form.getViewContext(), true);

            StringBuilder msg = new StringBuilder("You have selected " + ids.size() + " billing runs to delete.  This will also delete: <p>");
            for (String m : EHR_BillingManager.get().deleteBillingRuns(getUser(),getContainer(), ids, true))
            {
                msg.append(m).append("<br>");
            }

            msg.append("<p>Are you sure you want to do this?");

            return new HtmlView(msg.toString());
        }

        @Override
        public boolean handlePost(QueryForm form, BindException errors) throws BatchValidationException, InvalidKeyException, QueryUpdateServiceException
        {
            Set<String> ids = DataRegionSelection.getSelected(form.getViewContext(), true);
            EHR_BillingManager.get().deleteBillingRuns(getUser(), getContainer(), ids, false);

            return true;
        }

        @Override
        public @NotNull URLHelper getSuccessURL(QueryForm form)
        {
            URLHelper url = form.getReturnURLHelper();
            return url != null ? url : QueryService.get().urlFor(getUser(), getContainer(), QueryAction.executeQuery, EHR_BillingSchema.NAME, EHR_BillingSchema.TABLE_INVOICE_RUNS);
        }
    }

    @RequiresPermission(ReadPermission.class)
    public class UpdateQueryAction extends SimpleViewAction<QueryForm>
    {
        private QueryForm _form;

        @Override
        public ModelAndView getView(QueryForm form, BindException errors)
        {
            form.ensureQueryExists();

            _form = form;

            String schemaName = form.getSchemaName();
            String queryName = form.getQueryName();

            QueryView queryView = QueryView.create(form, errors);
            TableInfo ti = queryView.getTable();
            List<String> pks = ti.getPkColumnNames();
            String keyField = null;

            if (pks.size() == 1)
                keyField = pks.get(0);

            ColumnInfo objectid = ti.getColumn("objectid");

            if (null == objectid.getDefaultValue())
                ((BaseColumnInfo)objectid).setDefaultValue(GUID.makeGUID());

            ActionURL url = getViewContext().getActionURL().clone();

            if (keyField != null)
            {
                DetailsURL importUrl = DetailsURL.fromString("/query/importData.view?schemaName=" + schemaName + "&query.queryName=" + queryName + "&keyField=" + keyField);
                importUrl.setContainerContext(getContainer());

                DetailsURL updateUrl = DetailsURL.fromString("/ldk/manageRecord.view?schemaName=" + schemaName + "&query.queryName=" + queryName + "&keyField=" + keyField + "&key=${" + keyField + "}");
                updateUrl.setContainerContext(getContainer());

                DetailsURL deleteUrl = DetailsURL.fromString("/query/deleteQueryRows.view?schemaName=" + schemaName + "&query.queryName=" + queryName);
                deleteUrl.setContainerContext(getContainer());

                url.addParameter("importURL", importUrl.toString());
                url.addParameter("updateURL", updateUrl.toString());
                url.addParameter("deleteURL", deleteUrl.toString());
                url.addParameter("showInsertNewButton", false);
                url.addParameter("dataRegionName", "query");
            }

            url.addParameter("queryName", queryName);
            url.addParameter("allowChooseQuery", false);

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
    }
}