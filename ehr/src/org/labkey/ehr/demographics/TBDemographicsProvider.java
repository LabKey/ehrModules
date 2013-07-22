package org.labkey.ehr.demographics;

import org.labkey.api.data.CompareType;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.ehr.demographics.AbstractListDemographicsProvider;
import org.labkey.api.query.FieldKey;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

/**
 * User: bimber
 * Date: 7/14/13
 * Time: 10:29 AM
 */
public class TBDemographicsProvider extends AbstractListDemographicsProvider
{
    public TBDemographicsProvider()
    {
        super("demographicsMostRecentTBDate", "tb");
    }

    protected Set<FieldKey> getFieldKeys()
    {
        Set<FieldKey> keys = new HashSet<FieldKey>();
        keys.add(FieldKey.fromString("Id"));
        keys.add(FieldKey.fromString("MostRecentTBDate"));
        keys.add(FieldKey.fromString("MonthsSinceLastTB"));
        keys.add(FieldKey.fromString("MonthsUntilDue"));

        return keys;
    }

    @Override
    protected SimpleFilter getFilter(Collection<String> ids)
    {
        SimpleFilter filter = super.getFilter(ids);

        return filter;
    }
}
