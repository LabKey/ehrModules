/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDate(date) AS Date, Timestamp(Date('1970-01-01'), time) AS time, (source) AS source, FixNewlines(remark) AS remark, ( CONCAT_WS(', ', 
     CASE WHEN source IS NULL  OR source=''  THEN NULL ELSE CONCAT('source: ', source)  END, 
     CASE WHEN remark IS NULL  OR remark=''  THEN NULL ELSE CONCAT('remark: ', FixNewlines(remark))  END) ) AS Description FROM arrival
