/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDate(date) AS Date, (pno) AS pno, Timestamp(Date('1970-01-01'), time) AS time, (x.code) AS code, 
(amount) AS amount, (units) AS units, (route) AS route, Timestamp(Date('1970-01-01'), time2) AS time2, FixNewlines(remark) AS remark, 
concat_ws(' ', cast(amount as char),  coalesce(units,''), snomed.meaning, route) AS Description FROM 
(SELECT id,pno, date,time, code, amount,units, route, time2, '' as remark FROM clindrug UNION ALL 
    SELECT id, pno,date,time, code, amount,units, route, time2, '' as remark
    FROM hormdrug UNION ALL SELECT id, null as pno, date,time, code, amount,units, route, null as time2, remark FROM surgmed) x
    JOIN snomed on x.code=snomed.code


