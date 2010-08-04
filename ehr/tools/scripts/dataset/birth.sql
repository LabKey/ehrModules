/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as id, FixDate(date) AS Date, sex as gender, weight, FixDateTime(wdate, wtime) AS wdate, lower(dam) as dam, lower(sire) as sire, room, cage, cond, origin, conception, type, FixNewlines(remark) AS remark, null as parentid,
     ( CONCAT_WS(',\n',
     CONCAT('Conception: ', CAST(conception AS CHAR)),
     CONCAT('Date: ', CAST(wdate AS CHAR)),
     CONCAT('Weight: ', CAST(weight AS CHAR)),
     CONCAT('Sex: ', sex),
     CONCAT('Dam: ', dam),
     CONCAT('Sire: ', sire),
     CONCAT('Room: ', room),
     CONCAT('Cage: ', cage),
     CONCAT('Cond: ', cond),
     CONCAT('Origin: ', origin),
     CONCAT('Type: ', type),
     CONCAT('Remark: ', remark)
     ) ) AS Description, ts, uuid AS objectid
FROM birth

