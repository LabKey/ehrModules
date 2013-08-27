package org.labkey.ehr.demographics;

import org.labkey.api.data.CompareType;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.ehr.demographics.AbstractDemographicsProvider;
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
public class DepartureDemographicsProvider extends AbstractDemographicsProvider
{
    public DepartureDemographicsProvider()
    {
        super("study", "demographicsMostRecentDeparture");
    }

    public String getName()
    {
        return "Most Recent Departure";
    }

    protected Set<FieldKey> getFieldKeys()
    {
        Set<FieldKey> keys = new HashSet<FieldKey>();

        keys.add(FieldKey.fromString("Id"));
        keys.add(FieldKey.fromString("MostRecentDeparture"));

        return keys;
    }

    @Override
    public boolean requiresRecalc(String schema, String query)
    {
        return ("study".equalsIgnoreCase(schema) && "Departure".equalsIgnoreCase(query));
    }
}
