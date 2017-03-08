package org.labkey.ehr.table;
import org.junit.Test;

import java.util.Calendar;
import java.util.GregorianCalendar;

/**
 * Created by rond on 12/28/2016.
 */


public class TestAgeYearsAndMonths
{
    @Test
    public void testOneYearElevenMonths(){
        GregorianCalendar startCalendar = new GregorianCalendar(2016,0,1);
        GregorianCalendar endCalendar = new GregorianCalendar(2017,11,1);
        String expected = "1 year, 11 months";
        testAge(startCalendar, endCalendar, expected);
    }

    private void testAge(GregorianCalendar startCalendar, GregorianCalendar endCalendar, String expected)
    {
//        TODO: If using this test, need to update getFormattedDuration
//        String result = AgeYearMonthsDisplayColumn.getFormattedAge(startCalendar.getTime(), endCalendar.getTime());
//        Assert.assertEquals(expected,result);
    }

    @Test
    public void testOneYearOneMonth(){
        GregorianCalendar startCalendar = new GregorianCalendar(2016,0,1);
        GregorianCalendar endCalendar = new GregorianCalendar(2017,1,1);
        String expected = "1 year, 1 month";
        testAge(startCalendar, endCalendar, expected);
    }

    @Test
    public void testTwoYearsOneMonth(){
        GregorianCalendar startCalendar = new GregorianCalendar(2016,0,1);
        GregorianCalendar endCalendar = new GregorianCalendar(2018,1,1);
        String expected = "2 years, 1 month";
        testAge(startCalendar, endCalendar, expected);
    }

    @Test
    public void testTwoYearsAlive(){

        GregorianCalendar twoYearsAgo = new GregorianCalendar();
        twoYearsAgo.add(Calendar.YEAR, -2);
        String expected = "2 years, 0 months";
//        TODO: If using this test, need to update to getFormattedDuration
//        String result = AgeYearMonthsDisplayColumn.getFormattedAge(twoYearsAgo.getTime(), null);
//        Assert.assertEquals(expected,result);
    }
}
