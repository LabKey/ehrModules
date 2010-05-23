/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDateTime(date, time) AS Date, (pno) AS pno, (userid) AS userid, FixNewlines(remark) AS remark, FixNewlines(remark) AS description, ts, uuid AS objectid,
(select group_concat(UUID) from clinhead t2 WHERE t1.id=t2.id AND t1.date=t2.date AND t1.time=t2.time AND t1.pno=t2.pno GROUP BY t1.id,t1.date,t1.time,t1.pno) as parentid

FROM clintrem t1
WHERE id IS NOT NULL AND id != '' and pno REGEXP '^[0-9]+$'
HAVING parentid NOT LIKE '%,%'
