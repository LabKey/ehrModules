SELECT id, FixDate(date) as date, seq, virus, result,
concat_ws(',\n',
     CONCAT('Virus: ', virus),
     CONCAT('Result: ', result)
     ) AS Description

FROM virserores
WHERE date = '0000-00-00' OR id = ''
