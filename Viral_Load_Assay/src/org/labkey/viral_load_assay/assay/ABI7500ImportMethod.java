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
package org.labkey.viral_load_assay.assay;

import au.com.bytecode.opencsv.CSVWriter;
import org.apache.commons.beanutils.ConversionException;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.math3.stat.descriptive.moment.StandardDeviation;
import org.apache.log4j.Level;
import org.jetbrains.annotations.Nullable;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.ConvertHelper;
import org.labkey.api.data.Selector;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.exp.api.ExpExperiment;
import org.labkey.api.exp.api.ExpProtocol;
import org.labkey.api.exp.api.ExpRun;
import org.labkey.api.laboratory.assay.AssayImportMethod;
import org.labkey.api.laboratory.assay.AssayParser;
import org.labkey.api.laboratory.assay.DefaultAssayParser;
import org.labkey.api.laboratory.assay.ImportContext;
import org.labkey.api.laboratory.assay.ParserErrors;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.ValidationException;
import org.labkey.api.security.User;
import org.labkey.api.settings.AppProps;
import org.labkey.api.util.Pair;
import org.labkey.api.view.ViewContext;
import org.labkey.viral_load_assay.Viral_Load_AssaySchema;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.StringWriter;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.ListIterator;
import java.util.Map;
import java.util.Set;

/**
 * User: bimber
 * Date: 9/26/12
 * Time: 3:58 PM
 */
public class ABI7500ImportMethod extends DefaultVLImportMethod
{
    public static final String NAME = "ABI 7500";
    private static final String NAME_FIELD = "Sample Name";
    private static final String DETECTOR_FIELD = "Detector";
    private static final String CATEGORY_FIELD = "category";
    private static final String QUANTITY_FIELD = "Quantity";
    private static final String ASSAYNAME_FIELD = "assayId";
    private static final String SUBJECT_FIELD = "subjectId";
    private static final String DATE_FIELD = "date";

    protected final static SimpleDateFormat _dateFormat = new SimpleDateFormat("yyyy-MM-dd");

    public ABI7500ImportMethod(String providerName)
    {
        super(providerName);
    }

    @Override
    public String getName()
    {
        return NAME;
    }

    @Override
    public String getLabel()
    {
        return NAME;
    }

    @Override
    public String getTooltip()
    {
        return "Choose this option to upload data directly from the output of an ABI 7500.  NOTE: this import method expects that you upload sample information prior to creating the experiment run.";
    }

    @Override
    public boolean hideTemplateDownload()
    {
        return true;
    }

    @Override
    public String getTemplateInstructions()
    {
        return "This import path assumes you prepared this run by creating/saving a template from this site, which defines your plate layout and sample information.  The results you enter below will be merged with that previously imported sample information using well.  When you select a saved plate template using the \'Saved Sample Information\' section above, you should see a list of the samples you uploaded.";
    }

    public AssayParser getFileParser(Container c, User u, int assayId)
    {
        return new Parser(this, c, u, assayId);
    }

    @Override
    public String getExampleDataUrl(ViewContext ctx)
    {
        return AppProps.getInstance().getContextPath() + "/Viral_Load_Assay/SampleData/ABI7500.txt";
    }

    @Override
    public JSONObject getMetadata(ViewContext ctx, ExpProtocol protocol)
    {
        JSONObject meta = super.getMetadata(ctx, protocol);

        JSONObject runMeta = meta.getJSONObject("Run");
        runMeta.put("slope", new JSONObject().put("hidden", true));
        runMeta.put("intercept", new JSONObject().put("hidden", true));
        runMeta.put("rSquared", new JSONObject().put("hidden", true));
        runMeta.put("instrument", new JSONObject().put("defaultValue", "ABI 7500"));
        meta.put("Run", runMeta);

        JSONObject resultsMeta = meta.getJSONObject("Results");

        JSONObject eluateMap = getJsonObject(resultsMeta, "eluateVol");
        eluateMap.put("defaultValue", 60);
        eluateMap.put("setGlobally", true);
        resultsMeta.put("eluateVol", eluateMap);

        JSONObject volMap = getJsonObject(resultsMeta, "volPerRxn");
        volMap.put("defaultValue", 20);
        volMap.put("setGlobally", true);
        resultsMeta.put("volPerRxn", volMap);

        meta.put("Results", resultsMeta);

        return meta;
    }

