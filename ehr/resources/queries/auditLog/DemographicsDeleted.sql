WITH cte0 AS (
    SELECT
        a.Date,
        substring(a.DataChanges, a.IdStart, CAST(LOCATE('&', a.DataChanges, LOCATE('&Id=', a.DataChanges) + 1) - a.IdStart AS INTEGER)) as Id
    FROM (
             SELECT Date,
                 DataChanges,
                 LOCATE('&Id=', DataChanges) + LENGTH('&Id=') as IdStart
             FROM DatasetAuditEvent
             WHERE DatasetId.Name = 'demographics' AND Comment = 'A dataset record was deleted'
         ) AS a
)
SELECT c.Date, c.Id
FROM cte0 AS c
WHERE NOT EXISTS (SELECT 1 FROM study.demographics AS d WHERE c.Id = d.id)