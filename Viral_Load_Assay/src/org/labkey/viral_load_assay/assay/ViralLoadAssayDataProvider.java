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

import org.json.JSONObject;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.laboratory.NavItem;
import org.labkey.api.laboratory.SimpleSettingsItem;
import org.labkey.api.laboratory.assay.AbstractAssayDataProvider;
import org.labkey.api.module.Module;
import org.labkey.api.security.User;
import org.labkey.api.view.ViewContext;
import org.labkey.viral_load_assay.Viral_Load_AssayModule;
import org.labkey.viral_load_assay.Viral_Load_Manager;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 9/28/12
 * Time: 4:17 PM
 */
public class ViralLoadAssayDataProvider extends AbstractAssayDataProvider
{
    public ViralLoadAssayDataProvider(Module m)
    {
        _providerName = Viral_Load_Manager.VL_ASSAY_PROVIDER_NAME;
        _module = m;

        _importMethods.add(new DefaultVLImportMethod(_providerName));
        _importMethods.add(new LC480ImportMethod(_providerName));
        _importMethods.add(new LightCyclerImportMethod(_providerName));
        _importMethods.add(new ABI7500ImportMethod(_providerName));
    }

    @Override
    public JSONObject getTemplateMetadata(ViewContext ctx)
    {
        JSONObject meta = super.getTemplateMetadata(ctx);
        JSONObject domainMeta = meta.getJSONObject("domains");
        Viral_Load_Manager.get().getDefaultAssayMetadata(domainMeta);

        JSONObject runMeta = getJsonObject(domainMeta, "Run");
        String[] hiddenRunFields = new String[]{"instrument", "slope", "intercept", "rSquared"};
        for (String field : hiddenRunFields)
        {
            JSONObject json = getJsonObject(runMeta, field);
            json.put("hidden", true);
            runMeta.put(field, json);
        }
        domainMeta.put("Run", runMeta);

        JSONObject resultMeta = getJsonObject(domainMeta, "Results");
        String[] hiddenResultFields = new String[]{"viralLoad", "viralLoadScientific", "copiesPerRxn", "cp", "qcflag", "requestid", "dilutionFactor", "Run", "sampleType", "eluateVol", "volPerRxn", "sourceMaterial"};
        for (String field : hiddenResultFields)
        {
            JSONObject json = getJsonObject(resultMeta, field);
            json.put("hidden", true);
            json.put("required", false);
            resultMeta.put(field, json);
        }

        String[] requiredFields = new String[]{"well", "subjectId", "category"};
        for (String field : requiredFields)
        {
            JSONObject json = getJsonObject(resultMeta, field);
            json.put("nullable", false);
            json.put("allowBlank", false);
            resultMeta.put(field, json);
        }

        String[] globalResultFields = new String[]{"assayId", "sampleType", "eluateVol", "volPerRxn", "sourceMaterial"};
        for (String field : globalResultFields)
        {
            JSONObject json = getJsonObject(resultMeta, field);
            json.put("setGlobally", true);
            resultMeta.put(field, json);
        }

        domainMeta.put("Results", resultMeta);

        meta.put("domains", domainMeta);
        meta.put("colOrder", Arrays.asList("plate", "well", "category", "subjectId", "date", "sampleVol"));
        meta.put("showPlateLayout", true);
        //meta.put("plateLayoutConfig", null);

        return meta;
    }

    @Override
    public List<NavItem> getSettingsItems(Container c, User u)
    {
        List<NavItem> items = new ArrayList<NavItem>();
        String categoryName = "Viral Load Assay";
        if (ContainerManager.getSharedContainer().equals(c))
        {
            items.add(new SimpleSettingsItem(this, Viral_Load_AssayModule.SCHEMA_NAME, "Assays", categoryName, "Assay Types"));
            items.add(new SimpleSettingsItem(this, Viral_Load_AssayModule.SCHEMA_NAME, "VL_Instrument", categoryName, "Instruments"));
            items.add(new SimpleSettingsItem(this, Viral_Load_AssayModule.SCHEMA_NAME, "VL_Technique", categoryName, "Techniques"));
            items.add(new SimpleSettingsItem(this, Viral_Load_AssayModule.SCHEMA_NAME, "Fluors", categoryName, "Fluors"));
            items.add(new SimpleSettingsItem(this, Viral_Load_AssayModule.SCHEMA_NAME, "abi7500_detectors", categoryName, "ABI7500 Detectors"));
        }

        return items;
    }
}
