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
public class ActiveAnimalGroupsDemographicsProvider extends AbstractListDemographicsProvider
{
    public ActiveAnimalGroupsDemographicsProvider()
    {
        super("animal_group_members", "activeAnimalGroups");
        _schemaName = "ehr";
    }

    protected Set<FieldKey> getFieldKeys()
    {
        Set<FieldKey> keys = new HashSet<FieldKey>();
        keys.add(FieldKey.fromString("rowid"));
        keys.add(FieldKey.fromString("Id"));
        keys.add(FieldKey.fromString("date"));
        keys.add(FieldKey.fromString("enddate"));
        keys.add(FieldKey.fromString("groupId"));
        keys.add(FieldKey.fromString("groupId/name"));

        return keys;
    }

    @Override
    protected SimpleFilter getFilter(Collection<String> ids)
    {
        SimpleFilter filter = super.getFilter(ids);
        filter.addCondition(FieldKey.fromString("isActive"), true, CompareType.EQUAL);

        return filter;
    }
}
