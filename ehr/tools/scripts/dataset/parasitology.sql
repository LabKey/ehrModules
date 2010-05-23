/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(p1.id) as id, FixDate(p1.date) as date, seq, p1.code as code, room, account, FixNewlines(remark) AS remark, FixNewlines(clinremark) AS clinremark,
     ( CONCAT_WS(',\n',
     CONCAT('Code: ', s1.meaning, ' (', p1.code, ')'),
     CONCAT('Room: ', room),
     CONCAT('Account: ', account),
     CONCAT('Remark: ', remark),
     CONCAT('Clinremark: ', clinremark)
     ) ) AS Description, greatest(coalesce(p2.ts, '1979-01-01'), coalesce(p1.maxts, '1979-01-01')) as ts, p1.uuid AS objectid
FROM
(select *, max(ts) as maxts from parares GROUP BY id, date, seq, code) p1
left outer join
(SELECT id, date, max(room) as room, max(account) as account, max(remark) as remark, max(clinremark) as clinremark, max(ts) as ts, uuid FROM parahead p GROUP BY id, date) p2
ON (p1.id = p2.id AND p1.date = p2.date)

LEFT OUTER JOIN snomed s1 ON s1.code=p1.code
