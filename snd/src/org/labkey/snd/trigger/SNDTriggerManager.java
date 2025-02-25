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
package org.labkey.snd.trigger;

import com.google.common.collect.Lists;
import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.module.Module;
import org.labkey.api.security.User;
import org.labkey.api.snd.Event;
import org.labkey.api.snd.EventData;
import org.labkey.api.snd.EventTrigger;
import org.labkey.api.snd.EventTriggerFactory;
import org.labkey.api.snd.SuperPackage;
import org.labkey.api.snd.TriggerAction;
import org.labkey.api.util.Pair;
import org.labkey.snd.SNDManager;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.stream.Collectors;

public class SNDTriggerManager
{
    private static final SNDTriggerManager _instance = new SNDTriggerManager();

    public static SNDTriggerManager get()
    {
        return _instance;
    }

    private Map<Module, EventTriggerFactory> _eventTriggerFactories = new HashMap<>();

    /**
     * Called from SNDService to allow event trigger factories to be registered.  These will be queried for category
     * triggers during insert and update events
     */
    public void registerEventTriggerFactory(Module module, EventTriggerFactory factory)
    {
        _eventTriggerFactories.put(module, factory);
    }

    public void unregisterEventTriggerFactory(Module module)
    {
        _eventTriggerFactories.remove(module);
    }

    private List<EventTriggerFactory> getTriggerFactories(Container c)
    {
        List<EventTriggerFactory> factories = new ArrayList<>();

        for (Module module : _eventTriggerFactories.keySet())
        {
            if (c.getActiveModules().contains(module))
            {
                factories.add(_eventTriggerFactories.get(module));
            }
        }

        return factories;
    }



    private List<TriggerAction> getCategoryTriggers(@NotNull Event event, @NotNull EventData eventData, SuperPackage superPackage,
                                                    @NotNull Map<Integer, SuperPackage> topLevelEventDataSuperPackages, List<EventTriggerFactory> factories)
    {
        List<TriggerAction> triggers = new ArrayList<>();
        EventTrigger trigger;

        if (superPackage.getPkg() != null)
        {
            for (String category : superPackage.getPkg().getCategories().values())
            {
                for (EventTriggerFactory factory : factories)
                {
                    trigger = factory.createTrigger(category);
                    if (trigger != null)
                    {
                        triggers.add(new TriggerAction(trigger, event, eventData, superPackage, topLevelEventDataSuperPackages));
                    }
                }
            }
        }

        return triggers.stream().sorted((t1, t2) -> {
            // Anything with a sort order goes first
            if (t1.getTrigger().getOrder() != null && t2.getTrigger().getOrder() == null)
            {
                return 1;
            }
            else if (t1.getTrigger().getOrder() == null && t2.getTrigger().getOrder() != null)
            {
                return -1;
            }
            // If both contain sort order compare sort orders
            else if (t1.getTrigger().getOrder() != null && t2.getTrigger().getOrder() != null)
            {
                return t2.getTrigger().getOrder() - t1.getTrigger().getOrder();
            }
            else
            {
                return t2.getTrigger().getClass().getSimpleName().compareTo(t1.getTrigger().getClass().getSimpleName());
            }
        }).collect(Collectors.toList());
    }

    private List<TriggerAction> getTriggerActions(Event event, Map<Integer, SuperPackage> topLevelEventDataSuperPackages, List<EventTriggerFactory> factories)
    {
        List<TriggerAction> triggerActions = new ArrayList<>();
        List<TriggerAction> pkgTriggers;
        Queue<Pair<EventData, SuperPackage>> queue = new ConcurrentLinkedQueue<>();

        Pair<EventData, SuperPackage> pair;

        // iterate through top level packages, perform breadth first search on each top level event data
        if (event.getEventData() != null)
        {
            for (EventData eventData : event.getEventData())
            {
                pkgTriggers = new ArrayList<>();
                SuperPackage superPackage = topLevelEventDataSuperPackages.get(eventData.getEventDataId());
                queue.add(new Pair<>(eventData, superPackage));

                while (!queue.isEmpty())
                {
                    pair = queue.poll();
                    pkgTriggers.addAll(getCategoryTriggers(event, pair.first, pair.second, topLevelEventDataSuperPackages, factories));

                    if (pair.first.getSubPackages() != null)
                    {
                        for (EventData data : pair.first.getSubPackages())
                        {
                            queue.add(new Pair<>(data, SNDManager.get().getSuperPackage(data.getSuperPkgId(), pair.second.getChildPackages())));
                        }
                    }
                }

                // reverse bfs
                triggerActions.addAll(Lists.reverse(pkgTriggers));
            }
        }
        return triggerActions;
    }


    /**
     * Called from insert event.
     */
    public void fireInsertTriggers(Container c, User u, Event event, Map<Integer, SuperPackage> topLevelEventDataPkgs)
    {
        List<EventTriggerFactory> factories = getTriggerFactories(c);

        // Nothing to do
        if (factories.size() < 1)
            return;

        List<TriggerAction> triggerActions = getTriggerActions(event, topLevelEventDataPkgs, factories);
        Map<String, Object> extraContext = new HashMap<>();

        for (TriggerAction triggerAction : triggerActions)
        {
            triggerAction.getTrigger().onInsert(c, u, triggerAction, extraContext);
        }
    }

    /**
     * Called from update event.
     */
    public void fireUpdateTriggers(Container c, User u, Event event, Map<Integer, SuperPackage> topLevelEventDataSuperPkgs)
    {
        List<EventTriggerFactory> factories = getTriggerFactories(c);

        // Nothing to do
        if (factories.size() < 1)
            return;

        List<TriggerAction> triggers = getTriggerActions(event, topLevelEventDataSuperPkgs, factories);
        Map<String, Object> extraContext = new HashMap<>();

        for (TriggerAction trigger : triggers)
        {
            trigger.getTrigger().onUpdate(c, u, trigger, extraContext);
        }
    }
}
