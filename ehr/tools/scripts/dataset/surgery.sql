/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDate(date) AS Date, Timestamp(Date('1970-01-01'), time) AS time, (age) AS age, (inves) AS inves, (pno) AS pno,
(surgeon) AS surgeon,
(enddate) AS enddate, (Timestamp(Date('1970-01-01'), endtime))  AS endtime, (major) AS major, FixNewlines(remark) AS remark,
(CONCAT_WS(', ',
    CASE WHEN age IS NULL OR age='' THEN NULL ELSE CONCAT('age: ', CAST(age AS CHAR)) END,
    CASE WHEN inves IS NULL OR inves='' THEN NULL ELSE CONCAT('inves: ', CAST(inves AS CHAR)) END,
    CASE WHEN surgeon IS NULL OR surgeon='' THEN NULL ELSE CONCAT('surgeon: ', CAST(surgeon AS CHAR)) END,
    CASE WHEN major IS NULL OR major='' THEN NULL ELSE CONCAT('major: ', CAST(major AS CHAR)) END
)) AS Description
FROM surghead