    private class Parser extends DefaultAssayParser
    {
        private final Double CYCLE_LIMIT = 45.0;
        private static final String TASK_FIELD = "Task";

        private Map<String, Map<String, Double>> _detectorMap;
        private static final String EMPTY_NAME = "empty";

        public Parser(AssayImportMethod method, Container c, User u, int assayId)
        {
            super(method, c, u, assayId);
        }

        @Override
        public Pair<ExpExperiment, ExpRun> saveBatch(JSONObject json, File file, String fileName, ViewContext ctx) throws BatchValidationException
        {
            Integer templateId = json.getInt("TemplateId");

            Pair<ExpExperiment, ExpRun> result = super.saveBatch(json, file, fileName, ctx);

            saveTemplate(ctx, templateId, result.second.getRowId());
            return result;
        }

        /**
         * We read the entire raw file, parsing and cropping out the run information that is above the results.
         */
        @Override
        protected String readRawFile(ImportContext context) throws BatchValidationException
        {
            ParserErrors errors = context.getErrors();

            Map<String, Object> runProperties = new HashMap<>();
            _detectorMap = new HashMap<>();

            BufferedReader reader = null;
            boolean inResults = false;
            boolean inDetectors = false;

            try (StringWriter sw = new StringWriter(); CSVWriter out = new CSVWriter(sw, '\t'))
            {
                for (List<String> row : getFileLines(context.getFile()))
                {
                    String line = StringUtils.trimToNull(StringUtils.join(row, "\n"));
                    if (StringUtils.isEmpty(line))
                    {
                        inDetectors = false;
                        continue;
                    }

                    if (row.size() == 9 && row.get(0).equals("Well"))
                        inResults = true;

                    if (!inResults)
                    {
                        if (row.size() == 0)
                            continue;

                        if (row.get(0).equals("Detector Name"))
                        {
                            inDetectors = true;
                            continue;
                        }

                        if (inDetectors)
                        {
                            String detector = row.get(0);
                            Map<String, Double> map = new HashMap<String, Double>();
                            map.put("slope", Double.parseDouble(row.get(1)));
                            map.put("intercept", Double.parseDouble(row.get(2)));
                            map.put("rSquared", Double.parseDouble(row.get(3)));
                            map.put("standards", Double.parseDouble(row.get(4)));
                            map.put("unknowns", Double.parseDouble(row.get(5)));
                            _detectorMap.put(detector, map);
                            continue;
                        }

                        if (row.get(0).startsWith("Comments:"))
                        {
                            runProperties.put("comments", line.replaceFirst("Comments:", ""));
                        }
                        else if (row.get(0).startsWith("User:"))
                        {
                            runProperties.put("performedBy", line.replaceFirst("User: ", ""));
                        }
                        else if (row.get(0).startsWith("Run Date:"))
                        {
                            runProperties.put("runDate", line.replaceFirst("Run Date: ", "").replaceAll("\t", ""));
                        }
                        else if (row.get(0).startsWith("PCR Volume:"))
                        {
                            runProperties.put("rxnVolume", line.replaceFirst("PCR Volume: ", ""));
                        }
                        else if (row.get(0).startsWith("Document Name:"))
                        {
                            runProperties.put("name", line.replaceFirst("Document Name: ", ""));
                        }
                    }
                    else
                    {
                        out.writeNext(row.toArray(new String[row.size()]));
                    }
                }

                errors.confirmNoErrors();

                return sw.toString();
            }
            catch (IOException e)
            {
                errors.addError(e.getMessage());
                throw errors.getErrors();
            }
            finally
            {
                try { if (reader != null) reader.close(); } catch (IOException e) {}
            }
        }

