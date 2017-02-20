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
import org.labkey.api.exp.api.ExpProtocol;
import org.labkey.api.laboratory.assay.DefaultAssayImportMethod;
import org.labkey.api.query.ValidationException;
import org.labkey.api.util.DateUtil;
import org.labkey.api.view.ViewContext;
import org.labkey.viral_load_assay.Viral_Load_Manager;

import java.sql.Timestamp;
import java.util.Date;
import java.util.Map;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 9/26/12
 * Time: 3:52 PM
 */
class DefaultVLImportMethod extends DefaultAssayImportMethod
{
    public DefaultVLImportMethod(String providerName)
    {
        super(providerName);
    }

    @Override
    public JSONObject getMetadata(ViewContext ctx, ExpProtocol protocol)
    {
        JSONObject meta = super.getMetadata(ctx, protocol);
        Viral_Load_Manager.get().getDefaultAssayMetadata(meta);
        return meta;
    }

    @Override
    public boolean supportsRunTemplates()
    {
        return false;
    }

    protected enum Category {
        STD(){
            public void parseSampleName(Map<String, Object> row, String fieldName) throws ValidationException
            {
                String[] nameParts = StringUtils.split((String) row.get(fieldName), "_");
                row.put("category", "Standard");
                row.put("subjectId", nameParts[0] + "_" + nameParts[1]);
            }
        },
        CTL(){
            public void parseSampleName(Map<String, Object> row, String fieldName) throws ValidationException
            {
                String[] nameParts = StringUtils.split((String)row.get(fieldName), "_");
                row.put("category", "Control");
                if (nameParts.length == 1)
                {
                    row.put("subjectId", nameParts[0]);
                }
                else
                {
                    row.put("subjectId", nameParts[0] + "_" + nameParts[1]);
                }
                row.put("date", null);
                if (nameParts.length > 2)
                {
                    row.put("sampleVol", Double.parseDouble(nameParts[2]));
                }
                else
                {
                    row.put("sampleVol", 1.0);
                }
            }
        },
        Unknown(){
            public void parseSampleName(Map<String, Object> row, String fieldName) throws ValidationException
            {
                try
                {
                    String[] nameParts = StringUtils.split((String)row.get(fieldName), "_");
                    row.put("category", "Unknown");
                    row.put("subjectId", nameParts[0]);

                    String dateText = nameParts[1];
                    dateText = dateText.replaceAll("\\.", "-");
                    long date = DateUtil.parseDate(dateText);

                    new Timestamp(date);
                    row.put("date", new Date(date));

                    if (nameParts.length > 2)
                    {
                        row.put("sampleVol", Double.parseDouble(nameParts[2]));
                    }
                    else
                    {
                        row.put("sampleVol", 1.0);
                    }

                    if (nameParts.length > 3)
                    {
                        StringBuilder s = new StringBuilder();
                        for (int i = 3; i < nameParts.length; i++)
                        {
                            s.append(nameParts[i]);

                            if (i != (nameParts.length-1))
                                s.append("_");
                        }
                        row.put("comment", s.toString());
                    }
                }
                catch (Exception e)
                {
                    throw new ValidationException("Unable to parse the sample: " + row.get(fieldName));
                }
            }
        };

        Category()
        {

        }

        public abstract void parseSampleName(Map<String, Object> row, String fieldName) throws ValidationException;
    }

    protected void calculateViralLoadForRoche(Map<String, Object> map)
    {
        //calculate VL
        Object concentration = map.get("Concentration");
        Double copiesPerRxn = concentration == null ? null : (concentration instanceof Number ? ((Number)concentration).doubleValue() : Double.parseDouble(map.get("Concentration").toString()));
        map.put("copiesPerRxn", copiesPerRxn);

        Double cp = (Double)map.get("Cp");
        Double eluateVol = new Double((Integer)map.get("eluateVol"));
        Double volPerRxn = new Double((Integer)map.get("volPerRxn"));
        if (!map.containsKey("sampleVol"))
            map.put("sampleVol", 1.0);

        Double sampleVol = Double.parseDouble(map.get("sampleVol").toString());

        Double viralLoad;
        if (copiesPerRxn != null)
        {
            Double dilutionFactor = (1.0 / sampleVol) * (eluateVol / volPerRxn);
            viralLoad = dilutionFactor * copiesPerRxn;
        }
        else
        {
            viralLoad = 0.0;
        }
        map.put("viralLoad", viralLoad);
        map.remove("Standard");
        map.remove("Concentration");
    }
}
