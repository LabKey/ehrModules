/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDate(date) AS Date, name, value, units,
     ( CONCAT_WS(',\n',
     CONCAT('Test: ', name),
     CONCAT('Value: ', value, ' ', units)
     ) ) AS Description, ts, uuid AS objectid

FROM

(

SELECT id, date, name, value, NULL AS units, ts, uuid,
COALESCE((select UUID FROM chemistry t2 WHERE t1.id=t2.id and t1.date=t2.date limit 1), uuid) as parentid
FROM chemisc t1


UNION ALL

SELECT id, date, name, value, units, ts, uuid,
COALESCE((select UUID FROM chemistry t2 WHERE t1.id=t2.id and t1.date=t2.date limit 1), uuid) as parentid
FROM chemisc2 t1

) x

WHERE date = '0000-00-00' or name = '' or value = ''