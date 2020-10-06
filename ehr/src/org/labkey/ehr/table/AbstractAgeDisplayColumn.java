package org.labkey.ehr.table;

import org.labkey.api.data.ColumnInfo;
import org.labkey.api.ehr.table.DurationColumn;

public abstract class AbstractAgeDisplayColumn extends DurationColumn
{
    public AbstractAgeDisplayColumn(ColumnInfo col)
    {
        super(col, "birth", "lastDayAtCenter");
        setDropTime(true);
    }
}
