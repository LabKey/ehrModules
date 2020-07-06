package org.labkey.viral_load_assay.assay;

import org.apache.commons.beanutils.ConversionException;
import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Level;
import org.jetbrains.annotations.Nullable;
import org.json.JSONArray;
import org.json.JSONObject;
import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.data.Container;
import org.labkey.api.data.ConvertHelper;
import org.labkey.api.data.Results;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.exp.api.ExpExperiment;
import org.labkey.api.exp.api.ExpProtocol;
import org.labkey.api.exp.api.ExpRun;
import org.labkey.api.laboratory.assay.AssayImportMethod;
import org.labkey.api.laboratory.assay.DefaultAssayParser;
import org.labkey.api.laboratory.assay.ImportContext;
import org.labkey.api.laboratory.assay.ParserErrors;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryHelper;
import org.labkey.api.query.ValidationException;
import org.labkey.api.reader.TabLoader;
import org.labkey.api.security.User;
import org.labkey.api.util.Pair;
import org.labkey.api.util.ResultSetUtil;
import org.labkey.api.view.ViewContext;

import java.io.File;
import java.io.IOException;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.ListIterator;
import java.util.Map;
import java.util.Set;

public class AbstractWNPRCImportMethod extends DefaultVLImportMethod
{
    private static final String DATE_FIELD = "date";
    private static final String UNIQUE_FIELD = "uniqueSample";
    protected final static SimpleDateFormat _dateFormat = new SimpleDateFormat("yyyy-MM-dd");

    //Formats that can be used for entering pooled sample dates
    protected final static DateTimeFormatter[] _pooledDateFormats = {
            DateTimeFormatter.ofPattern("yyyy-MM-dd"),
            DateTimeFormatter.ofPattern("MM/dd/yyyy"),
            DateTimeFormatter.ofPattern("MM-dd-yyyy"),
            DateTimeFormatter.ofPattern("M/d/yyyy"),
            DateTimeFormatter.ofPattern("M-d-yyyy")
    };

    public AbstractWNPRCImportMethod(String providerName)
    {
        super(providerName);
    }

    @Override
    public boolean hideTemplateDownload() {
        return true;
    }

    @Override
    public boolean supportsRunTemplates() {
        return true;
    }

    @Override
    public List<String> getTemplateDownloadColumns() {

        //Set the columns that will be included in the excel file
        //when downloading from the template (prepare run) page
        ArrayList<String> exportColumns = new ArrayList<>();
        exportColumns.add("uniqueSample");
        exportColumns.add("well");
        exportColumns.add("subjectId");
        exportColumns.add("date");

        return exportColumns;
    }

    @Override
    public JSONObject getMetadata(ViewContext ctx, ExpProtocol protocol)
    {
        JSONObject meta = super.getMetadata(ctx, protocol);

        //Hide some fields that aren't used for these runs
        JSONObject runMeta = meta.getJSONObject("Run");
        runMeta.put("slope", new JSONObject().put("hidden", true));
        runMeta.put("intercept", new JSONObject().put("hidden", true));
        runMeta.put("rSquared", new JSONObject().put("hidden", true));

        JSONObject resultsMeta = meta.getJSONObject("Results");

        JSONObject objectId = getJsonObject(resultsMeta, "objectid");
        JSONObject eluateMap = getJsonObject(resultsMeta, "eluateVol");
        JSONObject sourceMaterial = getJsonObject(resultsMeta, "sourceMaterial");

        objectId.put("hidden", true);
        eluateMap.put("defaultValue", 50);
        eluateMap.put("setGlobally", true);
        sourceMaterial.put("setGlobally", false);

        resultsMeta.put("objectid", objectId);
        resultsMeta.put("eluateVol", eluateMap);
        resultsMeta.put("sourceMaterial", sourceMaterial);

        meta.put("Run", runMeta);
        meta.put("Results", resultsMeta);

        return meta;
    }

