/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDateTime(date, time) AS Date, (f.code) AS code, (amount) AS amount, (units) AS units, (route) AS route,

Timestamp(Date('1970-01-01'), FixBadTime(begintime)) AS begintime,
Timestamp(Date('1970-01-01'), FixBadTime(endtime)) AS endtime,

( CONCAT_WS(',\n',
     CONCAT('Code: ', s1.meaning, ' (', f.code, ')'),
     CONCAT('Amount: ', cast(amount as char)),
     CONCAT('Units: ', units),
     CONCAT('Route: ', route),
     CONCAT('Begin Time: ', cast(begintime AS time)),
     CONCAT('End Time: ', cast(endtime AS time))
) ) AS Description


FROM surgfluid f
LEFT OUTER JOIN snomed s1 on s1.code=f.code

