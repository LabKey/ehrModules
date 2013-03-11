package org.labkey.ehr.history;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 3/6/13
 * Time: 12:27 PM
 */
public class HematologyLabworkType extends DefaultLabworkType
{
    public HematologyLabworkType()
    {
        super("Hematology", "study", "hematologyRefRange");
        _normalRangeField = "range";
        _normalRangeStatusField = "status";
    }
}
