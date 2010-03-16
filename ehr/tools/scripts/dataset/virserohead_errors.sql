SELECT id, FixDate(date) as date, account, remark, clinremark,
concat_ws(',\n',
     CONCAT('Remark: ', remark),
     CONCAT('Clin Remark: ', clinremark)
     ) AS Description

FROM virserohead
WHERE date = '0000-00-00' OR id = ''
