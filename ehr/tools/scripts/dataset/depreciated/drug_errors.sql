/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDateTime(date, time) AS Date, (pno) AS pno, (x.code) AS code,
(amount) AS amount, (units) AS units, (route) AS route,
FixDateTime(date, coalesce(BeginTime, time)) AS BeginTime,
EndTime, FixNewlines(remark) AS remark, category,
concat_ws(',\n',
     CONCAT('Code: ', s1.meaning, ' (', x.code, ')'),
     CONCAT('Amount: ', cast(amount as char), ' ', units),
     CONCAT('Route: ', route),
     CONCAT('Remark: ', remark),
     route) AS Description, x.ts, x.uuid AS objectid, parentid
FROM

(

SELECT id,pno, date,time, code, amount,units, route, FixBadTime(time2) as BeginTime, null as EndTime, null as remark, 'clindrug' AS category, ts, uuid,
(select group_concat(DISTINCT UUID) as uuid from clinhead t2 WHERE t1.id=t2.id AND t1.date=t2.date AND t1.time=t2.time AND (t1.pno=t2.pno OR t1.pno IS NULL) GROUP BY t1.id,t1.date,t1.time,t1.pno limit 1) as parentid
FROM clindrug t1
WHERE t1.date = '0000-00-00' OR t1.id = '' OR (t1.pno NOT REGEXP '^[0-9]+$' AND t1.pno IS NOT NULL)

UNION ALL

SELECT h1.id, h1.pno,h1.date,h1.time, code, amount,units, route, FixBadTime(time2) as BeginTime, null as EndTime, FixNewLines(h2.remark) as remark, 'hormdrug' AS category, greatest(h1.ts, coalesce(h2.ts,'1979-01-01')) as ts, h1.uuid,
(select UUID from hormhead t2 WHERE h1.id=t2.id AND h1.date=t2.date AND h1.time=t2.time AND (h1.pno=t2.pno OR h1.pno is null) GROUP BY h1.id,h1.date,h1.time,h1.pno limit 1) as parentid
FROM hormdrug h1 left join hormtrem h2 on (h1.id=h2.id AND (h1.pno=h2.pno OR h1.pno is null) AND h1.date=h2.date AND h1.time=h2.time AND h2.remark != '')
WHERE h1.date = '0000-00-00' OR h1.id = '' OR (h1.pno NOT REGEXP '^[0-9]+$' AND h1.pno IS NOT NULL)

UNION ALL

SELECT id, null as pno, date,time, code, amount,units, route, null as BeginTime, null as EndTime, remark, 'surgmed' AS category, ts, uuid,
(select UUID from surghead t2 WHERE t1.id=t2.id AND t1.date=t2.date AND t1.time=t2.time GROUP BY t1.id,t1.date,t1.time limit 1) as parentid
FROM surgmed t1
WHERE t1.date = '0000-00-00' OR t1.id = ''

UNION ALL

SELECT id, null as pno, date,time, code, amount,units, route, null as BeginTime, null as EndTime, remark, 'surganes' AS category, ts, uuid,
(select UUID from surghead t2 WHERE t1.id=t2.id AND t1.date=t2.date AND t1.time=t2.time GROUP BY t1.id,t1.date,t1.time limit 1) as parentid
FROM surganes t1
WHERE t1.date = '0000-00-00' OR t1.id = ''

UNION ALL

SELECT id, null as pno, date, time, code, amount, units, route,
FixBadTime(begintime) AS begintime,
FixBadTime(endtime) AS endtime, null as remark, 'surgfluid' as category, ts, uuid,
(select UUID from surghead t2 WHERE t1.id=t2.id AND t1.date=t2.date AND t1.time=t2.time GROUP BY t1.id,t1.date,t1.time limit 1) as parentid
FROM surgfluid t1
WHERE t1.date = '0000-00-00' OR t1.id = ''

        ) x
JOIN snomed s1 on x.code=s1.code


