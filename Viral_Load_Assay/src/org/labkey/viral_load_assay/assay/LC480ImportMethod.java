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

import org.json.old.JSONObject;
import org.labkey.api.data.Container;
import org.labkey.api.exp.api.ExpProtocol;
import org.labkey.api.laboratory.assay.AssayImportMethod;
import org.labkey.api.laboratory.assay.AssayParser;
import org.labkey.api.reader.ColumnDescriptor;
import org.labkey.api.reader.TabLoader;
import org.labkey.api.security.User;
import org.labkey.api.settings.AppProps;
import org.labkey.api.view.ViewContext;

import java.io.IOException;
import java.io.StringReader;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 9/15/12
 * Time: 7:29 AM
 */
public class LC480ImportMethod extends AbstractWNPRCImportMethod
{
    public static final String NAME = "LC480";
    public static final int RESULTS_COLUMN_COUNT = 7;

    public LC480ImportMethod(String providerName)
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
        return "Choose this option to upload data from the output of a Roche LC480.  Please see instructions above the results section";
    }

    @Override
    public String getTemplateInstructions()
    {
        return "This is designed to accept the output directly from a Roche480 Light Cycler.  If using the Copy/Paste method be sure to copy all data, including the column headers.";
    }

    @Override
    public AssayParser getFileParser(Container c, User u, int assayId)
    {
        return new Parser(this, c, u, assayId);
    }

    @Override
    public String getExampleDataUrl(ViewContext ctx)
    {
        return AppProps.getInstance().getContextPath() + "/Viral_Load_Assay/SampleData/lc480.txt";
    }

    @Override
    public JSONObject getMetadata(ViewContext ctx, ExpProtocol protocol)
    {
        JSONObject meta = super.getMetadata(ctx, protocol);

        JSONObject runMeta = meta.getJSONObject("Run");
        runMeta.put("instrument", new JSONObject().put("defaultValue", "LC480"));
        meta.put("Run", runMeta);

        return meta;
    }

    private class Parser extends AbstractWNPRCImportMethod.Parser
    {
        private static final String NAME_FIELD = "Name";

        public Parser(AssayImportMethod method, Container c, User u, int assayId)
        {
            super(method, c, u, assayId, LC480ImportMethod.RESULTS_COLUMN_COUNT);
        }

        @Override
        protected TabLoader getTabLoader(String contents) throws IOException
        {
            TabLoader loader = new TabLoader(new StringReader(contents), false);
            //These are the expected columns (in order) of the LC480 import data
            ColumnDescriptor[] cols = new ColumnDescriptor[]{
                    new ColumnDescriptor("Include", String.class),
                    new ColumnDescriptor("Pos", String.class),
                    new ColumnDescriptor("uniqueSample", String.class),
                    new ColumnDescriptor("Cp", Double.class),
                    new ColumnDescriptor("Concentration", Double.class),
                    new ColumnDescriptor("Standard", Integer.class),
                    new ColumnDescriptor("Status", String.class)
            };

            loader.setColumns(cols);
            return loader;
        }
    }
}
