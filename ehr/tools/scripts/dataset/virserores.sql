SELECT id, FixDate(date) as date, seq, virus, result,
concat_ws(',\n',
     CONCAT('Virus: ', virus),
     CONCAT('Result: ', result)
     ) AS Description

FROM virserores