    //Used to change metadata for the template (prepare run) page
    @Override
    public JSONObject getSupplementalTemplateMetadata()
    {
        JSONObject ret = new JSONObject();
        JSONObject domainMeta = new JSONObject();
        JSONObject resultsMeta = new JSONObject();

        //Show the source material field as a column in the template table rather than
        //globally in the result fields section
        JSONObject sourceMaterial = getJsonObject(resultsMeta, "sourceMaterial");
        sourceMaterial.put("defaultValue", "Plasma");
        sourceMaterial.put("setGlobally", false);
        sourceMaterial.put("hidden", false);
        sourceMaterial.put("required", true);
        resultsMeta.put("sourceMaterial", sourceMaterial);

        JSONObject sampleId = getJsonObject(resultsMeta, "sampleId");
        sampleId.put("hidden", true);
        sampleId.put("required", false);
        resultsMeta.put("sampleId", sampleId);

        //Show sample type globally in the result fields section rather than
        //as a column in the template table
        JSONObject sampleType = getJsonObject(resultsMeta, "sampleType");
        sampleType.put("setGlobally", true);
        sampleType.put("hidden", false);
        sampleType.put("required", true);
        resultsMeta.put("sampleType", sampleType);

        //Whenever a new row is added to the template table automatically
        //generate a new UUID for the unique sample column
        JSONObject uniqueSample = getJsonObject(resultsMeta, "uniqueSample");
        uniqueSample.put("getInitialValue", "function(val) { return val || ViralLoad.Utils.compressUUID(LABKEY.Utils.generateUUID().toUpperCase()); }");
        resultsMeta.put("uniqueSample", uniqueSample);

        JSONObject units = getJsonObject(resultsMeta, "sourceMaterial/liquid");
        units.put("hidden", true);
        units.put("required", false);
        resultsMeta.put("sourceMaterial/liquid", units);

        /*********************************************
         * Hide all of the new assay columns - Start *
         *********************************************/

        JSONObject color = getJsonObject(resultsMeta, "color");
        JSONObject geneName = getJsonObject(resultsMeta, "geneName");
        JSONObject call = getJsonObject(resultsMeta, "call");
        JSONObject excluded = getJsonObject(resultsMeta, "excluded");
        JSONObject cqMean = getJsonObject(resultsMeta, "cqMean");
        JSONObject cqError = getJsonObject(resultsMeta, "cqError");
        JSONObject concentrationMean = getJsonObject(resultsMeta, "concentrationMean");
        JSONObject concentrationError = getJsonObject(resultsMeta, "concentrationError");
        JSONObject replicateGroup = getJsonObject(resultsMeta, "replicateGroup");
        JSONObject dye = getJsonObject(resultsMeta, "dye");
        JSONObject editedCall = getJsonObject(resultsMeta, "editedCall");
        JSONObject slope = getJsonObject(resultsMeta, "slope");
        JSONObject epf = getJsonObject(resultsMeta, "epf");
        JSONObject failure = getJsonObject(resultsMeta, "failure");
        JSONObject notes = getJsonObject(resultsMeta, "notes");
        JSONObject samplePrepNotes = getJsonObject(resultsMeta, "samplePrepNotes");
        JSONObject number = getJsonObject(resultsMeta, "number");
        JSONObject qcstate = getJsonObject(resultsMeta, "qcstate");
        JSONObject qcresults = getJsonObject(resultsMeta, "qcresults");
        JSONObject pooled = getJsonObject(resultsMeta, "pooled");

        color.put("hidden", true);
        geneName.put("hidden", true);
        call.put("hidden", true);
        excluded.put("hidden", true);
        cqMean.put("hidden", true);
        cqError.put("hidden", true);
        concentrationMean.put("hidden", true);
        concentrationError.put("hidden", true);
        replicateGroup.put("hidden", true);
        dye.put("hidden", true);
        editedCall.put("hidden", true);
        slope.put("hidden", true);
        epf.put("hidden", true);
        failure.put("hidden", true);
        notes.put("hidden", true);
        samplePrepNotes.put("hidden", true);
        number.put("hidden", true);
        qcstate.put("hidden", true);
        qcresults.put("hidden", true);
        pooled.put("hidden", true);

        resultsMeta.put("color", color);
        resultsMeta.put("geneName", geneName);
        resultsMeta.put("call", call);
        resultsMeta.put("excluded", excluded);
        resultsMeta.put("cqMean", cqMean);
        resultsMeta.put("cqError", cqError);
        resultsMeta.put("concentrationMean", concentrationMean);
        resultsMeta.put("concentrationError", concentrationError);
        resultsMeta.put("replicateGroup", replicateGroup);
        resultsMeta.put("dye", dye);
        resultsMeta.put("editedCall", editedCall);
        resultsMeta.put("slope", slope);
        resultsMeta.put("epf", epf);
        resultsMeta.put("failure", failure);
        resultsMeta.put("notes", notes);
        resultsMeta.put("samplePrepNotes", samplePrepNotes);
        resultsMeta.put("number", number);
        resultsMeta.put("qcstate", qcstate);
        resultsMeta.put("qcresults", qcresults);
        resultsMeta.put("pooled", pooled);

        /*******************************************
         * Hide all of the new assay columns - End *
         *******************************************/

        domainMeta.put("Results", resultsMeta);
        ret.put("domains", domainMeta);

        return ret;
    }

