/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as id, FixDate(date) AS Date, (lot) AS lot, (dilution) AS dilution, (eye) AS eye, (result1) AS result1, (result2) AS result2, (result3) AS result3,
( CONCAT_WS(',\n',
     CONCAT('Eye: ', eye),
     CONCAT('Result1: ', result1),
     CONCAT('Result2: ', result2),
     CONCAT('Result3: ', result3),
     CASE WHEN (lot IS NULL OR lot='') THEN NULL ELSE CONCAT('Lot: ', lot) END,
     CASE WHEN (dilution IS NULL  OR dilution='') THEN NULL ELSE CONCAT('Dilution: ', dilution) END

) ) AS Description, ts, uuid AS objectid

FROM tb

