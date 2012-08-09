package org.labkey.ehr.pipeline;

import au.com.bytecode.opencsv.CSVWriter;
import org.labkey.api.action.NullSafeBindException;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.Results;
import org.labkey.api.data.RuntimeSQLException;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TSVWriter;
import org.labkey.api.data.Table;
import org.labkey.api.data.TableInfo;
import org.labkey.api.gwt.client.util.StringUtils;
import org.labkey.api.pipeline.AbstractTaskFactory;
import org.labkey.api.pipeline.AbstractTaskFactorySettings;
import org.labkey.api.pipeline.PipelineJob;
import org.labkey.api.pipeline.PipelineJobException;
import org.labkey.api.pipeline.RecordedAction;
import org.labkey.api.pipeline.RecordedActionSet;
import org.labkey.api.pipeline.file.FileAnalysisJobSupport;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QuerySettings;
import org.labkey.api.query.QueryView;
import org.labkey.api.query.UserSchema;
import org.labkey.api.settings.AppProps;
import org.labkey.api.util.FileType;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.util.ResultSetUtil;
import org.labkey.ehr.EHRSchema;
import org.springframework.beans.MutablePropertyValues;
import org.springframework.validation.BindException;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: bbimber
 * Date: 8/6/12
 * Time: 12:57 PM
 */
public class KinshipInitTask extends PipelineJob.Task<KinshipInitTask.Factory>
{
    protected KinshipInitTask(Factory factory, PipelineJob job)
    {
        super(factory, job);
    }

    public static class Factory extends AbstractTaskFactory<AbstractTaskFactorySettings, KinshipInitTask.Factory>
    {
        public Factory()
        {
            super(KinshipInitTask.class);
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
            KinshipInitTask task = new KinshipInitTask(this, job);
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

        job.getLogger().info("Creating TSV with pedigree data");
        ResultSet rs = null;
        try
        {
            UserSchema us = QueryService.get().getUserSchema(job.getUser(), job.getContainer(), "study");
            TableInfo pedTable = us.getTable("Pedigree");
            rs = Table.select(pedTable, new HashSet<String>(PageFlowUtil.set("Id", "Dam", "Sire", "Gender")), null, null);

            File outputFile = new File(support.getAnalysisDirectory(), KinshipImportTask.PEDIGREE_FILE);
            CSVWriter writer = new CSVWriter(new OutputStreamWriter(new FileOutputStream(outputFile)), '\t', CSVWriter.NO_QUOTE_CHARACTER);

            while (rs.next())
            {
                String[] row = new String[]{rs.getString("Id"), rs.getString("Dam"), rs.getString("Sire"), rs.getString("Gender")};
                for (int i=0;i<row.length;i++)
                {
                    //R wont accept empty strings in the input, so we need to replace them with NA
                    if (StringUtils.isEmpty(row[i]))
                        row[i] = "NA";
                }
                writer.writeNext(row);
            }
            writer.close();

            action.addOutput(outputFile, "Pedigree TSV", false);
        }
        catch (SQLException e)
        {
            throw new RuntimeSQLException(e);
        }
        catch (IOException e)
        {
            throw new RuntimeException(e);
        }
        finally {
            ResultSetUtil.close(rs);
        }

        return new RecordedActionSet(Collections.singleton(action));
    }
}
