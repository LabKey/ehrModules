/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDate(date) AS Date, Timestamp(Date('1970-01-01'), time) AS time, (age) AS age, (inves) AS inves, (pno) AS pno, 
(surgeon) AS surgeon, 
(enddate) AS enddate, (Timestamp(Date('1970-01-01'), endtime))  AS endtime, (major) AS major, (remark) AS description 
FROM surghead
