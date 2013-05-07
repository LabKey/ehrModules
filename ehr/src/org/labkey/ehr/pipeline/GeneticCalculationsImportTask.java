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

import org.labkey.api.data.CompareType;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Table;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.exp.api.ExperimentService;
import org.labkey.api.exp.property.Domain;
import org.labkey.api.pipeline.AbstractTaskFactory;
import org.labkey.api.pipeline.AbstractTaskFactorySettings;
import org.labkey.api.pipeline.PipelineJob;
import org.labkey.api.pipeline.PipelineJobException;
import org.labkey.api.pipeline.RecordedAction;
import org.labkey.api.pipeline.RecordedActionSet;
import org.labkey.api.pipeline.file.FileAnalysisJobSupport;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DuplicateKeyException;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.FilteredTable;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.query.UserSchema;
import org.labkey.api.study.DataSetTable;
import org.labkey.api.util.FileType;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.LineNumberReader;
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
 * Date: 8/6/12
 * Time: 12:57 PM
 */
public class GeneticCalculationsImportTask extends PipelineJob.Task<GeneticCalculationsImportTask.Factory>
{
    public static final String PEDIGREE_FILE = "pedigree.txt";
    public static final String KINSHIP_FILE = "kinship.txt";
    public static final String INBREEDING_FILE = "inbreeding.txt";

    protected GeneticCalculationsImportTask(Factory factory, PipelineJob job)
    {
        super(factory, job);
    }  
            
    public static class Factory extends AbstractTaskFactory<AbstractTaskFactorySettings, GeneticCalculationsImportTask.Factory>
    {
        public Factory()
        {
            super(GeneticCalculationsImportTask.class);
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
            return Arrays.asList("Calculating Genetics Values");
        }

        public PipelineJob.Task createTask(PipelineJob job)
        {
            GeneticCalculationsImportTask task = new GeneticCalculationsImportTask(this, job);
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
        List<RecordedAction> actions = new ArrayList<RecordedAction>();

        processKinship();
        processInbreeding();

        return new RecordedActionSet(actions);
    }

    private void processKinship() throws PipelineJobException
    {
        PipelineJob job = getJob();
        FileAnalysisJobSupport support = (FileAnalysisJobSupport) job;

        File output = new File(support.getAnalysisDirectory(), KINSHIP_FILE);
        if (!output.exists())
            throw new PipelineJobException("Unable to find file: " + output.getPath());

        DbSchema ehrSchema = QueryService.get().getUserSchema(job.getUser(), job.getContainer(), "ehr").getDbSchema();
        TableInfo kinshipTable = ehrSchema.getTable("kinship");

        LineNumberReader lnr = null;
        BufferedReader reader = null;

        ExperimentService.get().ensureTransaction();
        try
        {
            getJob().getLogger().info("Inspecting file length: " + output.getPath());
            lnr = new LineNumberReader(new BufferedReader(new FileReader(output)));
            while (lnr.readLine() != null) {
                if (lnr.getLineNumber() > 3)
                    break;
            }
            int lineNumber = lnr.getLineNumber();
            lnr.close();

            if (lineNumber < 3)
                throw new PipelineJobException("Too few lines found in output.  Line count was: " + lineNumber);

            //delete all previous records
            getJob().getLogger().info("Deleting existing rows");
            Table.delete(kinshipTable, new SimpleFilter(FieldKey.fromString("rowid"), 0, CompareType.GTE));

            ExperimentService.get().commitTransaction();
            ExperimentService.get().ensureTransaction();

            reader = new BufferedReader(new FileReader(output));

            getJob().getLogger().info("Inserting rows");
            String line = null;
            int lineNum = 0;
            while ((line = reader.readLine()) != null){
                String[] fields = line.split("\t");
                if (fields.length < 3)
                    continue;
                if ("coefficient".equalsIgnoreCase(fields[2]))
                    continue; //skip header

                Map row = new HashMap<String, Object>();
                row.put("Id", fields[0]);
                row.put("Id2", fields[1]);
                row.put("coefficient", Double.parseDouble(fields[2]));

                row.put("container", job.getContainer().getId());
                row.put("created", new Date());
                row.put("createdby", job.getUser().getUserId());
                Table.insert(job.getUser(), kinshipTable, row);
                lineNum++;
            }

            ExperimentService.get().commitTransaction();
            job.getLogger().info("Inserted " + lineNum + " rows into ehr.kinship");

        }
        catch (FileNotFoundException e)
        {
            throw new PipelineJobException(e);
        }
        catch (IOException e)
        {
            throw new PipelineJobException(e);
        }
        catch (SQLException e)
        {
            throw new PipelineJobException(e);
        }
        finally
        {
            if (lnr != null)
                try{lnr.close();}catch (Exception ignored){}

            if (reader != null)
                try{reader.close();}catch (Exception ignored){}

            ExperimentService.get().closeTransaction();
        }
    }

