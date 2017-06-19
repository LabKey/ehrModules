package org.labkey.api.ehr.dataentry.forms;

import org.labkey.api.data.TableInfo;
import org.labkey.api.ehr.dataentry.SimpleFormSection;
import org.labkey.api.query.FieldKey;
import org.labkey.api.view.template.ClientDependency;

import java.util.List;

public class NewAnimalFormSection  extends SimpleFormSection
{
    private boolean _allowSetSpecies = false;

    public NewAnimalFormSection(String schemaName, String queryName, String label, boolean allowSetSpecies)
    {
        super(schemaName, queryName, label, "ehr-gridpanel");
        _allowSetSpecies = allowSetSpecies;

        addClientDependency(ClientDependency.fromPath("ehr/window/AnimalIdSeriesWindow.js"));
        addClientDependency(ClientDependency.fromPath("ehr/form/field/AnimalIdGeneratorField.js"));
    }

    @Override
    public List<String> getTbarButtons()
    {
        List<String> defaults = super.getTbarButtons();

        int idx = defaults.indexOf("SELECTALL");
        assert idx > -1;
        defaults.add("ANIMAL_ID_SERIES");

        return defaults;
    }

    @Override
    protected List<FieldKey> getFieldKeys(TableInfo ti)
    {
        List<FieldKey> keys = super.getFieldKeys(ti);

        if (_allowSetSpecies)
        {
            int insertIdx = 0;
            for (FieldKey key : keys)
            {
                insertIdx++;

                if ("gender".equals(key.getName()))
                {
                    break;
                }
            }

            keys.add(insertIdx, FieldKey.fromString("Id/demographics/species"));
            keys.add(insertIdx + 1, FieldKey.fromString("Id/demographics/geographic_origin"));
        }

        return keys;
    }
}

