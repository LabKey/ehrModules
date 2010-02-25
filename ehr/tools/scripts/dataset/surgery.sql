/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDateTime(date, time) AS Date, (age) AS age, (inves) AS inves, (pno) AS pno,
(surgeon) AS surgeon,
FixDateTime(enddate, endtime) AS enddate, (major) AS major, FixNewlines(remark) AS remark,
(CONCAT_WS(',\n',
    CONCAT('Start: ', CAST(FixDateTime(date, time) AS CHAR)),
    CONCAT('End: ', CAST(FixDateTime(enddate, endtime) AS CHAR)),
    CONCAT('Age: ', CAST(age AS CHAR)),
    CONCAT('Investigator: ', CAST(inves AS CHAR)),
    CONCAT('Surgeon: ', CAST(surgeon AS CHAR)),
    CONCAT('Major: ', CAST(major AS CHAR)),
    CONCAT('Project: ', CAST(pno AS CHAR)),
    CONCAT('Remark: ', FixNewLines(remark))
)) AS Description
FROM surghead
