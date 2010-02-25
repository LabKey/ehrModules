/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDateTime(date, time) AS Date, (p.code) AS code,
( CONCAT_WS(',\n',
     CONCAT('Code: ', s1.meaning, ' (', p.code, ')')
) ) AS Description

FROM surgproc p
LEFT OUTER JOIN snomed s1 on s1.code=p.code
