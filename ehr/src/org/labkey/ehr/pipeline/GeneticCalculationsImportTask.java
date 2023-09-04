/*
 * Copyright (c) 2013-2019 LabKey Corporation
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

import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.Logger;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.Results;
import org.labkey.api.data.RuntimeSQLException;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.SqlExecutor;
import org.labkey.api.data.SqlSelector;
import org.labkey.api.data.Table;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.exp.api.ExperimentService;
import org.labkey.api.exp.api.StorageProvisioner;
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
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.query.UserSchema;
import org.labkey.api.query.ValidationException;
import org.labkey.api.reader.Readers;
import org.labkey.api.security.User;
import org.labkey.api.util.FileType;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.ehr.EHRSchema;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.LineNumberReader;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

/**
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
        
        @Override
        public List<FileType> getInputTypes()
        {
            return Collections.singletonList(new FileType(".r"));
        }

        @Override
        public String getStatusName()
        {
            return PipelineJob.TaskStatus.running.toString();
        }

        @Override
        public List<String> getProtocolActionNames()
        {
            return Arrays.asList("Calculating Genetics Values");
        }

        @Override
        public PipelineJob.Task<?> createTask(PipelineJob job)
        {
            GeneticCalculationsImportTask task = new GeneticCalculationsImportTask(this, job);
            setJoin(false);

            return task;
        }

        @Override
        public boolean isJobComplete(PipelineJob job)
        {
            return false;
        }
    }

    @Override
    @NotNull
    public RecordedActionSet run() throws PipelineJobException
    {
        List<RecordedAction> actions = new ArrayList<>();

        String paramVal = getJob().getParameters().get("allowRunningDuringDay");
        int hourOfDay = Calendar.getInstance().get(Calendar.HOUR_OF_DAY);
        if (!"true".equals(paramVal) && hourOfDay >= 7 && hourOfDay <= 19)
        {
            throw new PipelineJobException("The genetics import task should only run outside of business hours.  Either wait for the next scheduled job or retry this task before 7AM or after 6PM.  You can also run this manually from the EHR admin page.");
        }
        else
        {
            PipelineJob job = getJob();
            FileAnalysisJobSupport support = (FileAnalysisJobSupport) job;

            processInbreeding(job.getContainer(), job.getUser(), support.getAnalysisDirectoryPath().toFile(), job.getLogger());
            processKinship(job.getContainer(), job.getUser(), support.getAnalysisDirectoryPath().toFile(), job.getLogger());

            if (GeneticCalculationsJob.isKinshipValidation())
                validateKinship();
        }

        return new RecordedActionSet(actions);
    }

    public static void standaloneProcessKinshipAndInbreeding(Container c, User u, File pipelineDir, Logger log) throws PipelineJobException
    {
        processInbreeding(c, u, pipelineDir, log);
        processKinship(c, u, pipelineDir, log);
    }

    private static void processKinship(Container c, User u, File pipelineDir, Logger log) throws PipelineJobException
    {
        File output = new File(pipelineDir, KINSHIP_FILE);
        if (!output.exists())
            throw new PipelineJobException("Unable to find file: " + output.getPath());

        DbSchema ehrSchema = EHRSchema.getInstance().getSchema();
        TableInfo kinshipTable = ehrSchema.getTable("kinship");

        log.info("Inspecting file length: " + output.getPath());

        try
        {
            try (DbScope.Transaction transaction = ExperimentService.get().ensureTransaction();
                 LineNumberReader lnr = new LineNumberReader(Readers.getReader(output)))
            {
                while (lnr.readLine() != null)
                {
                    if (lnr.getLineNumber() > 3)
                        break;
                }
                int lineNumber = lnr.getLineNumber();
                if (lineNumber < 3)
                {
                    throw new PipelineJobException("Too few lines found in output.  Line count was: " + lineNumber);
                }

                //delete all previous records
                log.info("Deleting existing rows");
                Table.delete(kinshipTable, new SimpleFilter(FieldKey.fromString("container"), c.getId(), CompareType.EQUAL));

                //NOTE: this process creates and deletes a ton of rows each day.  the rowId can balloon very quickly, so we reset it here
                SqlSelector ss = new SqlSelector(kinshipTable.getSchema(), new SQLFragment("SELECT max(rowid) as expt FROM " + kinshipTable.getSelectName()));
                List<Long> ret = ss.getArrayList(Long.class);
                int maxVal;
                if (ret.isEmpty())
                {
                    maxVal = 0;
                }
                else
                {
                    maxVal = ret.get(0) == null ? 0 : ret.get(0).intValue();
                }

                SqlExecutor ex = new SqlExecutor(kinshipTable.getSchema());
                if (kinshipTable.getSqlDialect().isSqlServer())
                {
                    ex.execute(new SQLFragment("DBCC CHECKIDENT ('" + kinshipTable.getSelectName() + "', RESEED, " + maxVal + ")"));
                }
                else if (kinshipTable.getSqlDialect().isPostgreSQL())
                {
                    //find sequence name.  this was autocreated by the serial
                    String seqName = "kinship_rowid_seq";
                    SqlSelector series = new SqlSelector(kinshipTable.getSchema(), new SQLFragment("SELECT relname FROM pg_class WHERE relkind='S' AND relname = ?", seqName));
                    if (!series.exists())
                    {
                        throw new PipelineJobException("Unable to find sequence with name: " + seqName);
                    }
                    else
                    {
                        maxVal++;
                        ex.execute(new SQLFragment("SELECT setval(?, ?)", "ehr." + seqName, maxVal));
                    }
                }
                else
                {
                    throw new PipelineJobException("Unknown SQL Dialect: " + kinshipTable.getSqlDialect().getProductName());
                }
                transaction.commit();
            }

            try (DbScope.Transaction transaction = ExperimentService.get().ensureTransaction();
                 BufferedReader reader = Readers.getReader(output))
            {
                log.info("Inserting rows");
                String line = null;
                int lineNum = 0;
                while ((line = reader.readLine()) != null)
                {
                    String[] fields = line.split("\t");
                    if (fields.length < 3)
                        continue;
                    if ("coefficient".equalsIgnoreCase(fields[2]))
                        continue; //skip header

                    if (fields[0].equalsIgnoreCase(fields[1]))
                        continue; //dont import self-kinship

                    Map<String, Object> row = new HashMap<>();
                    assert fields[0].length() < 80 : "Field Id value too long: [" + fields[0] + ']';
                    assert fields[1].length() < 80 : "Field Id2 value too long: [" + fields[1] + "]";

                    row.put("Id", fields[0]);
                    row.put("Id2", fields[1]);
                    try
                    {
                        row.put("coefficient", Double.parseDouble(fields[2]));
                    }
                    catch (NumberFormatException e)
                    {
                        throw new PipelineJobException("Invalid kinship coefficient on line " + (lineNum + 1) + " for IDs " + fields[0] + " and " + fields[1] + ": " + fields[2], e);
                    }

                    row.put("container", c.getId());
                    row.put("created", new Date());
                    row.put("createdby", u.getUserId());
                    Table.insert(u, kinshipTable, row);
                    lineNum++;

                    if (lineNum % 100000 == 0)
                    {
                        log.info("processed " + lineNum + " rows");
                    }
                }

                log.info("Inserted " + lineNum + " rows into ehr.kinship");
                transaction.commit();
            }
        }
        catch (RuntimeSQLException | IOException e)
        {
            throw new PipelineJobException(e);
        }
    }

    private static class Relationship
    {
        private String _id;
        private String _kinId;
        private String _relation;
        private String _relationDetailed;

        public Relationship(String id, String kinId, String relation, String relationDetailed)
        {
            _id = id;
            _kinId = kinId;
            _relation = relation;
            _relationDetailed = relationDetailed; // Used for full or half sibling
        }

        public String getId()
        {
            return _id;
        }

        public void setId(String id)
        {
            _id = id;
        }

        public String getKinId()
        {
            return _kinId;
        }

        public void setKinId(String kinId)
        {
            _kinId = kinId;
        }

        public String getRelation()
        {
            return _relation;
        }

        public void setRelation(String relation)
        {
            _relation = relation;
        }

        public String getRelationDetailed()
        {
            return _relationDetailed;
        }

        public void setRelationDetailed(String relationDetailed)
        {
            _relationDetailed = relationDetailed;
        }
    }

    private Double getMinCoefficient(String relation, @Nullable String relationship)
    {
        switch(relation)
        {
            case "dam":
            case "sire":
            case "Offspring":
                return 0.25;
            case "MaternalGranddam":
            case "MaternalGrandsire":
            case "PaternalGranddam":
            case "PaternalGrandsire":
                return 0.125;
            case "Sibling":
                if (relationship != null)
                {
                    if (relationship.equalsIgnoreCase("Full Sib"))
                        return 0.25;

                    return 0.125;
                }
        }
        return 0.0;
    }

    // This function checks if missing coefficients are due to relations across species which are not tracked for kinship
    // coefficients. Otherwise throw a pipeline error.
    private void handleMissingCoefficient(User user, Container container, String id, String id2, String relation)
    {
        UserSchema studySchema = QueryService.get().getUserSchema(user, container, "study");
        if (studySchema == null)
        {
            throw new IllegalStateException("Could not find schema 'study'");
        }
        TableInfo demographicsTable = studySchema.getTable("Demographics");
        if (demographicsTable == null)
        {
            throw new IllegalStateException("Could not find query 'Demographics' in study schema");
        }

        SimpleFilter filter = new SimpleFilter(FieldKey.fromParts("Id"), List.of(id, id2), CompareType.IN);
        TableSelector demographicsTs = new TableSelector(demographicsTable, PageFlowUtil.set("Id", "species"), filter, null);

        String species = null;
        try(Results results = demographicsTs.getResults())
        {
            while(results.next())
            {
                if (species == null)
                {
                    species = results.getString("species");
                }
                else
                {
                    PipelineJob job = getJob();
                    if (!species.equals(results.getString("species")))
                    {
                        job.getLogger().info("Relation across species, kinship coefficent not calculated. Id: " + id + ", Id2: " + id2 + ", Relation: " + relation);
                    }
                    else
                    {
                        job.getLogger().info("Kinship validation failed. Missing coefficient for Id: " + id + ", Id2: " + id2 + ". Relation: " + relation);
                    }
                }
            }
        }
        catch (SQLException e)
        {
            throw new RuntimeSQLException(e);
        }

    }

    private void validateSetOfRelations(TableInfo kinshipTable, Map<String, Map<String, Relationship>> relations)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromParts("Id"), relations.keySet(), CompareType.IN);

        TableSelector kinshipTs = new TableSelector(kinshipTable, PageFlowUtil.set("Id", "Id2", "coefficient"), filter, null);

        List<String> foundKinships = new ArrayList<>();

        kinshipTs.forEach(rs -> {
            String id = rs.getString("Id");
            String kin = rs.getString("Id2");

            Map<String, Relationship> kinRelations = relations.get(id);
            if (kinRelations != null)
            {
                Relationship kinRelation = kinRelations.get(kin);
                if (kinRelation != null)
                {
                    foundKinships.add(id + "-" + kin);
                    double coefficient = rs.getDouble("coefficient");
                    if (coefficient < getMinCoefficient(kinRelation.getRelation(), kinRelation.getRelationDetailed()))
                    {
                        PipelineJob job = getJob();
                        job.getLogger().info("Kinship validation failed. Does not meet minimum coefficient for Id: " + id +
                                ", Id2: " + kin + ". Relation: " + (kinRelation.getRelationDetailed() != null ? kinRelation.getRelationDetailed() : kinRelation.getRelation()) +
                                ", coefficient: " + coefficient);
                    }

                }
            }
        });

        for (String id : relations.keySet())
        {
            for (String kin : relations.get(id).keySet())
            {
                if (!foundKinships.contains(id + "-" + kin))
                {
                    PipelineJob job = getJob();
                    handleMissingCoefficient(job.getUser(), job.getContainer(), id, kin, relations.get(id).get(kin).getRelation());
                }
            }
        }
    }

    private boolean validateKinshipType(TableInfo kinshipTable, TableInfo familyTable, List<String> familyMembers)
    {
        TableSelector familyTs = new TableSelector(familyTable, new LinkedHashSet<>(familyMembers));

        Map<String, Map<String, Relationship>> relations = new HashMap<>();
        familyTs.forEach(rs -> {
            String id = rs.getString("Id");

            Collection<String> relevantIds = new HashSet<>();
            relevantIds.add(id);

            String relationship = null;
            if (familyMembers.contains("Relationship"))
                relationship = rs.getString("Relationship");

            for (String relation : familyMembers)
            {
                if (relation.equalsIgnoreCase("Id") || relation.equals("Relationship"))
                    continue;

                String kin = rs.getString(relation);
                if (kin != null)
                {
                    Relationship relShip = new Relationship(id, kin, relation, relationship);

                    if (relations.get(id) != null)
                    {
                        relations.get(id).put(kin, relShip);
                    }
                    else
                    {
                        Map<String, Relationship> map = new HashMap<>();
                        map.put(kin, relShip);
                        relations.put(id, map);
                    }

                    if (relations.size() > 1000)
                    {
                        validateSetOfRelations(kinshipTable, relations);
                        relations.clear();
                    }
                }
            }
        });

        validateSetOfRelations(kinshipTable, relations);
        return true;
    }

    private boolean validateKinship()
    {
        PipelineJob job = getJob();
        job.getLogger().info("Validate kinship");

        UserSchema ehrSchema = QueryService.get().getUserSchema(job.getUser(), job.getContainer(), "ehr");
        if (ehrSchema == null)
        {
            throw new IllegalStateException("Could not find schema 'ehr'");
        }
        TableInfo kinshipTable = ehrSchema.getTable("kinship");
        if (kinshipTable == null)
        {
            throw new IllegalStateException("Could not find query 'kinship' in ehr schema");
        }

        UserSchema studySchema = QueryService.get().getUserSchema(job.getUser(), job.getContainer(), "study");
        if (studySchema == null)
        {
            throw new IllegalStateException("Could not find schema 'study'");
        }
        TableInfo familyTable = studySchema.getTable("demographicsFamily");
        if (familyTable == null)
        {
            job.getLogger().info("study.demographicsFamily not found. Skipping parent/grandparent validation.");
        }
        else
        {
            job.getLogger().info("Validating parent/grandparent kinship.");
            validateKinshipType(kinshipTable, familyTable, Arrays.asList("Id", "dam", "sire", "MaternalGranddam",
                    "MaternalGrandsire", "PaternalGranddam", "PaternalGrandsire"));
        }
        TableInfo offspringTable = studySchema.getTable("demographicsOffspring");
        if (offspringTable == null)
        {
            job.getLogger().info("study.demographicsOffspring not found. Skipping offspring validation.");
        }
        else
        {
            job.getLogger().info("Validating offspring kinship.");
            validateKinshipType(kinshipTable, offspringTable, Arrays.asList("Id", "Offspring"));
        }
        TableInfo siblingsTable = studySchema.getTable("demographicsSiblings");
        if (siblingsTable == null)
        {
            job.getLogger().info("study.demographicsSiblings not found. Skipping sibling validation.");
        }
        else
        {
            job.getLogger().info("Validating sibling kinship.");
            validateKinshipType(kinshipTable, siblingsTable, Arrays.asList("id", "Sibling", "Relationship"));
        }

        return true;
    }

    private static TableInfo getRealTable(TableInfo ti)
    {
        Domain domain = ti.getDomain();
        if (domain != null)
        {
            return StorageProvisioner.createTableInfo(domain);
        }

        return null;
    }

    private static void processInbreeding(Container c, User u, File pipelineDir, Logger log) throws PipelineJobException
    {
        File output = new File(pipelineDir, INBREEDING_FILE);
        if (!output.exists())
            throw new PipelineJobException("Unable to find file: " + output.getPath());

        UserSchema us = QueryService.get().getUserSchema(u, c, "study");
        TableInfo ti = us.getTable("Inbreeding Coefficients");
        if (ti == null)
        {
            log.warn("Unable to find table study.inbreeding coefficients");
            return;
        }

        QueryUpdateService qus = ti.getUpdateService();
        qus.setBulkLoad(true);

        try (BufferedReader reader = Readers.getReader(output))
        {
            try (DbScope.Transaction transaction = ExperimentService.get().ensureTransaction())
            {
                log.info("Inspecting file length: " + output.getPath());
                try (LineNumberReader lnr = new LineNumberReader(Readers.getReader(output)))
                {
                    while (lnr.readLine() != null)
                    {
                        if (lnr.getLineNumber() > 3)
                            break;
                    }
                    int lineNumber = lnr.getLineNumber();
                    if (lineNumber < 3)
                    {
                        throw new PipelineJobException("Too few lines found in inbreeding output.  Line count was: " + lineNumber);
                    }
                }

                //delete all previous records
                log.info("Deleting existing rows");
                TableInfo realTable = getRealTable(ti);
                if (realTable == null)
                {
                    throw new PipelineJobException("Unable to find real table for Inbreeding dataset");
                }

                //delete using table, since it is extremely slow otherwise
                Table.delete(realTable, new SimpleFilter(FieldKey.fromString("participantId"), null, CompareType.NONBLANK));
                transaction.commit();
            }

            String line;
            int lineNum = 0;
            List<Map<String, Object>> rows = new ArrayList<>();
            Date date = new Date();

            log.info("Reading file");
            while ((line = reader.readLine()) != null){
                String[] fields = line.split("\t");
                if (fields.length < 2)
                    continue;
                if ("coefficient".equalsIgnoreCase(fields[1]))
                    continue; //skip header

                Map<String, Object> row = new CaseInsensitiveHashMap<>();
                String subjectId = StringUtils.trimToNull(fields[0]);
                if (subjectId == null)
                {
                    log.error("Missing subjectId on row " + lineNum);
                    continue;
                }

                //row.put("Id", subjectId);
                row.put("participantid", subjectId);
                row.put("date", date);
                row.put("coefficient", Double.parseDouble(fields[1]));

                rows.add(row);
                lineNum++;
            }

            log.info("Inserting rows");
            BatchValidationException errors = new BatchValidationException();

            Map<Enum, Object> options = new HashMap<>();
            options.put(QueryUpdateService.ConfigParameters.Logger, log);

            try (DbScope.Transaction transaction = ExperimentService.get().ensureTransaction())
            {
                qus.insertRows(u, c, rows, errors, options, new HashMap<>());

                if (errors.hasErrors())
                    throw errors;

                transaction.commit();
            }
            log.info("Inserted " + lineNum + " rows into inbreeding coefficients table");

        }
        catch (DuplicateKeyException | SQLException | IOException | QueryUpdateServiceException e)
        {
            throw new PipelineJobException(e);
        }
        catch (BatchValidationException e)
        {
            log.info("error inserting rows");
            for (ValidationException ve : e.getRowErrors())
            {
                log.info(ve.getMessage());
            }

            throw new PipelineJobException(e);
        }
    }
}
