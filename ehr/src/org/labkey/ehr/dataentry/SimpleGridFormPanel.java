package org.labkey.ehr.dataentry;

import org.labkey.api.ehr.dataentry.AbstractFormSection;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 4/27/13
 * Time: 10:54 AM
 */
public class SimpleGridFormPanel extends SimpleFormSection
{
    public SimpleGridFormPanel(String schemaName, String queryName, String label)
    {
        super(schemaName, queryName, label, "ehr-gridformpanel");
    }
}
