/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
--this query displays all animals co-housed with each housing record
--to be considered co-housed, they only need to overlap by any period of time

SELECT

h1.lsid,
h1.id,
h1.date  AS StartDate,
h1.enddate AS RemovalDate,
h1.room,
h1.cage,
h1.cond AS Condition,
--COALESCE(h2.id, 'Single Housed') AS RoommateId,
h2.id as RoommateId, 
h2.date AS RoommateStart,
h2.enddate AS RoommateEnd,
TIMESTAMPDIFF('SQL_TSI_DAY', h2.date, COALESCE(h2.enddate, curdate())) + round(TIMESTAMPDIFF('SQL_TSI_HOUR', h2.date, COALESCE(h2.enddate, curdate()))/24, 1) as DaysCoHoused,
h1.qcstate
FROM study.Housing h1

LEFT OUTER JOIN study.Housing h2
    ON (
      (
      (h2.Date >= h1.date AND h2.Date < COALESCE(h1.enddate, curdate()))
      OR
      (COALESCE(h2.enddate, curdate()) > h1.date AND COALESCE(h2.enddate, curdate()) <= COALESCE(h1.enddate, curdate()))
      OR
      (h2.Date <= h1.date AND COALESCE(h2.EndDate, curdate()) >= COALESCE(h1.enddate, curdate()))
      OR
      (h2.Date <= h1.date AND COALESCE(h2.EndDate, curdate()) >= COALESCE(h1.enddate, curdate()))

      ) AND
      h1.id != h2.id AND h1.room = h2.room AND h1.cage = h2.cage
      )


WHERE h1.qcstate.publicdata = true
AND h2.qcstate.publicdata = true