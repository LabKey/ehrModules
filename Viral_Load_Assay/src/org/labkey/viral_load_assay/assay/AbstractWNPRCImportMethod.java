package org.labkey.viral_load_assay.assay;

import org.json.JSONObject;
import org.labkey.api.exp.api.ExpProtocol;
import org.labkey.api.view.ViewContext;

import java.util.Map;

public class AbstractWNPRCImportMethod extends DefaultVLImportMethod
{
    public AbstractWNPRCImportMethod(String providerName)
    {
        super(providerName);
    }

    @Override
    public JSONObject getMetadata(ViewContext ctx, ExpProtocol protocol)
    {
        JSONObject meta = super.getMetadata(ctx, protocol);

        //Add WNPRC-specific global changes here.

        JSONObject resultsMeta = meta.getJSONObject("Results");

        JSONObject eluateMap = getJsonObject(resultsMeta, "eluateVol");
        eluateMap.put("defaultValue", 50);
        eluateMap.put("setGlobally", true);

        JSONObject sourceMaterial = getJsonObject(resultsMeta, "sourceMaterial");
        sourceMaterial.put("setGlobally", false);

        resultsMeta.put("eluateVol", eluateMap);
        resultsMeta.put("sourceMaterial", sourceMaterial);

        meta.put("Results", resultsMeta);

        return meta;
    }

    @Override
    public JSONObject getSupplementalTemplateMetadata()
    {
        JSONObject ret = new JSONObject();
        JSONObject domainMeta = new JSONObject();
        JSONObject resultsMeta = new JSONObject();

        JSONObject sourceMaterial = getJsonObject(resultsMeta, "sourceMaterial");
        sourceMaterial.put("defaultValue", "Plasma");
        sourceMaterial.put("setGlobally", false);
        sourceMaterial.put("hidden", false);
        sourceMaterial.put("required", true);
        resultsMeta.put("sourceMaterial", sourceMaterial);

        JSONObject sampleId = getJsonObject(resultsMeta, "sampleId");
        sampleId.put("hidden", true);
        resultsMeta.put("sampleId", sampleId);

        JSONObject sampleType = getJsonObject(resultsMeta, "sampleType");
        sampleType.put("setGlobally", true);
        sampleType.put("hidden", false);
        sampleType.put("required", true);
        resultsMeta.put("sampleType", sampleType);

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

        /*******************************************
         * Hide all of the new assay columns - End *
         *******************************************/

        domainMeta.put("Results", resultsMeta);
        ret.put("domains", domainMeta);

        return ret;
    }

    protected void calculateViralLoadForRoche(Map<String, Object> map)
    {
        //calculate VL
        Double copiesPerRxn = map.get("Concentration") == null ? null : ((Number)map.get("Concentration")).doubleValue();
        map.put("copiesPerRxn", copiesPerRxn);

        Double eluateVol = new Double((Integer)map.get("eluateVol"));
        Double volPerRxn = new Double((Integer)map.get("volPerRxn"));
        if (!map.containsKey("sampleVol"))
            map.put("sampleVol", 0.0);

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
}