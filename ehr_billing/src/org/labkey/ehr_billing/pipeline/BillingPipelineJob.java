package org.labkey.ehr_billing.pipeline;

import org.apache.commons.lang3.time.DateUtils;
import org.labkey.api.data.Container;
import org.labkey.api.ehr_billing.pipeline.BillingPipelineJobSupport;
import org.labkey.api.files.FileUrls;
import org.labkey.api.pipeline.PipeRoot;
import org.labkey.api.pipeline.PipelineJob;
import org.labkey.api.pipeline.PipelineJobService;
import org.labkey.api.pipeline.PipelineValidationException;
import org.labkey.api.pipeline.TaskId;
import org.labkey.api.pipeline.TaskPipeline;
import org.labkey.api.security.User;
import org.labkey.api.util.FileUtil;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.view.ActionURL;
import org.labkey.api.view.ViewBackgroundInfo;
import org.labkey.ehr_billing.EHR_BillingController;
import java.io.File;
import java.util.Calendar;
import java.util.Date;

public class BillingPipelineJob extends PipelineJob implements BillingPipelineJobSupport
{
    private File _analysisDir;
    private EHR_BillingController.BillingPipelineForm _form;

    public BillingPipelineJob(Container c, User user, ActionURL url, PipeRoot pipeRoot, File analysisDir, EHR_BillingController.BillingPipelineForm form)
    {
        super(null, new ViewBackgroundInfo(c, user, url), pipeRoot);

        _analysisDir = analysisDir;
        setLogFile(new File(analysisDir, FileUtil.makeFileNameWithTimestamp("billingPipeline", "log")));
        _form = form;
    }

    public static File createAnalysisDir(PipeRoot pipeRoot, String name) throws PipelineValidationException
    {
        String trialName = FileUtil.makeLegalName(name);
        File analysisDir = new File(pipeRoot.getRootPath(), trialName);
        int suffix = 0;
        while (analysisDir.exists())
        {
            suffix++;
            trialName = FileUtil.makeLegalName(name) + "." + suffix;
            analysisDir = new File(pipeRoot.getRootPath(), trialName);
        }

        analysisDir.mkdirs();

        return analysisDir;
    }

    @Override
    public String getDescription()
    {
        return "Billing Run";
    }

    @Override
    public ActionURL getStatusHref()
    {
        return PageFlowUtil.urlProvider(FileUrls.class).urlBegin(getContainer());
    }

    @Override
    public TaskPipeline getTaskPipeline()
    {
        return PipelineJobService.get().getTaskPipeline(new TaskId(BillingPipelineJob.class));
    }

    public Date getStartDate()
    {
        Date ret = _form.getStartDate() == null ? null : DateUtils.truncate(_form.getStartDate(), Calendar.DATE);
        return ret;
    }

    public Date getEndDate()
    {
        Date ret = _form.getEndDate() == null ? null : DateUtils.truncate(_form.getEndDate(), Calendar.DATE);
        return ret;
    }

    public String getComment()
    {
        return _form.getComment();
    }

    public String getName()
    {
        return _form.getProtocolName();
    }

    public File getAnalysisDir()
    {
        return _analysisDir;
    }
}