/*
 * Copyright (c) 2009-2010 LabKey Corporation
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

import org.apache.commons.io.IOUtils;
import org.labkey.api.action.*;
import org.labkey.api.data.*;
import org.labkey.api.module.ModuleContext;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.pipeline.*;
import org.labkey.api.security.RequiresPermissionClass;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.view.ActionURL;
import org.labkey.api.view.JspView;
import org.labkey.api.view.NavTree;
import org.labkey.api.view.ViewBackgroundInfo;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

public class EHRController extends SpringActionController
{
    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(EHRController.class);

    public EHRController()
    {
        setActionResolver(_actionResolver);
    }

    @RequiresPermissionClass(ReadPermission.class)
    public class BeginAction extends SimpleViewAction
    {
        public ModelAndView getView(Object o, BindException errors) throws Exception
        {
            return new JspView("/org/labkey/ehr/view/begin.jsp");
        }

        public NavTree appendNavTrail(NavTree root)
        {
            return root;
        }
    }

    private static ReloadSchemaJob submitReloadJob(Container c, User u) throws IOException
    {
        PipelineQueue queue = PipelineService.get().getPipelineQueue();
        ViewBackgroundInfo info = new ViewBackgroundInfo(c, u, null);
        ReloadSchemaJob job = new ReloadSchemaJob(info);
        queue.addJob(job);
        return job;
    }

    private static ReloadSchemaJob getReloadJob(String id) throws SQLException
    {
        PipelineJob job = PipelineJobService.get().getJobStore().getJob(id);
        if (job == null || !(job instanceof ReloadSchemaJob))
            return null;

        return (ReloadSchemaJob)job;
    }

    @RequiresPermissionClass(AdminPermission.class)
    public class ReloadSchemaAction extends ApiAction
    {
        @Override
        public ApiResponse execute(Object o, BindException errors) throws Exception
        {
            ReloadSchemaJob job = submitReloadJob(getContainer(), getUser());
            Map<String, Object> response = new HashMap<String, Object>();
            response.put("id", job.getJobGUID());
            response.put("status", job.getCurrentInfo());
            return new ApiSimpleResponse(response);
        }
    }

    public static class IdForm
    {
        private String id;
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
    }

    @RequiresPermissionClass(AdminPermission.class)
    public class ReloadStatusAction extends ApiAction<IdForm>
    {
        @Override
        public ApiResponse execute(IdForm form, BindException errors) throws Exception
        {
            ReloadSchemaJob job = getReloadJob(form.getId());
            return new ApiSimpleResponse("status", job.getCurrentInfo());
        }
    }

    private static void runSqlScript(String scriptName)
    {
        EHRModule module = (EHRModule) ModuleLoader.getInstance().getModule(EHRModule.class);
        String contents = null;
        try
        {
            InputStream is = module.getResourceStream("/META-INF/ehr/" + scriptName);
            contents = IOUtils.toString(is);
        }
        catch (IOException e)
        {
            throw new RuntimeException(e);
        }

        ModuleContext moduleContext = ModuleLoader.getInstance().getModuleContext(module);
        DbSchema schema = EHRSchema.getInstance().getSchema();
        SqlDialect dialect = EHRSchema.getInstance().getSqlDialect();
        try
        {
            dialect.checkSqlScript(contents, module.getVersion());
            dialect.runSql(schema, contents, null, moduleContext);
        }
        catch (SQLException e)
        {
            throw new RuntimeSQLException(e);
        }
    }

    private static class ReloadSchemaJob extends PipelineJob
    {
        String currentInfo = null;

        public ReloadSchemaJob(PipelineJob job) throws IOException
        {
            super(job);
            initStatusFile();
        }

        public ReloadSchemaJob(ViewBackgroundInfo info) throws IOException
        {
            super(null, info);
            initStatusFile();
        }

        private void initStatusFile() throws IOException
        {
            PipeRoot root = PipelineService.get().findPipelineRoot(getContainer());
            if (root == null)
                throw new IllegalStateException("Pipeline root required");
            File logFile = File.createTempFile("EHR-" + ReloadSchemaJob.class.getSimpleName() + "-", ".log", root.getRootPath());
            logFile.createNewFile();
            setLogFile(logFile);
        }

        @Override
        public ActionURL getStatusHref()
        {
            return null;
        }

        @Override
        public String getDescription()
        {
            return "Reload Schema";
        }

        @Override
        public void info(String message)
        {
            currentInfo = message;
            super.info(message);
        }

        @Override
        public boolean setStatus(String status, String info)
        {
            info(info != null ? info : status);
            return super.setStatus(status, info);
        }

        @Override
        public void run()
        {
            setStatus("Create Schema", "Creating EHR Schema");
            runSqlScript("ehr.sql");

            if (checkInterrupted())
                setStatus(INTERRUPTED_STATUS, "Reload Schema Interrupted");
            else
                setStatus(COMPLETE_STATUS, "Reload Schema Complete");
        }

        public String getCurrentInfo()
        {
            return currentInfo + " " + toString();
        }
    }


}