        @Override
        protected List<Map<String, Object>> processRowsFromFile(List<Map<String, Object>> rows, ImportContext context) throws BatchValidationException
        {
            List<Map<String, Object>> newRows = new ArrayList<Map<String, Object>>();
            ParserErrors errors = context.getErrors();

            //add slope to run info
            if (_detectorMap.keySet().size() == 1)
            {
                JSONObject runInfo = context.getRunProperties();
                Map<String, Double> values = _detectorMap.values().iterator().next();
                runInfo.put("slope", values.get("slope"));
                runInfo.put("intercept", values.get("intercept"));
                runInfo.put("rSquared", values.get("rSquared"));
            }

            String keyProperty = "well";
            Map<String, Map<String, Object>> templateRows = getTemplateRowMap(context, keyProperty);

            ListIterator<Map<String, Object>> rowsIter = rows.listIterator();
            int rowIdx = 0;
            while (rowsIter.hasNext())
            {
                try
                {
                    rowIdx++;
                    Map<String, Object> row = rowsIter.next();
                    Map<String, Object> map = new CaseInsensitiveHashMap<Object>(row);

                    if (row.size() != 9)
                    {
                        errors.addError("Improperly formatted row on line " + rowIdx + ", expected 9 cells");
                        continue;
                    }

                    appendPromotedResultFields(map, context);

                    if (!map.containsKey(NAME_FIELD) || map.get(NAME_FIELD) == null)
                    {
                        errors.addError("Missing sample name for row: " + rowIdx);
                        continue;
                    }

                    if (EMPTY_NAME.equals(map.get(NAME_FIELD)))
                        continue;

                    if (map.get("well") != null)
                    {
                        map.put("well", ((String)map.get("well")).toUpperCase());
                    }

                    //associate/merge sample information with the incoming results
                    if (!mergeTemplateRow(keyProperty, templateRows, map, context))
                        continue;

                    String subjectId = (String)map.get("subjectId");
                    String name = (String)map.get(NAME_FIELD);
                    if (name == null)
                    {
                        errors.addError("Row " + rowIdx + ": Missing sample name");
                        continue;
                    }

                    if (!name.contains(subjectId))
                    {
                        errors.addError("Row " + rowIdx + ": The subject Id (" + subjectId + ") could not be found in sample name " + name + ", which may indicate that results are out of order", Level.WARN);
                        continue;
                    }

                    TYPE task = TYPE.getByTemplateText((String)map.get(TASK_FIELD));
                    if (task == null)
                    {
                        errors.addError("Row " + rowIdx + ": Unknown value for task column " + map.get(TASK_FIELD));
                        continue;
                    }

                    //this will be used later to calculate VL
                    if (!_detectorMap.containsKey(map.get(DETECTOR_FIELD)))
                    {
                        errors.addError("Row " + rowIdx + ": Unable to find detector information for detector: " + map.get(DETECTOR_FIELD));
                        continue;
                    }

                    //handle CT.  note: the assay originally was based on Roche, which calls CT 'CP'
                    //NOTE: this is a funny column.  Roche, where the assay was originally written,
                    //calls CT, CP. There underlying column has this name.  It is labeled 'CT', so when the
                    //tabloader resolved the columns, CT was resolved to CP, so the following line is not needed
                    //map.put("cp", map.get("ct"));
                    if ("Undetermined".equals(map.get("cp")))
                    {
                        map.put("cp", null);
                    }

                    String category = (String)map.get(CATEGORY_FIELD);
                    TYPE catType = TYPE.getByDatabaseCategoryValue(category);
                    if (!catType.getTemplateText().equals(task.getTemplateText()))
                    {
                        errors.addError("Sample category for well: " + map.get("well") + "was " + task.getTemplateText() + ", which does not match the template value of: " + catType.getDatabaseCategoryValue());
                        continue;
                    }

                    if (TYPE.Standard.equals(category))
                    {
                        if (map.get("sampleVol") == null)
                            map.put("sampleVol", 1);

                        if (!(map.get(QUANTITY_FIELD) instanceof Double))
                        {
                            errors.addError("Row " + rowIdx + ": Quantity for standard was not a number: " + map.get(QUANTITY_FIELD));
                            continue;
                        }
                    }
                    else if (TYPE.NEG_CTL.equals(category))
                    {
                        if (map.get("sampleVol") == null)
                            map.put("sampleVol", 1);

                        if (map.get("cp") != null)
                        {
                            map.put("qcflag", "NTC had a value for CT");
                        }
                    }

                    for (String field :  new String[]{"sampleVol", "volPerRxn", "eluateVol"})
                    {
                        if (map.get(field) == null)
                        {
                            errors.addError("Row " + rowIdx + ": Missing required field:" + field);
                            continue;
                        }

                        try
                        {
                            Double.parseDouble(String.valueOf(map.get(field)));
                        }
                        catch (NumberFormatException e)
                        {
                            errors.addError("Row " + rowIdx + ": Non-numeric value for field " + field + ": " + map.get(field));
                            continue;
                        }

                    }

                    newRows.add(map);
                }
                catch (IllegalArgumentException e)
                {
                    errors.addError(e.getMessage());
                }
            }

            ensureTemplateRowsHaveResults(templateRows, context);

            errors.confirmNoErrors();
            calculateViralLoads(newRows);

            return newRows;
        }

