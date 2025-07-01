package org.labkey.snd.query;

import org.apache.logging.log4j.Logger;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.Container;
import org.labkey.api.data.DbScope;
import org.labkey.api.dataiterator.AbstractDataIterator;
import org.labkey.api.dataiterator.DataIterator;
import org.labkey.api.dataiterator.DataIteratorContext;
import org.labkey.api.dataiterator.DataIteratorUtil;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.util.logging.LogHelper;
import org.labkey.snd.SNDManager;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

public class EventNotesDataIterator extends AbstractDataIterator
{
    private static final SNDManager _sndManager = SNDManager.get();
    private static final String EVENT_ID_COL = "eventId";
    private final User _user;
    private final Container _container;
    private final int _eventIdColIndex;
    private final Set<Integer> _eventIds = new HashSet<>();
    private final DataIterator _in;
    private final Logger log = LogHelper.getLogger(EventNotesDataIterator.class, "Fill out event notes");

    public static DataIterator wrap(DataIterator in, DataIteratorContext context, Container c, User u)
    {
        return new EventNotesDataIterator(in, context, c, u);
    }

    private EventNotesDataIterator(DataIterator in, DataIteratorContext context, Container c, User u)
    {
        super(context);
        _user = u;
        _container = c;
        _in = in;

        _eventIdColIndex = DataIteratorUtil.createColumnNameMap(in).get(EVENT_ID_COL);
    }

    @Override
    public int getColumnCount()
    {
        return _in.getColumnCount();
    }

    @Override
    public ColumnInfo getColumnInfo(int i)
    {
        return _in.getColumnInfo(i);
    }

    @Override
    public boolean next() throws BatchValidationException
    {
        boolean hasNext = _in.next();
        if (hasNext)
        {
            Integer eventId = (Integer)_in.get(_eventIdColIndex);
            _eventIds.add(eventId);
        }
        else
        {
            UserSchema schema = SNDManager.getSndUserSchema(_container, _user);

            // Add a post commit task to update the narrative cache after the transaction updating the notes is committed.
            SNDManager.get().getTableInfo(schema, "EventNotes").getSchema().getScope().addCommitTask(() -> {
                _sndManager.updateNarrativeCache(_container, _user, _eventIds, log);
            }, DbScope.CommitTaskOption.POSTCOMMIT);
        }
        return hasNext;
    }

    @Override
    public Object get(int i)
    {
        return _in.get(i);
    }

    @Override
    public void close() throws IOException
    {
        _in.close();
    }
}
