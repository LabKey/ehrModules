package org.labkey.ehr.dataentry;

import org.labkey.api.ehr.dataentry.AbstractFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.util.Pair;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 4/27/13
 * Time: 10:54 AM
 */
public class SimpleFormPanel extends SimpleFormSection
{
    public SimpleFormPanel(String schemaName, String queryName, String label)
    {
        super(schemaName, queryName, label, "ehr-formpanel");
    }
}
