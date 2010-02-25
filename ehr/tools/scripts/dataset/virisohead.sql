SELECT id, FixDate(date) as date, account, suspvirus, remark, clinremark,
concat_ws(',\n',
     CONCAT('Suspvirus: ', suspvirus),
     CONCAT('Remark: ', remark),
     CONCAT('Clin Remark: ', clinremark)
     ) AS Description

FROM virisohead

