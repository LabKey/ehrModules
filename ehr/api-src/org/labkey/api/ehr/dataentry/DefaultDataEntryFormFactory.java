/*
 * Copyright (c) 2016-2019 LabKey Corporation
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
package org.labkey.api.ehr.dataentry;

import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.LogManager;
import org.jetbrains.annotations.NotNull;
import org.labkey.api.module.Module;

import javax.annotation.Nullable;
import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.util.List;

/**
 * Simple implementation of {@link DataEntryFormFactory}
 * User: bimber
 * Date: 12/3/13
 */
public class DefaultDataEntryFormFactory implements DataEntryFormFactory
{
    private Logger _log = LogManager.getLogger(DefaultDataEntryFormFactory.class);
    Class<? extends DataEntryForm> _clazz;
    Module _module;

    public DefaultDataEntryFormFactory(@NotNull Class<? extends DataEntryForm> clazz, @NotNull Module module)
    {
        _clazz = clazz;
        _module = module;
    }

    @Nullable @Override
    public DataEntryForm createForm(DataEntryFormContext ctx)
    {
        try
        {
            //TODO: how do I force forms to have this constructor??
            Constructor<?> cons = _clazz.getConstructor(DataEntryFormContext.class, Module.class);
            return (DataEntryForm)cons.newInstance(ctx, _module);
        }
        catch (InstantiationException | IllegalAccessException | InvocationTargetException | NoSuchMethodException e)
        {
            _log.error("Unable to create form: " + _clazz.getName(), e);
            return null;
        }
    }

    /** Implementation for creating instances of {@link TaskForm} variations */
    public static class TaskFactory implements DataEntryFormFactory
    {
        private Module _owner;
        private String _category;
        private String _name;
        private String _label;
        private List<FormSection> _sections;

        public TaskFactory(Module owner, String category, String name, String label, List<FormSection> sections)
        {
            _owner = owner;
            _category = category;
            _name = name;
            _label = label;
            _sections = sections;
        }

        @Override
        public DataEntryForm createForm(DataEntryFormContext ctx)
        {
            return TaskForm.create(ctx, _owner, _category, _name, _label, _sections);
        }
    }
}
