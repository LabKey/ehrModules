/*
 * Copyright (c) 2012 LabKey Corporation
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
package org.labkey.ehr.pipeline;

import org.apache.log4j.Logger;
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
import java.io.FileWriter;
import java.io.IOException;
import java.util.Collections;

/**
 * Created by IntelliJ IDEA.
 * User: bbimber
 * Date: 8/26/12
 * Time: 4:32 PM
 */
public class KinshipRunnable
{
    private final String KINSHIP_PIPELINE_NAME = "kinshipPipeline";
    private final Logger _log = Logger.getLogger(KinshipRunnable.class);

    public boolean run(Container c)
    {
        User u = EHRManager.get().getEHRUser();
        if (u == null)
        {
            _log.error("Unable to start EHR kinship calculation, because EHR use is null");
            return false;
        }

        startKinshipCalculation(u, c);
        return true;
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
            String xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
                "<bioml>\n" +
                "</bioml>";

            AbstractFileAnalysisProtocol protocol = factory.createProtocolInstance(protocolName, "", xml);
            if (protocol == null)
            {
                return;
            }

            File fileParameters = protocol.getParametersFile(root.getRootPath(), root);
            if (!fileParameters.exists())
            {
                fileParameters.getParentFile().mkdirs();
                fileParameters.createNewFile();
            }
            protocol.saveInstance(fileParameters, c);

            File defaultXml = new File(root.getRootPath(), ".labkey/protocols/kinship/default.xml");
            if (!defaultXml.exists())
            {
                defaultXml.getParentFile().mkdirs();
                defaultXml.createNewFile();
                FileWriter w = null;
                try
                {
                    w = new FileWriter(defaultXml);
                    w.write(xml);
                }
                finally
                {
                    w.close();
                }
            }

            File inputFile = new File(root.getRootPath(), "kinship.txt");
            if (!inputFile.exists())
                inputFile.createNewFile();

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
