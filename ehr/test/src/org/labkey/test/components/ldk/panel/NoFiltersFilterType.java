package org.labkey.test.components.ldk.panel;

import org.labkey.test.pages.ehr.AnimalHistoryPage;

public class NoFiltersFilterType<A extends AnimalHistoryPage> extends AbstractFilterType<A>
{
    public NoFiltersFilterType(A sourcePage)
    {
        super(sourcePage);
    }

    @Override
    protected String getRadioName()
    {
        return "none";
    }

    @Override
    protected String getIdPrefix()
    {
        return "ldk-nofiltersfiltertype";
    }
}
