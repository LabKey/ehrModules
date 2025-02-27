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
package org.labkey.api.snd;


import org.jetbrains.annotations.NotNull;

import java.util.Map;

public class TriggerAction
{
    EventTrigger _trigger;
    Event _event;
    EventData _eventData;
    Map<Integer, SuperPackage> _topLevelSuperPkgs;  // Maps EventDataId to SuperPackage
    SuperPackage _superPackage;

    public TriggerAction(@NotNull EventTrigger trigger, @NotNull Event event, @NotNull EventData eventData,
                         @NotNull SuperPackage superPackage, @NotNull Map<Integer, SuperPackage> topLevelPkgs)
    {
        _trigger = trigger;
        _event = event;
        _eventData = eventData;
        _topLevelSuperPkgs = topLevelPkgs;
        _superPackage = superPackage;
    }

    public EventTrigger getTrigger()
    {
        return _trigger;
    }

    public void setTrigger(EventTrigger trigger)
    {
        _trigger = trigger;
    }

    public Event getEvent()
    {
        return _event;
    }

    public void setEvent(Event event)
    {
        _event = event;
    }

    public EventData getEventData()
    {
        return _eventData;
    }

    public void setEventData(EventData eventData)
    {
        _eventData = eventData;
    }

    public Map<Integer, SuperPackage> getTopLevelSuperPkgs()
    {
        return _topLevelSuperPkgs;
    }

    public void setTopLevelSuperPkgs(Map<Integer, SuperPackage> topLevelSuperPkgsPkgs)
    {
        _topLevelSuperPkgs = topLevelSuperPkgsPkgs;
    }

    public SuperPackage getSuperPackage()
    {
        return _superPackage;
    }

    public void setSuperPackage(SuperPackage superPackage)
    {
        _superPackage = superPackage;
    }
}