        private void calculateViralLoad(Map<String, Object> map, Double limitOfDetection)
        {
            Map<String, Double> detectorInfo = _detectorMap.get(map.get(DETECTOR_FIELD));
            Double ct = map.get("cp") == null ? null : Double.parseDouble(map.get("cp").toString());
            Double sampleVol = Double.parseDouble(String.valueOf(map.get("sampleVol")));
            Double intercept = detectorInfo.get("intercept");
            Double slope = detectorInfo.get("slope");
            Double volPerRxn = Double.parseDouble(String.valueOf(map.get("volPerRxn")));
            Double eluateVol = Double.parseDouble(String.valueOf(map.get("eluateVol")));
            Double copiesPerRxn = ct == null || ct == CYCLE_LIMIT ? limitOfDetection : Math.pow(10.0, ((ct - intercept)/slope));

            if (copiesPerRxn < limitOfDetection)
                copiesPerRxn = limitOfDetection;

            map.put("copiesPerRxn", copiesPerRxn);

            Double multiplier = eluateVol / volPerRxn;
            Double vl = (copiesPerRxn * multiplier) / sampleVol;
            map.put("viralLoad", vl);
        }

        private void calculateViralLoads(List<Map<String, Object>> rows)
        {
            Map<String, List<Map<String, Object>>> rowMap = new HashMap<String, List<Map<String, Object>>>();
            Double lowestStd = 0.0;
            for (Map<String, Object> row : rows)
            {
                String key = (String)row.get(NAME_FIELD);
                List<Map<String, Object>> list = rowMap.get(key);
                if (list == null)
                    list = new ArrayList<Map<String, Object>>();

                if (TYPE.Standard.getTemplateText().equals(row.get(CATEGORY_FIELD)))
                {
                    Double val = (Double)row.get(QUANTITY_FIELD);
                    if (lowestStd == 0)
                        lowestStd = val;
                    else
                        lowestStd = val < lowestStd ? val : lowestStd;
                }
                list.add(row);
                rowMap.put(key, list);
            }


            //LOD is defined as half the lowest STD
            Double limitOfDetection = lowestStd / 2.0;

            for (String key : rowMap.keySet())
            {
                List<Map<String, Object>> list = rowMap.get(key);
                Double avgCopies = 0.0;
                double[] values = new double[list.size()];
                int idx = 0;
                for (Map<String, Object> row : list)
                {
                    calculateViralLoad(row, limitOfDetection);

                    avgCopies += (Double)row.get("copiesPerRxn");
                    values[idx] = (Double)row.get("copiesPerRxn");
                    idx++;
                }

                avgCopies = avgCopies / list.size();
                Double stdDev = new StandardDeviation().evaluate(values);
                Double cv = stdDev / avgCopies;

                //NOTE: at some point I should make this configurable
                //flag any record with %CV > 66, but only if at least 1 replicate has copies/rxn above limitOfDetection
                double cutOff = 0.66;
                if (cv >= cutOff)
                {
                    boolean flag = false;
                    for (Map<String, Object> row : list)
                    {
                        if ((Double)row.get("copiesPerRxn") >= limitOfDetection)
                            flag = true;
                    }

                    if (flag)
                    {
                        for (Map<String, Object> row : list)
                        {
                            row.put("qcflag", "HIGH CV");
                        }
                    }
                }
            }
        }
    }

