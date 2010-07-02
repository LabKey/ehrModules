/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as id, FixDate(date) AS Date, source, result, FixNewlines(remark) AS remark, antibiotic, sensitivity,
b.uuid as runid,
b.ts, b.uuid AS objectid,
( CONCAT_WS(',\n ',
     CONCAT('Source: ', s1.meaning, ' (', source, ')'),
     CONCAT('Result: ', s2.meaning, ' (', result, ')'),
     CONCAT('Antibiotic: ', s3.meaning, ' (', antibiotic, ')'),
     CONCAT('Sensitivity: ', sensitivity),
     CONCAT('Remark: ', remark)
     ) ) AS Description
FROM bacteriology b
LEFT OUTER JOIN snomed s1 ON s1.code=b.source LEFT OUTER JOIN snomed s2 ON s2.code = b.result LEFT OUTER JOIN snomed s3 ON s3.code=b.antibiotic

