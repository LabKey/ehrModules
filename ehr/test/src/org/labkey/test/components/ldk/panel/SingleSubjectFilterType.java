package org.labkey.test.components.ldk.panel;

import org.labkey.test.Locator;
import org.labkey.test.components.html.Input;
import org.labkey.test.pages.ehr.AnimalHistoryPage;

import static org.labkey.test.components.html.Input.Input;

public class SingleSubjectFilterType<A extends AnimalHistoryPage> extends AbstractFilterType<A>
{
    private final Input subjectInput = Input(Locator.name("subjectId"), getDriver()).findWhenNeeded(this);

    public SingleSubjectFilterType(A sourcePage)
    {
        super(sourcePage);
    }

    @Override
    protected String getRadioName()
    {
        return "singleSubject";
    }

    @Override
    protected String getIdPrefix()
    {
        return "ldk-singlesubjectfiltertype";
    }

    public AnimalHistoryPage searchFor(String subjectId)
    {
        subjectInput.set(subjectId);
        return refreshReport();
    }
}
