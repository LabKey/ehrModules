/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDate(date) AS Date, NULL AS necropsy_objectid, (seq1) AS seq1, (seq2) AS seq2, (necropsydiag.code) AS code,
     CONCAT('Code: ', s1.meaning, ' (', necropsydiag.code, ')') AS Description
FROM necropsydiag
JOIN snomed s1 on necropsydiag.code =s1.code

