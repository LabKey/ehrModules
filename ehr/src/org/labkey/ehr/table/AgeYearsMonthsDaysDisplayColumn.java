package org.labkey.ehr.table;

import org.labkey.api.data.ColumnInfo;
import org.labkey.api.ehr.table.DurationColumn;

import java.util.Date;

public class AgeYearsMonthsDaysDisplayColumn extends DurationColumn
{
    public AgeYearsMonthsDaysDisplayColumn(ColumnInfo col)
    {
        super(col, "birth", "death");
    }
}
