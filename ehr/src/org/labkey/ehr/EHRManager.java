/*
 * Copyright (c) 2009-2012 LabKey Corporation
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

import org.labkey.api.data.Container;
import org.labkey.api.pipeline.PipeRoot;
import org.labkey.api.pipeline.PipelineJobService;
import org.labkey.api.pipeline.PipelineRootContainerTree;
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
import org.labkey.api.view.ViewContext;
import org.labkey.ehr.pipeline.KinshipImportTask;
import org.labkey.ehr.pipeline.KinshipRTask;

import javax.management.RuntimeMBeanException;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class EHRManager
{
    private static final EHRManager _instance = new EHRManager();
    public static final String EHRStudyContainerPropName = "EHRStudyContainer";
    public static final String KINSHIP_PIPELINE_NAME = "kinshipPipeline";

    private EHRManager()
    {
        // prevent external construction with a private default constructor
    }

    public static EHRManager get()
    {
        return _instance;
    }

    public static void startKinshipCalculation(User u, Container c) throws PipelineValidationException
    {
        try
        {
            String taskIdString =  FileAnalysisTaskPipeline.class.getName() + ":" + KINSHIP_PIPELINE_NAME;
            TaskId taskId = new TaskId(taskIdString);
            TaskPipeline taskPipeline = PipelineJobService.get().getTaskPipeline(taskId);

            AbstractFileAnalysisProvider provider = (AbstractFileAnalysisProvider)PipelineService.get().getPipelineProvider("EHR");
            AbstractFileAnalysisProtocolFactory factory = provider.getProtocolFactory(taskPipeline);
            ViewBackgroundInfo bg = new ViewBackgroundInfo(c, u, new ActionURL());
            PipeRoot root = PipelineService.get().getPipelineRootSetting(c);
            String protocolName = "EHR Kinship Calculation";
            File dirData = root.getRootPath();

            AbstractFileAnalysisProtocol protocol = factory.load(root, protocolName);
            if (protocol == null)
            {

            }
            File fileParameters = protocol.getParametersFile(dirData, root);
            AbstractFileAnalysisJob job = protocol.createPipelineJob(bg, root, new ArrayList<File>(), fileParameters);
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
    }
}