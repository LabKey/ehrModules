/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDate(adate) AS Date, (pno) AS pno, FixDate(rdate) AS rdate,
    ( CONCAT_WS(',\n', 
    CONCAT('Arrival Date: ', CAST(adate AS CHAR))  ,
    CONCAT('Removal Date: ', CAST(rdate AS CHAR))
    ) ) AS Description
FROM assignment

