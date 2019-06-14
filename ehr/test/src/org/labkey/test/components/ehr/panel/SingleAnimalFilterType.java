package org.labkey.test.components.ehr.panel;

import org.labkey.test.components.ldk.panel.SingleSubjectFilterType;
import org.labkey.test.pages.ehr.AnimalHistoryPage;

public class SingleAnimalFilterType<A extends AnimalHistoryPage> extends SingleSubjectFilterType<A>
{

    public SingleAnimalFilterType(A sourcePage)
    {
        super(sourcePage);
    }

    @Override
    protected String getIdPrefix()
    {
        return "ehr-singleanimalfiltertype";
    }
}