    @Override
    public void validateTemplate(User u, Container c, ExpProtocol protocol, @Nullable Integer templateId, String title, JSONObject json, BatchValidationException errors) throws BatchValidationException {
        JSONObject resultDefaults = json.optJSONObject("Results");
        JSONArray rawResults = json.getJSONArray("ResultRows");
        Set<String> distinctWells = new HashSet<>();

        //Gets a mapping of all of the wells in the plate.  In this case it should be A1 -> 1, A2 -> 2, ..., H12 -> 96
        Map<Object, Object> wellMap = getWellMap96("well_96", "addressbyrow_96");

        String[] requiredFields = new String[]{"well", "uniqueSample", "subjectId", "date", "sourceMaterial"};

        //Queries to find all valid source materials (any material present in the viral_load_assay.source_material table)
        List<String> validSourceMaterials = new ArrayList<>();
        Results rs = null;
        List<FieldKey> column = new ArrayList<>();
        column.add(FieldKey.fromString("type"));
        try {
            while (c.isWorkbook()) {
                c = c.getParent();
            }
            QueryHelper qh = new QueryHelper(c, u, "viral_load_assay", "source_material");
            rs = qh.select(column, new SimpleFilter());

            while (rs.next()) {
                validSourceMaterials.add(rs.getString("type"));
            }
        } catch (SQLException e) {
            //do nothing
        } finally {
            ResultSetUtil.close(rs);
        }

        //Validate the contents of each template row
        int rowIdx = 0;
        for (JSONObject row : rawResults.toJSONObjectArray()) {
            rowIdx++;

            //Override any defaults with actual user input
            for (String prop : resultDefaults.keySet()) {
                row.put(prop, resultDefaults.get(prop));
            }

            String[] ids = !StringUtils.isEmpty(row.getString("subjectId")) ? row.getString("subjectId").split(",\\s*") : new String[0];
            String[] pooledDates = !StringUtils.isEmpty(row.getString("pooledDates")) ? row.getString("pooledDates").split("[^0-9/-]") : new String[0];

            //Check to make sure that all required fields are populated for the current row
            boolean missingRequired = false;
            for (String field : requiredFields) {
                if (row.get(field) == null || StringUtils.isEmpty(row.getString(field))) {
                    if (field.equals(DATE_FIELD) && "Standard".equals(row.get("category"))) {
                        //Standard samples do not require a date
                    } else if (field.equals(DATE_FIELD) && pooledDates.length > 0) {
                        //This is a pooled sample and doesn't require a sampleDate as they'll all be in the pooledDates field
                    } else {
                        errors.addRowError(new ValidationException("Row " + rowIdx + ": missing required field: " + field));
                        missingRequired = true;
                    }
                }
            }

            if (missingRequired) {
                continue;
            }

            //Check to make sure everything is formatted correctly if this is a pooled sample
            if (ids.length > 1) {
                if (StringUtils.isEmpty(row.getString(DATE_FIELD))) {
                    if (ids.length == pooledDates.length) {
                        //This is a pooled sample that is correctly formatted

                        //validate the pooled dates (try 2 different common formats)
                        for (String pooledDate : pooledDates) {
                            if (parseDate(pooledDate) == null) {
                                errors.addRowError(new ValidationException("Row " + rowIdx + ": Invalid pooled date '" + pooledDate + "'"));
                            }
                        }
                    } else {
                        errors.addRowError(new ValidationException("Row " + rowIdx + ": number of subjects does not match number of pooled sample dates"));
                    }
                } else {
                    errors.addRowError(new ValidationException("Row " + rowIdx + ": no sample date should be present for pooled samples"));
                }
            } else if (pooledDates.length > 0) {
                errors.addRowError(new ValidationException("Row " + rowIdx + ": no pooled sample dates should be present when there is only a single subject id"));
            }

            //Check to make sure that the source material matches one from the above query.  As long
            //as the spelling is the same (case can be different) it's fine.  Use the casing from the
            //source_material table when saving though.
            String sourceMaterial = row.getString("sourceMaterial");
            boolean foundValidSourceMaterial = false;
            for(String validSourceMaterial : validSourceMaterials) {
                if(validSourceMaterial.equalsIgnoreCase(sourceMaterial)) {
                    row.put("sourceMaterial", validSourceMaterial);
                    foundValidSourceMaterial = true;
                    break;
                }
            }
            if ("TestMaterial".equals(sourceMaterial)) {
                foundValidSourceMaterial = true;
            }

            if (!foundValidSourceMaterial) {
                errors.addRowError(new ValidationException("Row " + rowIdx + ": " + sourceMaterial + " is not a valid source material"));
                continue;
            }

            String well = row.getString("well");
            if (well == null) {
                errors.addRowError(new ValidationException("Row " + rowIdx + ": sample is missing well"));
                continue;
            }

            if (!wellMap.containsKey(well)) {
                errors.addRowError(new ValidationException("Row " + rowIdx + ": unknown well: " + well));
                continue;
            }

            if (distinctWells.contains(well)) {
                errors.addRowError(new ValidationException("Row " + rowIdx + ": another sample is already present in well: " + well));
                continue;
            }
            distinctWells.add(well);

            String uniqueSample = row.getString("uniqueSample");
            if (uniqueSample == null) {
                errors.addRowError(new ValidationException("Row " + rowIdx + ": sample is missing uniqueSample"));
                continue;
            }

            //validate the row's date
            if (row.get(DATE_FIELD) != null) {
                try {
                    Date date = ConvertHelper.convert(row.get(DATE_FIELD), Date.class);
                    _dateFormat.format(date);
                }
                catch (ConversionException | IllegalArgumentException e) {
                    errors.addRowError(new ValidationException("Row " + rowIdx + ": Invalid sample date"));
                }
            }
        }

        super.validateTemplate(u, c, protocol, templateId, title, json, errors);

        if (errors.hasErrors()) {
            throw errors;
        }
    }

