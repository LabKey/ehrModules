package org.labkey.api.ehr.demographics;

import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.module.Module;
import org.labkey.api.query.FieldKey;
import org.labkey.api.security.User;
import org.labkey.api.study.StudyService;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

public class ActiveGroupsDemographicsProvider extends AbstractListDemographicsProvider
{
    private static final String _queryName = "animal_group_members";
    public ActiveGroupsDemographicsProvider(Module owner)
    {
        super(owner, "study", _queryName, "activeAnimalGroups");
        _supportsQCState = false;
    }

    @Override
    public String getName()
    {
        return "Current Animal Groups";
    }

    @Override
    protected Set<FieldKey> getFieldKeys()
    {
        Set<FieldKey> keys = new HashSet<>();

        keys.add(FieldKey.fromString("Id"));
        keys.add(FieldKey.fromString("groupId/name"));

        return keys;
    }

    @Override
    protected SimpleFilter getFilter(Collection<String> ids)
    {
        SimpleFilter filter = super.getFilter(ids);
        filter.addCondition(FieldKey.fromString("enddate"), null, CompareType.ISBLANK);
        filter.addCondition(FieldKey.fromString("qcstate/publicData"), true, CompareType.EQUAL);

        return filter;
    }

    @Override
    public boolean requiresRecalc(String schema, String query)
    {
        return ("study".equalsIgnoreCase(schema) && _queryName.equalsIgnoreCase(query));
    }

    @Override
    public boolean isAvailable(Container c, User u)
    {
        return -1 != StudyService.get().getDatasetIdByName( c, _queryName);
    }
}