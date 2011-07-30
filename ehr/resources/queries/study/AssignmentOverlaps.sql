/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

--PARAMETERS(StartDate TIMESTAMP DEFAULT '1990-01-01', EndDate TIMESTAMP DEFAULT '2015-01-01', PROTOCOL CHAR DEFAULT NULL, PROJECT INTEGER DEFAULT null)
PARAMETERS(StartDate TIMESTAMP, EndDate TIMESTAMP, PROTOCOL CHAR, PROJECT INTEGER)

SELECT
h.lsid,
h.id,
h.date,
h.enddate,
h.project,
h.project.protocol as protocol,
h.project.avail as avail,
h.project.title as title,
h.qcstate,

CASE
  WHEN cast(COALESCE(STARTDATE, '1900-01-01') AS TIMESTAMP) > h.date
   THEN TIMESTAMPDIFF('SQL_TSI_DAY', CAST(COALESCE(STARTDATE, '1900-01-01') AS TIMESTAMP), CAST(COALESCE(ENDDATE, curdate())AS TIMESTAMP))
   ELSE TIMESTAMPDIFF('SQL_TSI_DAY', h.date, CAST(COALESCE(ENDDATE, curdate())AS TIMESTAMP))
END as TotalDays

FROM study.assignment h

WHERE

(h.project = CAST(PROJECT AS INTEGER) OR CAST(PROJECT AS INTEGER) is null) AND

(h.project.protocol = PROTOCOL OR PROTOCOL IS NULL OR PROTOCOL = '') AND

(
(cast(COALESCE(STARTDATE, '1900-01-01') AS TIMESTAMP) >= h.date AND cast(COALESCE(STARTDATE, '1900-01-01') AS TIMESTAMP) < COALESCE(h.enddate, curdate()))
OR
(COALESCE(ENDDATE, curdate()) > h.date AND COALESCE(ENDDATE, curdate()) <= COALESCE(h.enddate, curdate()))
OR
(cast(COALESCE(STARTDATE, '1900-01-01') AS TIMESTAMP) <= h.date AND COALESCE(ENDDATE, curdate()) >= COALESCE(h.enddate, curdate()))
)