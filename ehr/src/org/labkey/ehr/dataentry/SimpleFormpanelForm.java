package org.labkey.ehr.dataentry;

import org.apache.commons.lang3.StringUtils;
import org.labkey.api.ehr.dataentry.AbstractDataEntryForm;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.module.Module;

import java.util.ArrayList;
import java.util.List;

/**
 * User: bimber
 * Date: 4/27/13
 * Time: 11:03 AM
 */
public class SimpleFormpanelForm extends AbstractDataEntryForm
{
    private SimpleFormpanelForm(Module owner, String name, String label, String category, List<FormSection> sections)
    {
        super(owner, name, label, category, sections);
    }

    public static SimpleFormpanelForm create(Module owner, String schemaName, String queryName, String category)
    {
        List<FormSection> sections = new ArrayList<FormSection>();
        String label = StringUtils.capitalize(queryName);
        sections.add(new SimpleFormPanel(schemaName, queryName, label));

        return new SimpleFormpanelForm(owner, queryName, label, category, sections);
    }
}
