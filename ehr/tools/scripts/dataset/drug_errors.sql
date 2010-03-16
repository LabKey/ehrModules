/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDateTime(date, time) AS Date, (pno) AS pno, (x.code) AS code,
(amount) AS amount, (units) AS units, (route) AS route, FixDateTime(date, time2) AS time2, FixNewlines(remark) AS remark, dataset,
concat_ws(',\n',
     CONCAT('Code: ', s1.meaning, ' (', x.code, ')'),
     CONCAT('Amount: ', cast(amount as char), ' ', units),
     CONCAT('Route: ', route),
     CONCAT('Remark: ', remark),
     route) AS Description
FROM

(
    SELECT id,pno, date,time, code, amount,units, route, time2, '' as remark, 'clindrug' AS dataset FROM clindrug
WHERE date = '0000-00-00' OR id = ''

UNION ALL
    SELECT id, pno,date,time, code, amount,units, route, FixBadTime(time2) as time2, '' as remark, 'hormdrug' AS dataset
    FROM hormdrug
WHERE date = '0000-00-00' OR id = ''
UNION ALL

SELECT id, null as pno, date,time, code, amount,units, route, null as time2, remark, 'surgmed' AS dataset FROM surgmed
WHERE date = '0000-00-00' OR id = ''

UNION ALL

SELECT id, null as pno, date,time, code, amount,units, route, null as time2, remark, 'surganes' AS dataset FROM surganes
WHERE date = '0000-00-00' OR id = ''
        ) x
JOIN snomed s1 on x.code=s1.code


