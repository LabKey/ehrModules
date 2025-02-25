package org.labkey.api.snd;

public class EventNote
{
    private Integer _eventId;
    private String _note;
    private Integer _eventNoteId;
    private String _container;

    public static final String EVENT_ID = "eventId";
    public static final String NOTE = "note";
    public static final String EVENT_NOTE_ID = "eventNoteId";
    public static final String CONTAINER = "Container";

    public EventNote(Integer eventId, String note, Integer eventNoteId) {
        _eventId = eventId;
        _note = note;
        _eventNoteId = eventNoteId;
    }

    public EventNote () {}

    public Integer getEventId()
    {
        return _eventId;
    }

    public void setEventId(Integer eventId)
    {
        _eventId = eventId;
    }

    public String getNote() { return _note; }

    public void setNote(String note) { _note = note; }

    public Integer getEventNoteId() { return _eventNoteId; }

    public void setEventNoteId(Integer eventNoteId) { _eventNoteId = eventNoteId; }

}