    @Override
    public boolean supportsRunTemplates()
    {
        return true;
    }

    @Override
    public void doGenerateTemplate(JSONObject json, HttpServletRequest request, HttpServletResponse response) throws BatchValidationException
    {
        BatchValidationException errors = new BatchValidationException();

        try
        {
            JSONObject resultDefaults = json.optJSONObject("Results");
            JSONArray rawResults = json.getJSONArray("ResultRows");

            Map<Object, Object> wellMap = getWellMap96("well_96", "addressbyrow_96");

            //append global results
            List<JSONObject> results = new ArrayList<JSONObject>();
            for (JSONObject row : rawResults.toJSONObjectArray())
            {
                for (String prop : resultDefaults.keySet())
                {
                    row.put(prop, resultDefaults.get(prop));
                }
                results.add(row);
            }
            Map<String, Map<String, String>> detectorRows = getDetectorsForResults(results);

            if (!json.containsKey("templateName") || json.getString("templateName") == null)
            {
                errors.addRowError(new ValidationException("No template name provided"));
                throw errors;
            }

            String filename = json.getString("templateName") + ".txt";
            response.setContentType("text/tab-separated-values");
            response.setHeader("Content-disposition", "attachment; filename=\"" + filename +"\"");
            response.setHeader("Pragma", "private");
            response.setHeader("Cache-Control", "private");

            Map<Integer, String[]> rowMap = new HashMap<Integer, String[]>();

            int rowIdx = 0;
            for (JSONObject row : results)
            {
                rowIdx++;

                List<String> fields = new ArrayList<String>();

                //build the row
                Integer wellNum = (Integer)wellMap.get(row.getString("well"));

                String detector = detectorRows.get(row.getString(ASSAYNAME_FIELD)).get("detector");
                TYPE type = TYPE.getByDatabaseCategoryValue(row.getString(CATEGORY_FIELD));

                fields.add(String.valueOf(wellNum));
                fields.add(TYPE.getSampleName(type, row));
                fields.add(detector);
                fields.add(type.getTemplateText());
                fields.add(TYPE.getQuantity(type, row.getString(SUBJECT_FIELD)));

                rowMap.put(wellNum, fields.toArray(new String[fields.size()]));
            }

            if (errors.hasErrors())
                throw errors;

            List<String[]> rows = new ArrayList<String[]>();
            rows.add(new String[]{"*** SDS Setup File Version", "3"});
            rows.add(new String[]{"*** Output Plate Size", "96"});
            rows.add(new String[]{"*** Output Plate ID", json.getString("templateName") + ".sds"});
            rows.add(new String[]{"*** Number of Detectors", Integer.toString(detectorRows.size())});
            rows.add(new String[]{"Detector", "Reporter", "Quencher", "Description", "Comments"});
            for (Map<String, String> d : detectorRows.values())
            {
                rows.add(new String[]{d.get("detector"), d.get("reporter"), d.get("quencher")});
            }
            rows.add(new String[]{"Well", "Sample Name", "Detector", "Task", QUANTITY_FIELD});

            int idx = 1;
            while (idx <= 96)
            {
                if (rowMap.containsKey(idx))
                {
                    rows.add(rowMap.get(idx));
                }
                else
                {
                    rows.add(new String[]{String.valueOf(idx), EMPTY_WELL_NAME, detectorRows.get(detectorRows.keySet().iterator().next()).get("detector"), TYPE.Unknown.getTemplateText()});
                }
                idx++;
            }

            CSVWriter csv = new CSVWriter(response.getWriter(), '\t', CSVWriter.NO_QUOTE_CHARACTER, System.getProperty("line.separator"));
            for (String[] row : rows)
            {
                csv.writeNext(row);
            }
            csv.close();
        }
        catch (IOException e)
        {
            errors.addRowError(new ValidationException(e.getMessage()));
            throw errors;
        }
    }

