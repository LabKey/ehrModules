SELECT
    Date,
    substring(DataChanges, IdStart, CAST(LOCATE('&', DataChanges, LOCATE('&Id=', DataChanges) + 1) - IdStart AS INTEGER)) as Id
FROM (
    SELECT Date,
    DataChanges,
    LOCATE('&Id=', DataChanges) + LENGTH('&Id=') as IdStart
    FROM DatasetAuditEvent
    WHERE DatasetId.Name = 'demographics' AND Comment = 'A dataset record was deleted'
    )