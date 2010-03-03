/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDate(date) AS Date, (sex) AS sex, (weight) AS weight, FixDateTime(wdate, wtime) AS wdate, (dam) AS dam, (sire) AS sire, (room) AS room, (cage) AS cage, (cond) AS cond, (origin) AS origin, (conception) AS conception, (type) AS type, FixNewlines(remark) AS remark,
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
     ) ) AS Description
FROM birth