    private Map<String, Map<String, String>> getDetectorsForResults(List<JSONObject> results)
    {
        final Map<String, Map<String, String>> ret = new HashMap<String, Map<String, String>>();
        Set<String> distinctAssays = new HashSet<String>();
        for (JSONObject row : results)
        {
            distinctAssays.add(row.getString(ASSAYNAME_FIELD));
        }

        TableInfo table = Viral_Load_AssaySchema.getInstance().getSchema().getTable(Viral_Load_AssaySchema.TABLE_ABI7500_DETECTORS);
        TableSelector ts = new TableSelector(table, new SimpleFilter(FieldKey.fromString("assayName"), distinctAssays, CompareType.IN), null);
        ts.forEach(new Selector.ForEachBlock<ResultSet>()
        {
            @Override
            public void exec(ResultSet object) throws SQLException
            {
                Map<String, String> row = new HashMap<String, String>();
                row.put("detector", object.getString("detector"));
                row.put("reporter", object.getString("reporter"));
                row.put("quencher", object.getString("quencher"));
                ret.put(object.getString("assayName"), row);
            }
        });

        return ret;
    }

    @Override
    public void validateTemplate(User u, Container c, ExpProtocol protocol, @Nullable Integer templateId, String title, JSONObject json, BatchValidationException errors) throws BatchValidationException
    {
        //ensure each subject/date has at least 2 neg controls
        JSONObject resultDefaults = json.optJSONObject("Results");
        JSONArray rawResults = json.getJSONArray("ResultRows");
        List<JSONObject> results = new ArrayList<JSONObject>();
        Set<String> distinctWells = new HashSet<String>();
        Map<Object, Object> wellMap = getWellMap96("well_96", "addressbyrow_96");

        String[] requiredFields = new String[]{"well", SUBJECT_FIELD, CATEGORY_FIELD, ASSAYNAME_FIELD};

        int negCtlCount = 0;
        int rowIdx = 0;
        for (JSONObject row : rawResults.toJSONObjectArray())
        {
            rowIdx++;

            for (String prop : resultDefaults.keySet())
            {
                row.put(prop, resultDefaults.get(prop));
            }
            results.add(row);

            if (TYPE.NEG_CTL.getDatabaseCategoryValue().equals(row.get(CATEGORY_FIELD)))
                negCtlCount++;

            rowIdx++;

            boolean missingRequired = false;
            for (String field : requiredFields)
            {
                if (row.get(field) == null || StringUtils.isEmpty(row.getString(field)))
                {
                    errors.addRowError(new ValidationException("Row " + rowIdx + ": missing required field: " + field));
                    missingRequired = true;
                    continue;
                }
            }

            if (missingRequired)
                continue;

            TYPE type = null;
            try
            {
                type = TYPE.getByDatabaseCategoryValue(row.getString(CATEGORY_FIELD));
            }
            catch (IllegalArgumentException e)
            {
                errors.addRowError(new ValidationException("Row " + rowIdx + ": Invalid value for sample category: " +  row.getString(CATEGORY_FIELD)));
                continue;
            }

            if (type == null)
            {
                errors.addRowError(new ValidationException("Row " + rowIdx + ": Invalid value for sample category: " +  row.getString(CATEGORY_FIELD)));
                continue;
            }

            if (TYPE.Standard.getTemplateText().equals(row.get(CATEGORY_FIELD)))
            {
                if (row.get(QUANTITY_FIELD) == null)
                {
                    errors.addRowError(new ValidationException("Row " + rowIdx + ": Missing value for quantity field"));
                    continue;
                }

                try
                {
                    row.getDouble(QUANTITY_FIELD);
                }
                catch (JSONException e)
                {
                    errors.addRowError(new ValidationException("Row " + rowIdx + ": The value for quantity was not a number: " +  row.getString(QUANTITY_FIELD)));
                    continue;
                }
            }

            String well = row.getString("well");
            if (well == null)
            {
                errors.addRowError(new ValidationException("Row " + rowIdx + ": sample is missing well"));
                continue;
            }

            if (!wellMap.containsKey(well))
            {
                errors.addRowError(new ValidationException("Row " + rowIdx + ": unknown well: " + well));
                continue;
            }

            if (distinctWells.contains(well))
            {
                errors.addRowError(new ValidationException("Row " + rowIdx + ": another sample is already present in well: " + well));
                continue;
            }
            distinctWells.add(well);

            //validate the row's date
            if (row.get(DATE_FIELD) != null)
            {
                try
                {
                    Date date = ConvertHelper.convert(row.get(DATE_FIELD), Date.class);
                    _dateFormat.format(date);
                }
                catch (ConversionException e)
                {
                    errors.addRowError(new ValidationException("Row " + rowIdx + ": Invalid sample date"));
                    continue;
                }
                catch (IllegalArgumentException e)
                {
                    errors.addRowError(new ValidationException("Row " + rowIdx + ": Invalid sample date"));
                    continue;
                }
            }
        }

        Map<String, Map<String, String>> detectorRows = getDetectorsForResults(results);
        if (detectorRows.size() == 0)
        {
            errors.addRowError(new ValidationException("No detectors were found for these samples."));
            throw errors;
        }

        for (JSONObject row : results)
        {
            if (!detectorRows.containsKey(row.getString(ASSAYNAME_FIELD)))
            {
                errors.addRowError(new ValidationException("Row " + rowIdx + ": Unable to find detector name for assay: " +  row.getString(CATEGORY_FIELD)));
                continue;
            }
        }

        if (negCtlCount < 2)
        {
            errors.addRowError(new ValidationException("Must provide at least 2 negative controls per run"));
        }

        super.validateTemplate(u, c, protocol, templateId, title, json, errors);

        if (errors.hasErrors())
            throw errors;
    }

