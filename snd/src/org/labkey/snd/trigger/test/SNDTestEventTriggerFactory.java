/*
 * Copyright (c) 2018 LabKey Corporation
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
package org.labkey.snd.trigger.test;

import org.labkey.api.snd.EventTrigger;
import org.labkey.api.snd.EventTriggerFactory;
import org.labkey.snd.trigger.test.triggers.CalciumTestTrigger;
import org.labkey.snd.trigger.test.triggers.ChlorideBloodTestTrigger;
import org.labkey.snd.trigger.test.triggers.ChlorideTestTrigger;
import org.labkey.snd.trigger.test.triggers.ElectrolytesTestTrigger;
import org.labkey.snd.trigger.test.triggers.SNDTestTrigger;

public class SNDTestEventTriggerFactory implements EventTriggerFactory
{

    @Override
    public EventTrigger createTrigger(String category)
    {
        EventTrigger trigger;

        switch (category)
        {
            case "SNDTestTrigger":
                trigger = new SNDTestTrigger();
                break;
            case "ChlorideTestTrigger":
                trigger = new ChlorideTestTrigger();
                break;
            case "ChlorideBloodTestTrigger":
                trigger = new ChlorideBloodTestTrigger();
                break;
            case "ElectrolytesTestTrigger":
                trigger = new ElectrolytesTestTrigger();
                break;
            case "CalciumTestTrigger":
                trigger = new CalciumTestTrigger();
                break;
            default:
                trigger = null;
        }

        return trigger;
    }
}
