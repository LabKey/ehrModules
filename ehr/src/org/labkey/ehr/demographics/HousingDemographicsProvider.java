package org.labkey.ehr.demographics;

import org.labkey.api.ehr.demographics.AbstractListDemographicsProvider;
import org.labkey.api.query.FieldKey;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

/**
 * User: bimber
 * Date: 7/9/13
 * Time: 10:12 PM
 */
public class HousingDemographicsProvider extends AbstractListDemographicsProvider
{
    public HousingDemographicsProvider()
    {
        super("demographicsCurLocation", "activeHousing");
    }

    protected Collection<FieldKey> getFieldKeys()
    {
        Set<FieldKey> keys = new HashSet<FieldKey>();
        keys.add(FieldKey.fromString("area"));
        keys.add(FieldKey.fromString("room"));
        keys.add(FieldKey.fromString("room_order"));
        keys.add(FieldKey.fromString("cage"));
        keys.add(FieldKey.fromString("cage_order"));
        keys.add(FieldKey.fromString("date"));

        return keys;
    }
}
