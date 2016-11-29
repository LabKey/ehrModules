package org.labkey.test.components.ehr.panel;

import org.labkey.test.Locator;
import org.labkey.test.components.ext4.ComboBox;
import org.labkey.test.components.html.Input;
import org.labkey.test.components.ldk.panel.AbstractFilterType;
import org.labkey.test.pages.ehr.AnimalHistoryPage;

import static org.labkey.test.components.ext4.ComboBox.ComboBox;
import static org.labkey.test.components.html.Input.Input;
import static org.labkey.test.util.Ext4Helper.TextMatchTechnique.LEADING_NBSP;

public class LocationFilterType<A extends AnimalHistoryPage> extends AbstractFilterType<A>
{
    private final ComboBox areaCombo = ComboBox(getDriver()).withLabel("Area(s):").findWhenNeeded(this).setMatcher(LEADING_NBSP);
    private final ComboBox roomCombo = ComboBox(getDriver()).withLabel("Room:").findWhenNeeded(this).setMatcher(LEADING_NBSP);
    private final Input cageInput = Input(Locator.input("cageField"), getDriver()).findWhenNeeded(this);

    public LocationFilterType(A sourcePage)
    {
        super(sourcePage);
    }

    @Override
    protected String getRadioName()
    {
        return "roomCage";
    }

    @Override
    protected String getIdPrefix()
    {
        return "ehr-locationfiltertype";
    }

    public LocationFilterType selectAreas(String... areas)
    {
        areaCombo.selectComboBoxItem(areas);
        return this;
    }

    public LocationFilterType selectRooms(String... rooms)
    {
        roomCombo.selectComboBoxItem(rooms);
        return this;
    }

    public LocationFilterType setCage(String cage)
    {
        cageInput.set(cage);
        return this;
    }
}