    protected void calculateViralLoadForRoche(Map<String, Object> map)
    {
        //calculate VL
        Double copiesPerRxn = map.get("Concentration") == null ? null : ((Number)map.get("Concentration")).doubleValue();
        map.put("copiesPerRxn", copiesPerRxn);

        Double eluateVol = new Double((Integer)map.get("eluateVol"));
        Double volPerRxn = new Double((Integer)map.get("volPerRxn"));
        if (!map.containsKey("sampleVol"))
            map.put("sampleVol", 1.0);

        //This is the size (ml or mg) of the source material (plasma/serum/urine/etc.)
        Double sampleVol = Double.parseDouble(map.get("sampleVol").toString());

        Double viralLoad = 0.0;
        Double dilutionFactor = 0.0;
        if (copiesPerRxn != null && sampleVol > 0)
        {
            dilutionFactor = (1.0 / sampleVol) * (eluateVol / volPerRxn);
            viralLoad = dilutionFactor * copiesPerRxn;
        }
        map.put("dilutionfactor", dilutionFactor);
        map.put("viralLoad", viralLoad);
        map.remove("Standard");
        map.remove("Concentration");
    }

    protected class Parser extends DefaultAssayParser {
        private String HAS_RESULT = "__hasResult__";
        private int _assayId;
        final String[] lookup = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ,.".split("");
        //The expected number of columns in the import data
        private int _expectedColumnCount = Integer.MAX_VALUE;

