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

import org.apache.commons.lang3.StringUtils;
import org.json.JSONObject;
import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.data.Container;
import org.labkey.api.exp.api.ExpProtocol;
import org.labkey.api.laboratory.assay.AssayImportMethod;
import org.labkey.api.laboratory.assay.AssayParser;
import org.labkey.api.laboratory.assay.DefaultAssayParser;
import org.labkey.api.laboratory.assay.ImportContext;
import org.labkey.api.laboratory.assay.ParserErrors;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.ValidationException;
import org.labkey.api.reader.ColumnDescriptor;
import org.labkey.api.reader.TabLoader;
import org.labkey.api.security.User;
import org.labkey.api.settings.AppProps;
import org.labkey.api.view.ViewContext;

import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;
import java.util.ListIterator;
import java.util.Map;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 9/26/12
 * Time: 3:52 PM
 */
public class LightCyclerImportMethod extends LC480ImportMethod
{
    public static final String NAME = "Light Cycler";

    public LightCyclerImportMethod(String providerName)
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
    public boolean hideTemplateDownload()
    {
        return true;
    }

    @Override
    public String getTooltip()
    {
        return "Choose this option to upload data directly from the output of a Roche Light Cycle.  NOTE: this expects the sample names to be formatted in a specific manner.  Please see instructions above the results section";
    }

    @Override
    public String getTemplateInstructions()
    {
        return "This is designed to accept the output directly from a Roche Light Cycler.  However, in order for the results to be recognized by the system, the sample names must be formatted in a specific manner.  This is: subject Id, undescore, sample date, underscore, plasma volume, underscore, comments.  An example is: 'patient123_2010-03-04_1_Sample Run for Jim'.  The comments and/or plasma volume can be ommited: 'patient123_2010-03-04'.  If no plasma volume is provided, it will assume 1mL was used.";
    }

    public AssayParser getFileParser(Container c, User u, int assayId)
    {
        return new Parser(this, c, u, assayId);
    }

    @Override
    public String getExampleDataUrl(ViewContext ctx)
    {
        return AppProps.getInstance().getContextPath() + "/Viral_Load_Assay/SampleData/LC_data.txt";
    }

    @Override
    public JSONObject getMetadata(ViewContext ctx, ExpProtocol protocol)
    {
        JSONObject meta = super.getMetadata(ctx, protocol);

        JSONObject runMeta = meta.getJSONObject("Run");
        runMeta.put("instrument", new JSONObject().put("defaultValue", "Light Cycler"));
        meta.put("Run", runMeta);

        return meta;
    }

    private class Parser extends DefaultAssayParser
    {
        private static final String NAME_FIELD = "Name";

        public Parser(AssayImportMethod method, Container c, User u, int assayId)
        {
            super(method, c, u, assayId);
        }

        protected TabLoader getTabLoader(String contents) throws IOException
        {
            TabLoader loader = new TabLoader(new StringReader(contents), false);
            ColumnDescriptor[] cols = new ColumnDescriptor[]{
                new ColumnDescriptor("Include", String.class),
                new ColumnDescriptor("Pos", String.class),
                new ColumnDescriptor("Name", String.class),
                new ColumnDescriptor("Cp", Double.class),
                new ColumnDescriptor("Concentration", Double.class),
                new ColumnDescriptor("Standard", Integer.class),
                new ColumnDescriptor("Status", String.class)
            };

            loader.setColumns(cols);
            return loader;
        }

        @Override
        protected List<Map<String, Object>> processRowsFromFile(List<Map<String, Object>> rows, ImportContext context) throws BatchValidationException
        {
            ParserErrors errors = context.getErrors();

            List<Map<String, Object>> newRows = new ArrayList<>();
            ListIterator<Map<String, Object>> rowsIter = rows.listIterator();
            int rowIdx = 0;
            while (rowsIter.hasNext())
            {
                rowIdx++;
                Map<String, Object> row = rowsIter.next();
                Map<String, Object> map = new CaseInsensitiveHashMap<>(row);

                if (row.size() < 6)
                {
                    errors.addError("Improperly formatted row on line " + rowIdx + ", expected 6 cells");
                    continue;
                }

                appendPromotedResultFields(map, context);

                if (!map.containsKey("Name") || map.get("Name") == null || StringUtils.isEmpty((String)map.get("Name")))
                {
                    errors.addError("Missing sample name for row: " + rowIdx);
                    continue;
                }

                //these are not used
                map.remove("Include");
                map.remove("Status");

                //this is a slightly funny way to pass sample info, but it needs to be supported for legacy installs
                //they name the samples using a specific format, which gets parsed here.  If first token either matches the enum,
                //then it is a standard or control otherwise we treat it as a general experimental sample.
                String[] nameParts = StringUtils.split((String) map.get("Name"), "_");
                Category cat;
                try
                {
                    try
                    {
                        cat = Category.valueOf(nameParts[0]);
                        cat.parseSampleName(map, NAME_FIELD);
                    }
                    catch (IllegalArgumentException e)
                    {
                        Category.Unknown.parseSampleName(map, NAME_FIELD);
                    }
                }
                catch (ValidationException e)
                {
                    errors.addError(e.getMessage());
                }

                map.put("well", map.get("Pos"));
                map.remove("Pos");

                calculateViralLoadForRoche(map);

                newRows.add(map);
            }

            errors.confirmNoErrors();

            return newRows;
        }
    }
}
