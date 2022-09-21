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
package org.labkey.viral_load_assay;

import org.json.old.JSONObject;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.JdbcType;
import org.labkey.api.data.TableInfo;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.SchemaKey;
import org.labkey.api.query.UserSchema;
import org.labkey.api.view.ViewContext;

import java.text.DecimalFormat;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 9/15/12
 * Time: 7:43 AM
 */
public class Viral_Load_Manager
{
    private static final Viral_Load_Manager _instance = new Viral_Load_Manager();

    public static String VL_ASSAY_PROVIDER_NAME = "Viral Loads";

    //private static final Logger _log = LogManager.getLogger(Viral_Load_Manager.class);

    private Viral_Load_Manager()
    {
        // prevent external construction with a private default constructor
    }

    public static Viral_Load_Manager get()
    {
        return _instance;
    }

    public JSONObject getDefaultAssayMetadata(JSONObject meta, ViewContext ctx){
        JSONObject runMeta = getJsonObject(meta, "Run");
        JSONObject technique = getJsonObject(runMeta, "technique");
        technique.put("defaultValue", "Lifson 1-Step VL");
        runMeta.put("technique", technique);
        meta.put("Run", runMeta);

        JSONObject resultsMeta = getJsonObject(meta, "Results");
        resultsMeta.put("eluateVol", new JSONObject().put("setGlobally", true));

        JSONObject volMap = getJsonObject(resultsMeta, "volPerRxn");
        volMap.put("defaultValue", 5);
        volMap.put("setGlobally", true);
        resultsMeta.put("volPerRxn", volMap);

        JSONObject assayId = getJsonObject(resultsMeta, "assayId");
        assayId.put("setGlobally", true);
        assayId.put("defaultValue", "SIVmac239-Gag");
        resultsMeta.put("assayId", assayId);

        JSONObject sourceMaterial = getJsonObject(resultsMeta, "sourceMaterial");
        sourceMaterial.put("setGlobally", true);
        sourceMaterial.put("defaultValue", "Plasma");
        resultsMeta.put("sourceMaterial", sourceMaterial);

        JSONObject sampleType = getJsonObject(resultsMeta, "sampleType");
        sampleType.put("setGlobally", true);
        sampleType.put("defaultValue", "vRNA");
        resultsMeta.put("sampleType", sampleType);

        JSONObject plate = getJsonObject(resultsMeta, "plate");
        plate.put("hidden", true);
        resultsMeta.put("plate", plate);

        // This overrides extjs default decimalPrecision of 2, only where specified by metadata from the server. Makes input
        // forms respect formatString on column metadata. Decimals will still round to two places if formatString not set.
        // Consider: Move somewhere more central?
        UserSchema viralAssaySchema = QueryService.get().getUserSchema(ctx.getUser(), ctx.getContainer(), SchemaKey.fromString("assay.Viral_Loads.Viral_Load"));
        if (null != viralAssaySchema)
        {
            TableInfo resultTable = viralAssaySchema.getTable("Data");
            if (null != resultTable)
            {
                for (ColumnInfo column : resultTable.getColumns())
                {
                    if (column.getJdbcType().equals(JdbcType.DECIMAL) || column.getJdbcType().equals(JdbcType.DOUBLE))
                    {
                        String format = column.getFormat();
                        if (null != format)
                        {
                            int decimals = new DecimalFormat(format).getMaximumFractionDigits();
                            JSONObject editor = new JSONObject().put("decimalPrecision", decimals);
                            var col = (JSONObject) resultsMeta.get(column.getName());
                            if (null == col)
                                col = new JSONObject();

                            col.put("editorConfig", editor);
                            resultsMeta.put(column.getName(), col);
                        }
                    }
                }
            }
        }

        meta.put("Results", resultsMeta);

        return meta;
    }

    public static JSONObject getJsonObject(JSONObject parent, String key)
    {
        return parent.containsKey(key) ? parent.getJSONObject(key): new JSONObject();
    }
}
