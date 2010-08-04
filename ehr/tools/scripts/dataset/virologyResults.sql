/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
lower(x.id) as id,
FixDate(x.date) as date,
x.seq,
x.result,
x.source,
x.virus,
x.parentId,
x.parentId as runId,
x.ts,
x.uuid as objectId,
concat_ws(',\n',
     CONCAT('Source: ', x.source),
     CONCAT('Virus: ', x.virus),
     CONCAT('Result: ', x.result)
     ) AS Description

FROM (


SELECT t1.id, t1.date, seq, result, source,
(SELECT group_concat(distinct suspvirus) as suspvirus FROM virisohead t2 WHERE t1.id=t2.id AND t1.DATE =t2.date group by id, date, account limit 1) as virus,
(SELECT group_concat(distinct uuid) as uuid FROM virisohead t2 WHERE t1.id=t2.id AND t1.DATE =t2.date group by id, date, account limit 1) as parentId,
t1.ts, t1.uuid
FROM
(SELECT id, date, seq, source, result, max(ts) as ts, uuid FROM virisores
  WHERE result IS NOT NULL
  GROUP BY id, date, seq, source, result) t1
LEFT JOIN
  (SELECT *, max(ts) as maxts FROM virisohead
  WHERE id IS NOT NULL AND id != "" AND date IS NOT NULL AND date != '0000-00-00'
  group by id, date, account, suspvirus, remark, clinremark) t2
  ON (t1.id=t2.id AND t1.date=t2.date)

UNION ALL

SELECT t1.id, t1.date, seq, result, 'Sera' as source, virus,
(SELECT group_concat(distinct uuid) as uuid FROM virserohead t2 WHERE t1.id=t2.id AND t1.DATE =t2.date group by id, date, account limit 1) as parentId,
t1.ts, t1.uuid
FROM
  (SELECT *, max(ts) as maxts FROM virserores
  WHERE id IS NOT NULL AND id != "" AND date IS NOT NULL AND date != '0000-00-00'
  group by id, date, seq, virus, result) t1
) x