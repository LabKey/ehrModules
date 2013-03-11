package org.labkey.ehr.history;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 3/6/13
 * Time: 11:38 AM
 */
public class ChemistryLabworkType extends DefaultLabworkType
{
    public ChemistryLabworkType()
    {
        super("Biochemistry", "study", "chemistryRefRange");
        _normalRangeField = "range";
        _normalRangeStatusField = "status";
    }
}
