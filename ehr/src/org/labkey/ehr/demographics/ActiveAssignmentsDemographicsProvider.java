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
public class ActiveAssignmentsDemographicsProvider extends AbstractListDemographicsProvider
{
    public ActiveAssignmentsDemographicsProvider()
    {
        super("Assignment", "activeAssignments");
    }

    protected Set<FieldKey> getFieldKeys()
    {
        Set<FieldKey> keys = new HashSet<FieldKey>();
        keys.add(FieldKey.fromString("lsid"));
        keys.add(FieldKey.fromString("Id"));
        keys.add(FieldKey.fromString("date"));
        keys.add(FieldKey.fromString("enddate"));
        keys.add(FieldKey.fromString("projectedRelease"));
        keys.add(FieldKey.fromString("project"));
        keys.add(FieldKey.fromString("project/title"));
        keys.add(FieldKey.fromString("project/displayName"));
        keys.add(FieldKey.fromString("project/protocol"));
        keys.add(FieldKey.fromString("project/protocol/displayName"));
        keys.add(FieldKey.fromString("project/investigatorId"));
        keys.add(FieldKey.fromString("project/investigatorId/firstName"));
        keys.add(FieldKey.fromString("project/investigatorId/lastName"));
        keys.add(FieldKey.fromString("remark"));

        return keys;
    }

    @Override
    protected SimpleFilter getFilter(Collection<String> ids)
    {
        SimpleFilter filter = super.getFilter(ids);
        filter.addCondition(FieldKey.fromString("isActive"), true, CompareType.EQUAL);
        filter.addCondition(FieldKey.fromString("qcstate/publicData"), true, CompareType.EQUAL);

        return filter;
    }
}
