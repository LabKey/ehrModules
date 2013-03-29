package org.labkey.ehr.history;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 3/19/13
 * Time: 11:02 PM
 */
public class iStatLabworkType extends SortingLabworkType
{
    public iStatLabworkType()
    {
        super("iStat", "study", "iStatRefRange", "iStat");
        _normalRangeField = "range";
        _normalRangeStatusField = "status";
    }
}
