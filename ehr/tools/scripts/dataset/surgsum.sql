/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
-- LabKey text column is limited to 4000 chars, use SUBSTR() to limit Description length.
SELECT id, FixDate(date) AS Date, (pno) AS pno, Timestamp(Date('1970-01-01'), time) AS time, FixNewlines(so) AS so, FixNewlines(a) AS a, FixNewlines(p) AS p, SUBSTR(CONCAT_WS(', ',
     CASE WHEN so IS NULL  OR so=''  THEN NULL ELSE CONCAT('so: ', FixNewlines(so))  END, 
     CASE WHEN a IS NULL  OR a=''  THEN NULL ELSE CONCAT('a: ', FixNewlines(a))  END, 
     CASE WHEN p IS NULL  OR p=''  THEN NULL ELSE CONCAT('p: ', FixNewlines(p))  END), 1, 4000) AS Description FROM surgsum
