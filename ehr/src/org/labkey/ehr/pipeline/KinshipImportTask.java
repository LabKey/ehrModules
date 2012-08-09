package org.labkey.ehr.pipeline;

import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Table;
import org.labkey.api.data.TableInfo;
import org.labkey.api.exp.api.ExperimentService;
import org.labkey.api.pipeline.AbstractTaskFactory;
import org.labkey.api.pipeline.AbstractTaskFactorySettings;
import org.labkey.api.pipeline.PipelineJob;
import org.labkey.api.pipeline.PipelineJobException;
import org.labkey.api.pipeline.RecordedAction;
import org.labkey.api.pipeline.RecordedActionSet;
import org.labkey.api.pipeline.file.FileAnalysisJobSupport;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.settings.AppProps;
import org.labkey.api.util.FileType;
import org.labkey.api.view.StaticContentCachingFilter;

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
 * Date: 8/6/12
 * Time: 12:57 PM
 */
public class KinshipImportTask extends PipelineJob.Task<KinshipImportTask.Factory>
{
    public static final String PEDIGREE_FILE = "pedigree.txt";
    public static final String KINSHIP_FILE = "kinship.txt";

    protected KinshipImportTask(Factory factory, PipelineJob job)
    {
        super(factory, job);
    }  
            
    public static class Factory extends AbstractTaskFactory<AbstractTaskFactorySettings, KinshipImportTask.Factory>
    {
        public Factory()
        {
            super(KinshipImportTask.class);
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
            KinshipImportTask task = new KinshipImportTask(this, job);
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

        File output = new File(support.getAnalysisDirectory(), KINSHIP_FILE);
        if (!output.exists())
            throw new PipelineJobException("Unable to find file: " + output.getPath());

        DbSchema ehrSchema = QueryService.get().getUserSchema(job.getUser(), job.getContainer(), "ehr").getDbSchema();
        TableInfo kinshipTable = ehrSchema.getTable("kinship");

        ExperimentService.get().ensureTransaction();
        try
        {
            //delete all previous records
            Table.delete(kinshipTable, new SimpleFilter(FieldKey.fromString("rowid"), 0, CompareType.GTE));

            FileReader fr = new FileReader(output);
            BufferedReader reader = new BufferedReader(fr);

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
            ExperimentService.get().closeTransaction();
        }

        return new RecordedActionSet(actions);
    }
}
