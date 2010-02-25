/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDate(date) AS Date, (pno) AS pno, (t.code) AS code, (t.meaning) AS meaning, (volume) AS volume, (vunits) AS vunits, (conc) AS conc, (cunits) AS cunits, (amount) AS amount, (units) AS units, (route) AS route, FixDate(enddate) AS enddate, (frequency) AS frequency, FixNewlines(remark) AS remark, (userid) AS userid,
( CONCAT_WS(',\n ',
     CONCAT('Code: ', s1.meaning, ', ', t.meaning, '(', t.code, ')'),
     CONCAT('Project: ', pno),
     CONCAT('Volume: ', volume, ' ', vunits),
     CONCAT('Conc: ', conc, ' ', cunits),
     CONCAT('Amount: ', amount, ' ', units),
     CONCAT('Route: ', route),
     CONCAT('Conc: ', conc, ' ', cunits),
     CONCAT('EndDate: ', CAST(enddate AS CHAR)),
     CONCAT('Frequency: ', frequency),
     CONCAT('Remark: ', remark)

)) AS Description

FROM treatments t

LEFT OUTER JOIN colony.snomed s1 ON s1.code=t.code
