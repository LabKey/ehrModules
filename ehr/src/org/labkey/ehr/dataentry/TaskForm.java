package org.labkey.ehr.dataentry;

import org.apache.commons.lang3.StringUtils;
import org.labkey.api.ehr.dataentry.AbstractDataEntryForm;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.module.Module;

import java.util.ArrayList;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 4/27/13
 * Time: 12:45 PM
 */
public class TaskForm extends AbstractDataEntryForm
{
    private TaskForm(Module owner, String name, String label, String category, List<FormSection> sections)
    {
        super(owner, name, label, category, sections);
    }

    public static TaskForm create(Module owner, String schemaName, String queryName, String category)
    {
        List<FormSection> sections = new ArrayList<FormSection>();
        String label = StringUtils.capitalize(queryName);
        sections.add(new SimpleFormPanel(schemaName, queryName, label));

        return new TaskForm(owner, queryName, label, category, sections);
    }
}