        public Parser(AssayImportMethod method, Container c, User u, int assayId, int resultsColumnCount) {
            this(method, c, u ,assayId);
            _expectedColumnCount = resultsColumnCount;
        }

        public Parser(AssayImportMethod method, Container c, User u, int assayId) {
            super(method, c, u, assayId);
            _assayId = assayId;
        }

        @Override
        public Pair<ExpExperiment, ExpRun> saveBatch(JSONObject json, File file, String fileName, ViewContext ctx) throws BatchValidationException {
            int templateId = json.getInt("TemplateId");

            Pair<ExpExperiment, ExpRun> result = super.saveBatch(json, file, fileName, ctx);

            saveTemplate(ctx, templateId, result.second.getRowId());
            return result;
        }

        //Needs to be overridden within the Parser class of each ImportMethod that extends AbstractWNPRCImportMethod
        protected TabLoader getTabLoader(String contents) throws IOException {
            return null;
        }

        public int getAssayId() {
            return _assayId;
        }

        @Override
        protected List<Map<String, Object>> processRowsFromFile(List<Map<String, Object>> rows, ImportContext context) throws BatchValidationException {
            ParserErrors errors = context.getErrors();

            String keyProperty = "uniqueSample";
            Map<String, Map<String, Object>> templateRows = getTemplateRowMap(context, keyProperty);

            List<Map<String, Object>> newRows = new ArrayList<>();
            ListIterator<Map<String, Object>> rowsIter = rows.listIterator();
            int rowIdx = 0;

            //This means that the column headers were included either in the uploaded
            //excel file, or when copy/pasting.  Advance the iterator one position so
            //that processing starts from the first row of actual data instead
            if(templateRows.size() + 1 == rows.size()) {
                if (rowsIter.hasNext()) {
                    rowsIter.next();
                }
            }
            while (rowsIter.hasNext()) {
                rowIdx++;
                Map<String, Object> row = rowsIter.next();
                Map<String, Object> map = new CaseInsensitiveHashMap<>(row);

                //Make sure that the expected number of columns are present in the data
                if (row.size() != _expectedColumnCount) {
                    errors.addError("Improperly formatted row on line " + rowIdx + ", expected " + _expectedColumnCount + " cells");
                    continue;
                }

                appendPromotedResultFields(map, context);

                if (!map.containsKey(UNIQUE_FIELD) || map.get(UNIQUE_FIELD) == null || StringUtils.isEmpty((String) map.get(UNIQUE_FIELD))) {
                    errors.addError("Missing sample name for row: " + rowIdx);
                    continue;
                }
                if (map.get("well") != null) {
                    map.put("well", ((String) map.get("well")).toUpperCase());
                }
                if (map.get("sampleType") == null) {
                    map.put("sampleType", "vRNA");
                }

                if (!mergeTemplateRow(keyProperty, templateRows, map, context)) {
                    continue;
                }

                //these are not used
                map.remove("Include");
                map.remove("Status");

                if (map.get("uniqueSample") != null) {
                    map.put("objectid", uncompressUUID((String) map.get("uniqueSample")));
                }

                calculateViralLoadForRoche(map);

                //Check if it's a pooled sample and if it is split it out into multiple rows in the dataset
                map.put("pooled", false);
                String[] ids = !StringUtils.isEmpty((String) map.get("subjectId")) ? ((String) map.get("subjectId")).split(",\\s*") : new String[0];
                String[] pooledDates = !StringUtils.isEmpty((String) map.get("pooledDates")) ? ((String) map.get("pooledDates")).split("[^0-9/-]") : new String[0];
                for (int i = 0; i < ids.length; i++) {
                    Map<String, Object> newRow = new CaseInsensitiveHashMap<>(map);
                    if (ids.length > 1) {
                        String id = ids[i];
                        LocalDate pooledDate = parseDate(pooledDates[i]);
                        newRow.put("subjectId", id);
                        newRow.put("date", pooledDate);
                        newRow.put("pooled", true);
                    }
                    newRows.add(newRow);
                }
            }
            ensureTemplateRowsHaveResults(templateRows, context);
            errors.confirmNoErrors();

            return newRows;
        }

