package org.labkey.ehr.dataentry;

import org.apache.commons.lang3.StringUtils;
import org.labkey.api.data.Container;
import org.labkey.api.ehr.dataentry.AbstractDataEntryForm;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.module.Module;
import org.labkey.api.security.User;

import java.util.ArrayList;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 4/27/13
 * Time: 11:03 AM
 */
public class SimpleFormType extends AbstractDataEntryForm
{
    private SimpleFormType(Module owner, String name, String label, String category, List<FormSection> sections)
    {
        super(owner, name, label, category, sections);
    }

    public static SimpleFormType create(Module owner, String schemaName, String queryName, String category)
    {
        List<FormSection> sections = new ArrayList<FormSection>();
        String label = StringUtils.capitalize(queryName);
        sections.add(new SimpleFormPanel(schemaName, queryName, label));

        return new SimpleFormType(owner, queryName, label, category, sections);
    }
}
