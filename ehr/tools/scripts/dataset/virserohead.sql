SELECT id, FixDate(date) as date, account, remark, clinremark,
concat_ws(',\n',
     CONCAT('Remark: ', remark),
     CONCAT('Clin Remark: ', clinremark)
     ) AS Description

FROM virserohead

