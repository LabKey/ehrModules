/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDate(adate) AS Date, (pno) AS pno, (rdate) AS rdate, ( CONCAT_WS(', ', 
    CONCAT('adate: ', CAST(adate AS CHAR))  , 
     CASE WHEN rdate IS NULL  THEN NULL ELSE CONCAT('rdate: ', CAST(rdate AS CHAR))  END) ) AS Description FROM assignment
