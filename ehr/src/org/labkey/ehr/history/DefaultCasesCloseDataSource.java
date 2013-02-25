package org.labkey.ehr.history;

import org.labkey.api.data.CompareType;
import org.labkey.api.data.Results;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.query.FieldKey;

import java.sql.SQLException;
import java.util.Date;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 2/17/13
 * Time: 4:52 PM
 */
public class DefaultCasesCloseDataSource extends AbstractDataSource
{
    public DefaultCasesCloseDataSource()
    {
        super("study", "Cases", "Case Closed");
    }

    @Override
    protected String getHtml(Results rs) throws SQLException
    {
        StringBuilder sb = new StringBuilder();

        sb.append("Case Closed");

        return sb.toString();
    }

    @Override
    protected String getDateField()
    {
        return "enddate";
    }

    @Override
    protected SimpleFilter getFilter(String subjectId, Date minDate, Date maxDate)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("id"), subjectId);

        if (minDate != null)
            filter.addCondition(FieldKey.fromString(getDateField()), minDate, CompareType.DATE_GTE);

        if (maxDate != null)
            filter.addCondition(FieldKey.fromString(getDateField()), maxDate, CompareType.DATE_LTE);

        filter.addCondition(FieldKey.fromString(getDateField()), null, CompareType.NONBLANK);

        return filter;
    }
}

