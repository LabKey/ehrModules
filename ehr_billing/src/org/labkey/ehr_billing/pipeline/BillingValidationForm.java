package org.labkey.ehr_billing.pipeline;

import java.util.Date;

public class BillingValidationForm
{
    private String _key;
    private Date _start;
    private Date _end;

    public String getKey()
    {
        return _key;
    }

    public void setKey(String key)
    {
        _key = key;
    }

    public Date getStart()
    {
        return _start;
    }

    public void setStart(Date start)
    {
        _start = start;
    }

    public Date getEnd()
    {
        return _end;
    }

    public void setEnd(Date end)
    {
        _end = end;
    }
}