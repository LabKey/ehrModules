
ALTER TRIGGER snd.ti_after_Events ON snd.Events FOR INSERT AS
BEGIN
    SET NOCOUNT ON;
    DECLARE
        @Container ENTITYID

    SELECT @Container = INSERTED.[Container] FROM INSERTED
UPDATE snd.Events
SET QcState = (SELECT TOP(1) q.rowId FROM core.DataStates AS q WHERE q.Label = 'Completed' AND q.Container = @Container ORDER BY q.rowId)
    FROM INSERTED AS i
             INNER JOIN snd.Events AS e ON i.EventId = e.EventId
WHERE i.QcState IS NULL
END
GO