package org.labkey.ehr.demographics;

import org.labkey.api.ehr.demographics.AbstractDemographicsProvider;
import org.labkey.api.query.FieldKey;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

/**
 * User: bimber
 * Date: 7/9/13
 * Time: 9:42 PM
 */
public class BasicDemographicsProvider extends AbstractDemographicsProvider
{
    public BasicDemographicsProvider()
    {
        super("Demographics");
    }

    public String getName()
    {
        return "BasicDemographics";
    }

    protected Collection<FieldKey> getFieldKeys()
    {
        Set<FieldKey> keys = new HashSet<FieldKey>();
        //Id/curLocation/area,Id/curLocation/room,Id/curLocation/cage,Id/curLocation/date,

        keys.add(FieldKey.fromString("lsid"));
        keys.add(FieldKey.fromString("Id"));
        keys.add(FieldKey.fromString("gender"));
        keys.add(FieldKey.fromString("gender/meaning"));
        keys.add(FieldKey.fromString("gender/origGender"));
        keys.add(FieldKey.fromString("species"));
        keys.add(FieldKey.fromString("calculated_status"));
        keys.add(FieldKey.fromString("birth"));
        keys.add(FieldKey.fromString("death"));
        keys.add(FieldKey.fromString("geographic_origin"));

        keys.add(FieldKey.fromString("dam"));
        keys.add(FieldKey.fromString("sire"));

        keys.add(FieldKey.fromString("Id/age/yearAndDays"));
        keys.add(FieldKey.fromString("Id/age/ageInDays"));

        return keys;
    }
}
