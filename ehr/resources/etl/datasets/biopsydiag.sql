/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as id, FixDate(date) AS Date, (seq1) AS seq1, (seq2) AS seq2, (b.code) AS code,
    (SELECT group_concat(DISTINCT uuid) as uuid FROM (SELECT * FROM biopsyhead GROUP BY id, date, caseno, account) b2 WHERE b.id = b2.id AND b.date = b2.date) AS parentid,
     s1.meaning,
     b.ts, b.uuid AS objectid

FROM biopsydiag b
LEFT OUTER JOIN snomed s1 ON s1.code=b.code
WHERE b.ts > ?
HAVING parentid NOT LIKE "%,%"

