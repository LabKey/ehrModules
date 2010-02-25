SELECT t1.id as id, FixDate(t1.date) as date, t1.seq as seq, t1.virus as virus, t1.result as result, t2.account as account, t2.remark as remark, t2.clinremark as clinremark,

concat_ws(',\n',
     CONCAT('Virus: ', t1.virus),
     CONCAT('Result: ', t1.result),
     CONCAT('Remark: ', t2.remark),
     CONCAT('Clin Remark: ', t2.clinremark)
     ) AS Description

FROM
  (SELECT * FROM virserores where id != "" group by id, date, seq, virus, result) t1
LEFT JOIN
  (SELECT * FROM virserohead where id != "" group by id, date, account) t2
ON (t1.id = t2.id AND t1.date = t2.date)

