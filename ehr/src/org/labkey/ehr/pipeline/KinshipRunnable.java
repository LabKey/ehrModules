package org.labkey.ehr.pipeline;

import org.labkey.api.data.Container;
import org.labkey.api.pipeline.PipeRoot;
import org.labkey.api.pipeline.PipelineJobService;
import org.labkey.api.pipeline.PipelineService;
import org.labkey.api.pipeline.PipelineValidationException;
import org.labkey.api.pipeline.TaskId;
import org.labkey.api.pipeline.TaskPipeline;
import org.labkey.api.pipeline.file.AbstractFileAnalysisJob;
import org.labkey.api.pipeline.file.AbstractFileAnalysisProtocol;
import org.labkey.api.pipeline.file.AbstractFileAnalysisProtocolFactory;
import org.labkey.api.pipeline.file.AbstractFileAnalysisProvider;
import org.labkey.api.pipeline.file.FileAnalysisTaskPipeline;
import org.labkey.api.security.User;
import org.labkey.api.util.ConfigurationException;
import org.labkey.api.view.ActionURL;
import org.labkey.api.view.ViewBackgroundInfo;
import org.labkey.ehr.EHRManager;

import java.io.File;
import java.io.IOException;
import java.util.Collections;

/**
 * Created by IntelliJ IDEA.
 * User: bbimber
 * Date: 8/26/12
 * Time: 4:32 PM
 */
public class KinshipRunnable implements Runnable
{
    private final String KINSHIP_PIPELINE_NAME = "kinshipPipeline";

    public void run()
    {
        User u = EHRManager.get().getEHRUser();
        Container c = EHRManager.get().getPrimaryEHRContainer();
        if (u != null && c != null)
        {
            startKinshipCalculation(u, c);
        }
    }

    private void startKinshipCalculation(User u, Container c)
    {
        try
        {
            String taskIdString =  FileAnalysisTaskPipeline.class.getName() + ":" + KINSHIP_PIPELINE_NAME;
            TaskId taskId = new TaskId(taskIdString);
            TaskPipeline taskPipeline = PipelineJobService.get().getTaskPipeline(taskId);

            AbstractFileAnalysisProvider provider = (AbstractFileAnalysisProvider) PipelineService.get().getPipelineProvider("File Analysis");
            AbstractFileAnalysisProtocolFactory factory = provider.getProtocolFactory(taskPipeline);
            ViewBackgroundInfo bg = new ViewBackgroundInfo(c, u, new ActionURL());
            PipeRoot root = PipelineService.get().getPipelineRootSetting(c);
            String protocolName = "EHR Kinship Calculation";
            File dirData = root.getRootPath();

            AbstractFileAnalysisProtocol protocol = factory.createProtocolInstance(protocolName, "", "");
            if (protocol == null)
            {
                return;
            }

            File fileParameters = protocol.getParametersFile(dirData, root);
            if (!fileParameters.exists())
            {
                fileParameters.getParentFile().mkdirs();
                fileParameters.createNewFile();
            }
            protocol.saveInstance(fileParameters, c);

            File inputFile = new File(dirData, "kinship.txt");

            AbstractFileAnalysisJob job = protocol.createPipelineJob(bg, root, Collections.singletonList(inputFile), fileParameters);
            PipelineService.get().queueJob(job);

        }
        catch (ClassNotFoundException e)
        {
            throw new ConfigurationException("The EHR kinship pipeline has not been configured", e);
        }
        catch (IOException e)
        {
            throw new RuntimeException(e);
        }
        catch (PipelineValidationException e)
        {
            throw new RuntimeException(e);
        }
    }
}
