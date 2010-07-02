/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(t1.id) as id, FixDate(t1.date) AS date, t1.seq as seq, t1.source as source, t1.result as result, t2.account as account, t2.suspvirus as suspvirus, FixNewLines(t2.remark) as remark, FixNewLines(t2.clinremark) as clinremark,
concat_ws(',\n',
     CONCAT('Source: ', t1.source),
     CONCAT('Result: ', t1.result),
     CONCAT('Suspvirus: ', t2.suspvirus),
     CONCAT('Remark: ', t2.remark),
     CONCAT('Clin Remark: ', t2.clinremark)
     ) AS Description, greatest(coalesce(t2.ts, '1979-01-01'), coalesce(t1.ts, '1979-01-01')) as ts, t1.uuid AS objectid

FROM
(SELECT id, date, seq, source, result, max(ts) as ts, uuid FROM virisores WHERE result IS NOT NULL GROUP BY id, date, seq, source, result) t1
LEFT JOIN
(SELECT id, date, account, suspvirus, remark, clinremark, ts, uuid FROM virisohead) t2
on (t1.id = t2.id AND t1.date = t2.date)

