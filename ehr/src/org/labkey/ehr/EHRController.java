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

import org.labkey.api.action.ApiAction;
import org.labkey.api.action.ApiResponse;
import org.labkey.api.action.ApiSimpleResponse;
import org.labkey.api.action.ConfirmAction;
import org.labkey.api.action.SimpleViewAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.pipeline.PipelineStatusUrls;
import org.labkey.api.pipeline.PipelineUrls;
import org.labkey.api.security.IgnoresTermsOfUse;
import org.labkey.api.security.RequiresPermissionClass;
import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.util.URLHelper;
import org.labkey.api.view.HtmlView;
import org.labkey.api.view.JspView;
import org.labkey.api.view.NavTree;
import org.labkey.ehr.pipeline.KinshipRunnable;
import org.springframework.validation.BindException;
import org.springframework.validation.Errors;
import org.springframework.web.servlet.ModelAndView;

import java.util.List;

public class EHRController extends SpringActionController
{
    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(EHRController.class);

    public EHRController()
    {
        setActionResolver(_actionResolver);
    }

    @RequiresPermissionClass(ReadPermission.class)
    public class GetDataEntryItemsAction extends ApiAction<Object>
    {
        public ApiResponse execute(Object form, BindException errors)
        {
            ApiResponse resp = new ApiSimpleResponse();

            EHRManager.get().getDataEntryItems(getContainer(), getUser());


            return resp;
        }
    }

    @RequiresPermissionClass(ReadPermission.class)
    public class GetEncounterDetailsAction extends ApiAction<HistoryForm>
    {
        public ApiResponse execute(HistoryForm form, BindException errors)
        {
            ApiResponse resp = new ApiSimpleResponse();




            return resp;
        }
    }

    @RequiresPermissionClass(ReadPermission.class)
    public class GetCaseDetailsAction extends ApiAction<HistoryForm>
    {
        public ApiResponse execute(HistoryForm form, BindException errors)
        {
            ApiResponse resp = new ApiSimpleResponse();




            return resp;
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

            List<String> messages = EHRManager.get().ensureDatasetPropertyDescriptors(getContainer(),  getUser(), false);
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
            List<String> messages = EHRManager.get().ensureDatasetPropertyDescriptors(getContainer(),  getUser(), true);
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

            List<String> messages = EHRManager.get().verifyDatasetResources(getContainer(),  getUser());
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

        public void setCommitChanges(boolean commitChanges)
        {
            this.commitChanges = commitChanges;
        }

        public boolean isCommitChanges()
        {
            return commitChanges;
        }
    }

    @RequiresPermissionClass(AdminPermission.class)
    public class KinshipAction extends ConfirmAction<Object>
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
            return new HtmlView("This will cause the system to recalculate kinship coefficients on the colony.  Do you want to continue?");
        }

        public boolean handlePost(Object form, BindException errors) throws Exception
        {
            return new KinshipRunnable().run(getContainer());
        }
    }

    public static class HistoryForm
    {
        private String _parentId;

        public String getParentId()
        {
            return _parentId;
        }

        public void setParentId(String parentId)
        {
            _parentId = parentId;
        }
    }
}