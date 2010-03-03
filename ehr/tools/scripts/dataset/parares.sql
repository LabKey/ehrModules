/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDate(date) AS Date, null AS parasitology_objectid, (seq) AS seq, (p.code) AS code,
     CONCAT('Code: ', s1.meaning, ' (', p.code, ')') AS Description 

FROM parares p
LEFT OUTER JOIN snomed s1 on s1.code=p.code

