/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as id, FixDate(date) AS Date, account,
max(b.ts) as ts,  b.uuid AS objectid,
( CONCAT_WS(',\n ',
     CONCAT('Remark: ', '')
     ) ) AS Description

FROM bacteriology b

GROUP BY b.id, b.date, b.account