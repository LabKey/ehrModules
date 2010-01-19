/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDate(date) AS Date, Timestamp(Date('1970-01-01'), time) AS time, (weight) AS weight, (verified) AS verified, ( CONCAT_WS(', ', 
     CASE WHEN weight IS NULL  THEN NULL ELSE CONCAT('weight: ', CAST(weight AS CHAR))  END, 
     CASE WHEN verified IS NULL  THEN NULL ELSE CONCAT('verified: ', CAST(verified AS CHAR))  END) ) AS Description FROM weight