    private void processInbreeding() throws PipelineJobException
    {
        PipelineJob job = getJob();
        FileAnalysisJobSupport support = (FileAnalysisJobSupport) job;

        File output = new File(support.getAnalysisDirectory(), INBREEDING_FILE);
        if (!output.exists())
            throw new PipelineJobException("Unable to find file: " + output.getPath());

        UserSchema us = QueryService.get().getUserSchema(job.getUser(), job.getContainer(), "study");
        TableInfo ti = us.getTable("Inbreeding Coefficients");
        if (ti == null)
        {
            getJob().getLogger().warn("Unable to find table study.inbreeding coefficients");
            return;
        }

        QueryUpdateService qus = ti.getUpdateService();
        qus.setBulkLoad(true);

        LineNumberReader lnr = null;
        BufferedReader reader = null;

        ExperimentService.get().ensureTransaction();
        try
        {
            getJob().getLogger().info("Inspecting file length: " + output.getPath());
            lnr = new LineNumberReader(new BufferedReader(new FileReader(output)));
            while (lnr.readLine() != null) {
                if (lnr.getLineNumber() > 3)
                    break;
            }
            int lineNumber = lnr.getLineNumber();
            lnr.close();

            if (lineNumber < 3)
                throw new PipelineJobException("Too few lines found in inbreeding output.  Line count was: " + lineNumber);

            //delete all previous records
            getJob().getLogger().info("Deleting existing rows");
            TableSelector ts = new TableSelector(ti, Collections.singleton(ti.getColumn(FieldKey.fromString("lsid"))), null, null);
            List<Map<String, Object>> toDelete = new ArrayList<Map<String, Object>>();
            toDelete.addAll(Arrays.asList((Map<String, Object>[])ts.getArray(Map.class)));
            qus.deleteRows(getJob().getUser(), getJob().getContainer(), toDelete, new HashMap<String, Object>());

            reader = new BufferedReader(new FileReader(output));

            String line = null;
            int lineNum = 0;
            List<Map<String, Object>> rows = new ArrayList<Map<String, Object>>();
            Date date = new Date();

            getJob().getLogger().info("Reading file");
            while ((line = reader.readLine()) != null){
                String[] fields = line.split("\t");
                if (fields.length < 2)
                    continue;
                if ("coefficient".equalsIgnoreCase(fields[1]))
                    continue; //skip header

                Map row = new HashMap<String, Object>();
                row.put("Id", fields[0]);
                row.put("date", date);
                row.put("coefficient", Double.parseDouble(fields[1]));

                rows.add(row);
                lineNum++;
            }

            getJob().getLogger().info("Inserting rows");
            BatchValidationException errors = new BatchValidationException();
            qus.insertRows(getJob().getUser(), getJob().getContainer(), rows, errors, new HashMap<String, Object>());

            if (errors.hasErrors())
                throw errors;

            ExperimentService.get().commitTransaction();
            job.getLogger().info("Inserted " + lineNum + " rows into inbreeding coefficients table");

        }
        catch (FileNotFoundException e)
        {
            throw new PipelineJobException(e);
        }
        catch (IOException e)
        {
            throw new PipelineJobException(e);
        }
        catch (SQLException e)
        {
            throw new PipelineJobException(e);
        }
        catch (DuplicateKeyException e)
        {
            throw new PipelineJobException(e);
        }
        catch (InvalidKeyException e)
        {
            throw new PipelineJobException(e);
        }
        catch (BatchValidationException e)
        {
            throw new PipelineJobException(e);
        }
        catch (QueryUpdateServiceException e)
        {
            throw new PipelineJobException(e);
        }
        finally
        {
            if (lnr != null)
                try{lnr.close();}catch (Exception ignored){}

            if (reader != null)
                try{reader.close();}catch (Exception ignored){}

            ExperimentService.get().closeTransaction();
        }
    }
}
