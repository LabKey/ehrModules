/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

PARAMETERS(StartDate TIMESTAMP, EndDate TIMESTAMP)

SELECT
h.lsid,
h.id,
h.room,
h.cage,
h.date,
h.enddate,
h.cond,
h.istemp,
h.reason,
h.restraintType,
h.remark,
h.qcstate

FROM study.housing h

WHERE


(cast(COALESCE(STARTDATE, '1900-01-01') AS TIMESTAMP) >= h.date AND cast(COALESCE(STARTDATE, '1900-01-01') AS TIMESTAMP) < COALESCE(h.enddate, now()))

OR

(COALESCE(ENDDATE, now()) > h.date AND COALESCE(ENDDATE, now()) <= COALESCE(h.enddate, now()))

OR

(cast(COALESCE(STARTDATE, '1900-01-01') AS TIMESTAMP) <= h.date AND COALESCE(ENDDATE, now()) >= COALESCE(h.enddate, now()))