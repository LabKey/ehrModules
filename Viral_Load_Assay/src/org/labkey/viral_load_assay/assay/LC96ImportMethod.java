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
import org.labkey.api.laboratory.assay.AssayParser;
import org.labkey.api.laboratory.assay.DefaultAssayParser;
import org.labkey.api.laboratory.assay.ImportContext;
import org.labkey.api.laboratory.assay.ParserErrors;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryHelper;
import org.labkey.api.query.ValidationException;
import org.labkey.api.reader.ColumnDescriptor;
import org.labkey.api.reader.TabLoader;
import org.labkey.api.security.User;
import org.labkey.api.settings.AppProps;
import org.labkey.api.util.Pair;
import org.labkey.api.util.ResultSetUtil;
import org.labkey.api.view.ViewContext;

import java.io.File;
import java.io.IOException;
import java.io.StringReader;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.ListIterator;
import java.util.Map;
import java.util.Set;

public class LC96ImportMethod extends AbstractWNPRCImportMethod {
    public static final String NAME = "LC96";
    private static final String UNIQUE_FIELD = "uniqueSample";
    private static final String DATE_FIELD = "date";

    protected final static SimpleDateFormat _dateFormat = new SimpleDateFormat("yyyy-MM-dd");

    public LC96ImportMethod(String providerName) {
        super(providerName);
    }

    @Override
    public String getName() {
        return NAME;
    }

