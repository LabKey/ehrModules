/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDate(date) AS Date, (account) AS account, (source) AS source, (result) AS result, FixNewlines(remark) AS remark, (antibiotic) AS antibiotic, (sensitivity) AS sensitivity,
( CONCAT_WS(',\n ',
     CONCAT('Source: ', s1.meaning, ' (', source, ')'),
     CONCAT('Result: ', s2.meaning, ' (', result, ')'),
     CONCAT('Antibiotic: ', s3.meaning, ' (', antibiotic, ')'),
     CONCAT('Sensitivity: ', sensitivity),
     CONCAT('Remark: ', remark)
     ) ) AS Description
FROM colony.bacteriology b
LEFT OUTER JOIN colony.snomed s1 ON s1.code=b.source LEFT OUTER JOIN colony.snomed s2 ON s2.code = b.result LEFT OUTER JOIN colony.snomed s3 ON s3.code=b.antibiotic
     
