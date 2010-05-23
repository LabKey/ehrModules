/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDate(date) AS Date, (seq1) AS seq1, (seq2) AS seq2, (b.code) AS code,
    (SELECT group_concat(distinct uuid) FROM biopsyhead b2 WHERE b.id = b2.id AND b.date = b2.date) AS parentid,
      ( CONCAT_WS(',\n',
     CONCAT('Code: ', s1.meaning, ' (', b.code, ')')
     ) ) AS Description, b.ts, b.uuid AS objectid

FROM biopsydiag b
LEFT OUTER JOIN snomed s1 ON s1.code=b.code
HAVING parentid LIKE "%,%"