        protected void ensureTemplateRowsHaveResults(Map<String, Map<String, Object>> templateRows, ImportContext context) throws BatchValidationException {
            for (String key : templateRows.keySet()) {
                Map<String, Object> row = templateRows.get(key);
                if (!row.containsKey(HAS_RESULT)) {
                    context.getErrors().addError("Template row with key " + key + " does not have a result", Level.WARN);
                }
            }

            context.getErrors().confirmNoErrors();
        }

        //Uncompresses the Base64 encoded uuid back to its original standard format
        private String uncompressUUID(String compressObjectId) {
            String reg = "(?<=\\G..)";
            String[] base64Duples = compressObjectId.split(reg);
            int lastIndex = base64Duples.length - 1;
            StringBuilder base16Duples = new StringBuilder();
            int position = 0;
            for (String base64set : base64Duples) {
                int firstPart = Arrays.asList(lookup).indexOf(base64set.substring(0, 1));
                int secondPart = Arrays.asList(lookup).indexOf(base64set.substring(1, 2));

                int integer = (firstPart * 64) + secondPart;

                String hexString = Integer.toString(integer, 16);

                if (hexString.length() == 1) {
                    hexString = "00" + hexString;
                }
                else if (hexString.length() == 2) {
                    hexString = "0" + hexString;
                }
                else if (hexString.length() == 0) {
                    hexString = "000" + hexString;
                }

                if (position == lastIndex) {
                    hexString = hexString.substring(1);

                }
                base16Duples.append(hexString.toLowerCase());
                position++;

            }
            char[] objectId = base16Duples.toString().toCharArray();

            StringBuilder returnObjectId = new StringBuilder();

            returnObjectId.append(objectId, 0, 8);
            returnObjectId.append("-");
            returnObjectId.append(objectId, 8, 4);
            returnObjectId.append("-");
            returnObjectId.append(objectId, 12, 4);
            returnObjectId.append("-");
            returnObjectId.append(objectId, 16, 4);
            returnObjectId.append("-");
            returnObjectId.append(objectId, 20, 12);

            return returnObjectId.toString();
        }
    }

    //Check if the string is a date by checking a few different formats
    private LocalDate parseDate(String date) {
        for (DateTimeFormatter formatter : _pooledDateFormats) {
            try {
                return LocalDate.parse(date, formatter);
            } catch (DateTimeParseException e) {
                //ignore
            }
        }
        return null;
    }
}