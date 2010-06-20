/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDateTime(date, time) AS Date, (pno) AS pno, (x.code) AS code,
(amount) AS amount, (units) AS units, (route) AS route, FixDateTime(date, BeginTime) AS BeginTime, EndTime, FixNewlines(remark) AS remark, category,
concat_ws(',\n',
     CONCAT('Code: ', s1.meaning, ' (', x.code, ')'),
     CONCAT('Amount: ', cast(amount as char), ' ', units),
     CONCAT('Route: ', route),
     CONCAT('Remark: ', remark),
     route) AS Description, x.ts, x.uuid AS objectid, parentid
FROM

(

SELECT id,pno, date,time, code, amount,units, route, time2 as BeginTime, null as EndTime, null as remark, 'clindrug' AS category, ts, uuid,
(select UUID from clinhead t2 WHERE t1.id=t2.id AND t1.date=t2.date AND t1.time=t2.time AND t1.pno=t2.pno GROUP BY t1.id,t1.date,t1.time,t1.pno limit 1) as parentid
FROM clindrug t1

UNION ALL

SELECT id, pno,date,time, code, amount,units, route, FixBadTime(time2) as BeginTime, null as EndTime, null as remark, 'hormdrug' AS category, ts, uuid,
(select UUID from hormhead t2 WHERE t1.id=t2.id AND t1.date=t2.date AND t1.time=t2.time AND t1.pno=t2.pno GROUP BY t1.id,t1.date,t1.time,t1.pno limit 1) as parentid
FROM hormdrug t1

UNION ALL

SELECT id, null as pno, date,time, code, amount,units, route, null as BeginTime, null as EndTime, remark, 'surgmed' AS category, ts, uuid,
(select UUID from surghead t2 WHERE t1.id=t2.id AND t1.date=t2.date AND t1.time=t2.time GROUP BY t1.id,t1.date,t1.time limit 1) as parentid
FROM surgmed t1

UNION ALL

SELECT id, null as pno, date,time, code, amount,units, route, null as BeginTime, null as EndTime, remark, 'surganes' AS category, ts, uuid,
(select UUID from surghead t2 WHERE t1.id=t2.id AND t1.date=t2.date AND t1.time=t2.time GROUP BY t1.id,t1.date,t1.time limit 1) as parentid
FROM surganes t1

UNION ALL

SELECT id, null as pno, date, time, code, amount, units, route,
Timestamp(FixDate(date), FixBadTime(begintime)) AS begintime,
Timestamp(FixDate(date), FixBadTime(endtime)) AS endtime, null as remark, 'surgfluid' as category, ts, uuid,
(select UUID from surghead t2 WHERE t1.id=t2.id AND t1.date=t2.date AND t1.time=t2.time GROUP BY t1.id,t1.date,t1.time limit 1) as parentid
FROM surgfluid t1

        ) x
JOIN snomed s1 on x.code=s1.code

WHERE date != '0000-00-00' AND id != '' AND (pno REGEXP '^[0-9]+$' OR pno IS NULL)