    @Override
    public String getLabel() {
        return NAME;
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
    public String getTooltip() {
        return "Choose this option to upload data directly from the output of a Roche LC96.  NOTE: this expects the sample names to be formatted in a specific manner.  Please see instructions above the results section";
    }

    @Override
    public String getTemplateInstructions() {
        return "This is designed to accept the output directly from a Roche96 Light Cycler.  If using the Copy/Paste method please copy all data, including the column headers.";
    }

    public AssayParser getFileParser(Container c, User u, int assayId) {
        return new Parser(this, c, u, assayId);
    }

    @Override
    public String getExampleDataUrl(ViewContext ctx) {
        return AppProps.getInstance().getContextPath() + "/Viral_Load_Assay/SampleData/lc96.txt";
    }

    @Override
    public List<String> getTemplateDownloadColumns() {

        ArrayList<String> exportColumns = new ArrayList<>();
        exportColumns.add("uniqueSample");
        exportColumns.add("well");
        exportColumns.add("subjectId");
        exportColumns.add("date");

        return exportColumns;
    }

    @Override
    public JSONObject getMetadata(ViewContext ctx, ExpProtocol protocol) {
        JSONObject meta = super.getMetadata(ctx, protocol);

        JSONObject runMeta = meta.getJSONObject("Run");
        runMeta.put("slope", new JSONObject().put("hidden", true));
        runMeta.put("intercept", new JSONObject().put("hidden", true));
        runMeta.put("rSquared", new JSONObject().put("hidden", true));
        runMeta.put("instrument", new JSONObject().put("defaultValue", "LC96"));
        meta.put("Run", runMeta);

        JSONObject resultsMeta = meta.getJSONObject("Results");

        JSONObject objectId = getJsonObject(resultsMeta, "objectid");
        objectId.put("hidden", true);
        resultsMeta.put("objectid", objectId);

        meta.put("Results", resultsMeta);

        return meta;
    }

    @Override
    public void validateTemplate(User u, Container c, ExpProtocol protocol, @Nullable Integer templateId, String title, JSONObject json, BatchValidationException errors) throws BatchValidationException {
        //ensure each subject/date has at least 2 neg controls
        JSONObject resultDefaults = json.optJSONObject("Results");
        JSONArray rawResults = json.getJSONArray("ResultRows");
        Set<String> distinctWells = new HashSet<>();
        Map<Object, Object> wellMap = getWellMap96("well_96", "addressbyrow_96");

        String[] requiredFields = new String[]{"well", "uniqueSample", "subjectId", "date", "sourceMaterial"};
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

        int rowIdx = 0;
        for (JSONObject row : rawResults.toJSONObjectArray()) {
            rowIdx++;

            for (String prop : resultDefaults.keySet()) {
                row.put(prop, resultDefaults.get(prop));
            }

            boolean missingRequired = false;
            for (String field : requiredFields) {
                if (row.get(field) == null || StringUtils.isEmpty(row.getString(field))) {
                    if (field.equals("date") && "Standard".equals(row.get("category"))) {
                        //There is no error in this case
                    } else {
                        errors.addRowError(new ValidationException("Row " + rowIdx + ": missing required field: " + field));
                        missingRequired = true;
                        continue;
                    }
                }
            }

            if (missingRequired) {
                continue;
            }

            String sourceMaterial = row.getString("sourceMaterial");
            boolean foundValidSourceMaterial = false;
            for(String validSourceMaterial : validSourceMaterials) {
                if(validSourceMaterial.equalsIgnoreCase(sourceMaterial)) {
                    row.put("sourceMaterial", validSourceMaterial);
                    foundValidSourceMaterial = true;
                    break;
                }
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


    private class Parser extends DefaultAssayParser {
        private String HAS_RESULT = "__hasResult__";
        private int _assayId;
        final String[] lookup = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ,.".split("");

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

        protected TabLoader getTabLoader(String contents) throws IOException {
            TabLoader loader = new TabLoader(new StringReader(contents), false);
            ColumnDescriptor[] cols = new ColumnDescriptor[]{
                    new ColumnDescriptor("color", String.class), //not shown by default
                    new ColumnDescriptor("well", String.class),
                    new ColumnDescriptor("uniqueSample", String.class),
                    new ColumnDescriptor("geneName", String.class), //not shown by default
                    new ColumnDescriptor("Cp", Double.class),
                    new ColumnDescriptor("Concentration", Double.class),
                    new ColumnDescriptor("call", String.class), //not shown by default
                    new ColumnDescriptor("excluded", String.class), //not shown by default
                    new ColumnDescriptor("category", String.class),
                    new ColumnDescriptor("Standard", Integer.class),
                    new ColumnDescriptor("cqMean", Double.class), //not shown by default
                    new ColumnDescriptor("cqError", Double.class), //not shown by default
                    new ColumnDescriptor("concentrationMean", Double.class), //not shown by default
                    new ColumnDescriptor("concentrationError", Double.class), //not shown by default
                    new ColumnDescriptor("replicateGroup", String.class), //not shown by default
                    new ColumnDescriptor("dye", String.class), //not shown by default
                    new ColumnDescriptor("editedCall", String.class), //not shown by default
                    new ColumnDescriptor("slope", Double.class), //not shown by default
                    new ColumnDescriptor("epf", Double.class), //not shown by default
                    new ColumnDescriptor("failure", String.class), //not shown by default
                    new ColumnDescriptor("notes", String.class), //not shown by default
                    new ColumnDescriptor("samplePrepNotes", String.class), //not shown by default
                    new ColumnDescriptor("number", Integer.class) //not shown by default
            };

            loader.setColumns(cols);
            return loader;
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

            if(templateRows.size() + 1 == rows.size()) {
                if (rowsIter.hasNext()) {
                    rowsIter.next();
                }
            }
            while (rowsIter.hasNext()) {
                rowIdx++;
                Map<String, Object> row = rowsIter.next();
                Map<String, Object> map = new CaseInsensitiveHashMap<>(row);

                if (row.size() < 6) {
                    errors.addError("Improperly formatted row on line " + rowIdx + ", excepted 6 cells");
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

                if (!mergeTemplateRow(keyProperty, templateRows, map, context))
                    continue;

                //these are not used
                map.remove("Include");
                map.remove("Status");

                if (map.get("uniqueSample") != null) {
                    map.put("objectid", uncompressUUID((String) map.get("uniqueSample")));
                }

                calculateViralLoadForRoche(map);
                newRows.add(map);
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
}