    private enum TYPE
    {
        Unknown("UNKN", "Unknown"),
        Standard("STND", "Standard"),
        NEG_CTL("NTC", "Neg Control"),
        POS_CTL("UNKN", "Pos Control");

        TYPE(String templateText, String dbCategoryValue)
        {
            _templateText = templateText;
            _dbCategoryValue = dbCategoryValue;
        }

        public String _templateText;
        public String _dbCategoryValue;

        public static TYPE getByTemplateText(String text)
        {
            for (TYPE t : TYPE.values())
            {
                if (t.getTemplateText().equals(text))
                    return t;
            }

            for (TYPE t : TYPE.values())
            {
                if (t.getDatabaseCategoryValue().equals(text))
                    return t;
            }

            return null;
        }

        public static TYPE getByDatabaseCategoryValue(String text)
        {
            for (TYPE t : TYPE.values())
            {
                if (t.getDatabaseCategoryValue().equals(text))
                    return t;
            }

            return null;
        }

        public static String getQuantity(TYPE type, String name)
        {
            if (type.getTemplateText().equals(Standard.getTemplateText()))
            {
                String[] tokens = name.split("_");
                return tokens[1];
            }
            else if (type.getTemplateText().equals(NEG_CTL.getTemplateText()))
            {
                return NEG_CTL.getTemplateText();
            }

            return null;
        }

        public static String getSampleName(TYPE type, Map<String, Object> row)
        {
            if (type.getTemplateText().equals(Unknown.getTemplateText()))
            {
                StringBuilder sb = new StringBuilder();
                sb.append(row.get(SUBJECT_FIELD));

                if (row.get(DATE_FIELD) != null)
                {
                    try
                    {
                        Date date = ConvertHelper.convert(row.get(DATE_FIELD), Date.class);
                        String dateString = _dateFormat.format(date);
                        sb.append("_").append(dateString);
                    }
                    catch (ConversionException e)
                    {
                        //ignore
                    }
                }
                return sb.toString();
            }
            else
            {
                return (String)row.get(SUBJECT_FIELD);
            }
        }

        public String getDatabaseCategoryValue()
        {
            return _dbCategoryValue;
        }

        public String getTemplateText()
        {
            return _templateText;
        }
    }
}
