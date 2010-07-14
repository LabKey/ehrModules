/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as id, FixDateTime(date, time) AS Date, age, inves, pno, surgeon,
FixDateTime(enddate, endtime) AS enddate, major,
/*FixNewlines(remark) AS remark,*/
max(ts) as ts, uuid AS objectid
FROM surghead
GROUP BY id, date, time, age, inves, pno, surgeon, endtime, enddate
HAVING max(ts) > ?


