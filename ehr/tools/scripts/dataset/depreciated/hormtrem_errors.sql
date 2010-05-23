/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDateTime(date, time) AS Date, (pno) AS pno, FixNewlines(remark) AS remark,
(select group_concat(UUID) from hormhead t2 WHERE t1.id=t2.id AND t1.date=t2.date AND t1.time=t2.time GROUP BY t1.id,t1.date,t1.time) as parentid,
        FixNewlines(remark) AS description, ts, uuid AS objectid
FROM hormtrem t1
HAVING parentid LIKE '%,%'

