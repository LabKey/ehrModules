/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(t1.id) as id, FixDate(t1.date) as date, t1.seq as seq, t1.virus as virus, t1.result as result, t2.account as account, t2.remark as remark, t2.clinremark as clinremark,

concat_ws(',\n',
     CONCAT('Virus: ', t1.virus),
     CONCAT('Result: ', t1.result),
     CONCAT('Remark: ', t2.remark),
     CONCAT('Clin Remark: ', t2.clinremark)
     ) AS Description, greatest(coalesce(t2.ts, '1979-01-01'), coalesce(t1.ts, '1979-01-01')) as ts, t1.uuid AS objectid

FROM
  (SELECT *, max(ts) as maxts FROM virserores
  WHERE id IS NOT NULL AND id != "" AND date IS NOT NULL AND date != '0000-00-00'
  group by id, date, seq, virus, result) t1
LEFT JOIN
  (SELECT *, max(ts) as maxts FROM virserohead
  WHERE id IS NOT NULL AND id != "" AND date IS NOT NULL AND date != '0000-00-00'
  group by id, date, account) t2
ON (t1.id = t2.id AND t1.date = t2.date)
group by t1.uuid
having count(*) = 1

