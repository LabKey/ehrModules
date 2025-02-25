package org.labkey.snd.query;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.dataiterator.DataIterator;
import org.labkey.api.dataiterator.DataIteratorBuilder;
import org.labkey.api.dataiterator.DataIteratorContext;
import org.labkey.api.dataiterator.DataIteratorUtil;
import org.labkey.api.security.User;

public class EventNotesDataIteratorBuilder implements DataIteratorBuilder
{
    private final DataIteratorBuilder in;
    private final User user;
    private final Container container;

    public EventNotesDataIteratorBuilder(@NotNull DataIteratorBuilder in, User user, Container container)
    {
        this.in = in;
        this.user = user;
        this.container = container;
    }

    @Override
    public DataIterator getDataIterator(DataIteratorContext context)
    {
        DataIterator it = in.getDataIterator(context);
        DataIterator in = DataIteratorUtil.wrapMap(it, false);
        return EventNotesDataIterator.wrap(in, context, container, user);
    }
}


