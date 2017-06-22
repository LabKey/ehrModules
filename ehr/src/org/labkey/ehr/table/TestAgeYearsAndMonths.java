/*
 * Copyright (c) 2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
