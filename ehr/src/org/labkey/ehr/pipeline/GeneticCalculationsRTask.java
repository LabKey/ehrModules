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
import org.labkey.api.resource.FileResource;
import org.labkey.api.resource.Resource;
import org.labkey.api.util.FileType;
import org.labkey.ehr.EHRModule;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * User: bbimber
 * Date: 8/3/12
 * Time: 4:37 PM
 */
public class GeneticCalculationsRTask extends WorkDirectoryTask<GeneticCalculationsRTask.Factory>
{
    protected GeneticCalculationsRTask(Factory factory, PipelineJob job)
    {
        super(factory, job);
    }

    public static class Factory extends AbstractTaskFactory<AbstractTaskFactorySettings, GeneticCalculationsRTask.Factory>
    {
        public Factory()
        {
            super(GeneticCalculationsRTask.class);
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
            GeneticCalculationsRTask task = new GeneticCalculationsRTask(this, job);
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
        List<RecordedAction> actions = new ArrayList<>();

        actions.add(runScript("populateInbreeding.r", GeneticCalculationsImportTask.INBREEDING_FILE, "Inbreeding Coefficient Output"));
        actions.add(runScript("populateKinship.r", GeneticCalculationsImportTask.KINSHIP_FILE, "Kinship Output"));

        return new RecordedActionSet(actions);
    }

    public RecordedAction runScript(String scriptName, String outputFileName, String actionLabel) throws PipelineJobException
    {
        PipelineJob job = getJob();
        FileAnalysisJobSupport support = (FileAnalysisJobSupport) job;
        RecordedAction action = new RecordedAction();

        job.getLogger().info("Preparing to run R script");

        String exePath = getExePath("Rscript", "R");

        String scriptPath = getScriptPath(scriptName);
        File tsvFile = new File(support.getAnalysisDirectory(), GeneticCalculationsImportTask.PEDIGREE_FILE);
        if (!tsvFile.exists())
            throw new PipelineJobException("Unable to find TSV file at location: " + tsvFile.getPath());

        List<String> args = new ArrayList<>();
        args.add(exePath);
        args.add("--vanilla");
        args.add(scriptPath);
        args.add("-f");
        args.add(tsvFile.getPath());

        getJob().getLogger().info("Using working directory of: " + support.getAnalysisDirectory().getPath());
        ProcessBuilder pb = new ProcessBuilder(args);
        job.runSubProcess(pb, support.getAnalysisDirectory());

        File output = new File(support.getAnalysisDirectory(), outputFileName);
        if (!output.exists())
            throw new PipelineJobException("Unable to find file: " + output.getPath());

        action.addOutput(output, actionLabel, false);

        return action;
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

    private String getScriptPath(String name) throws PipelineJobException
    {
        Module module = ModuleLoader.getInstance().getModule(EHRModule.class);
        Resource script = module.getModuleResource("/pipeline/kinship/" + name);
        if (!script.exists())
            throw new PipelineJobException("Unable to find file: " + script.getPath());

        File f = ((FileResource) script).getFile();
        if (!f.exists())
            throw new PipelineJobException("Unable to find file: " + f.getPath());

        return f.getPath();
    }
}
