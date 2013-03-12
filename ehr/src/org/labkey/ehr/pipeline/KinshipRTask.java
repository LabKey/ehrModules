/*
 * Copyright (c) 2012-2013 LabKey Corporation
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

import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Table;
import org.labkey.api.data.TableInfo;
import org.labkey.api.exp.api.ExperimentService;
import org.labkey.api.gwt.client.util.StringUtils;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.pipeline.AbstractTaskFactory;
import org.labkey.api.pipeline.AbstractTaskFactorySettings;
import org.labkey.api.pipeline.PipelineJob;
import org.labkey.api.pipeline.PipelineJobException;
import org.labkey.api.pipeline.PipelineJobService;
import org.labkey.api.pipeline.RecordedAction;
import org.labkey.api.pipeline.RecordedActionSet;
import org.labkey.api.pipeline.WorkDirectoryTask;
import org.labkey.api.pipeline.file.FileAnalysisJobSupport;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.reports.ExternalScriptEngine;
import org.labkey.api.resource.FileResource;
import org.labkey.api.resource.MergedDirectoryResource;
import org.labkey.api.script.ScriptService;
import org.labkey.api.settings.AppProps;
import org.labkey.api.util.FileType;
import org.labkey.api.util.Path;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by IntelliJ IDEA.
 * User: bbimber
 * Date: 8/3/12
 * Time: 4:37 PM
 */
public class KinshipRTask extends WorkDirectoryTask<KinshipRTask.Factory>
{
    protected KinshipRTask(Factory factory, PipelineJob job)
    {
        super(factory, job);
    }

    public static class Factory extends AbstractTaskFactory<AbstractTaskFactorySettings, KinshipRTask.Factory>
    {
        public Factory()
        {
            super(KinshipRTask.class);
            setJoin(true);
        }

        public List<FileType> getInputTypes()
        {
            return Collections.singletonList(new FileType(".r"));
        }

        public String getStatusName()
        {
            return "RUNNING";
        }

        public List<String> getProtocolActionNames()
        {
            return Arrays.asList("Calculating Kinship");
        }

        public PipelineJob.Task createTask(PipelineJob job)
        {
            KinshipRTask task = new KinshipRTask(this, job);
            setJoin(false);

            return task;
        }

        public boolean isJobComplete(PipelineJob job)
        {
            return false;
        }
    }

    public RecordedActionSet run() throws PipelineJobException
    {
        PipelineJob job = getJob();
        FileAnalysisJobSupport support = (FileAnalysisJobSupport) job;
        RecordedAction action = new RecordedAction();

        job.getLogger().info("Preparing to run R script");

        String exePath = getExePath("Rscript", "R");

        String scriptPath = getKinshipScriptPath();
        File tsvFile = new File(support.getAnalysisDirectory(), KinshipImportTask.PEDIGREE_FILE);
        if (!tsvFile.exists())
            throw new PipelineJobException("Unable to find TSV file at location: " + tsvFile.getPath());

        List<String> args = new ArrayList<String>();
        args.add(exePath);
        args.add("--vanilla");
        args.add(scriptPath);
        args.add("-f");
        args.add(tsvFile.getPath());

        ProcessBuilder pb = new ProcessBuilder(args);
        job.runSubProcess(pb, support.getAnalysisDirectory());

        File output = new File(support.getAnalysisDirectory(), KinshipImportTask.KINSHIP_FILE);
        if (!output.exists())
            throw new PipelineJobException("Unable to find file: " + output.getPath());

        action.addOutput(output, "Kinship Output", false);
        return new RecordedActionSet(Collections.singleton(action));
    }

    private String getExePath(String exePath, String packageName)
    {
        String packagePath = PipelineJobService.get().getConfigProperties().getSoftwarePackagePath(packageName);
        if (packagePath != null && packagePath.length() > 0)
        {
            exePath = (new File(packagePath, exePath)).getPath();
        }
        return exePath;
    }

    private String getKinshipScriptPath() throws PipelineJobException
    {
        String packagePath = PipelineJobService.get().getConfigProperties().getSoftwarePackagePath("EHRKinship");
        if (StringUtils.isEmpty(packagePath))
            throw new PipelineJobException("EHRKinship path not specified in the pipeline config file");

        File script = new File(packagePath, "populateKinship.r");
        if (!script.exists())
            throw new PipelineJobException("Unable to find file: " + script.getPath());

        return script.getPath();
    }

}
