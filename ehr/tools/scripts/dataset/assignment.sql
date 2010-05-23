/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as id, FixDate(adate) AS Date, (pno) AS pno, FixDate(rdate) AS rdate, NULL as parentid,
    ( CONCAT_WS(',\n', 
    CONCAT('Arrival Date: ', CAST(adate AS CHAR))  ,
    CONCAT('Removal Date: ', CAST(rdate AS CHAR))
    ) ) AS Description, ts, uuid AS objectid
FROM assignment

