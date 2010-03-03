SELECT id, FixDate(date) as date, seq, source, result,
concat_ws(',\n',
     CONCAT('Source: ', source),
     CONCAT('Result: ', result)
     ) AS Description

FROM virisores v

