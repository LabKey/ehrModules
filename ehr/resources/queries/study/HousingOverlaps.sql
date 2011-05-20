/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

PARAMETERS(StartDate TIMESTAMP DEFAULT '1990-01-01', EndDate TIMESTAMP DEFAULT '2015-01-01')

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


(STARTDATE >= h.date AND STARTDATE < COALESCE(h.enddate, curdate()))

OR

(COALESCE(ENDDATE, curdate()) > h.date AND COALESCE(ENDDATE, curdate()) <= COALESCE(h.enddate, curdate()))



