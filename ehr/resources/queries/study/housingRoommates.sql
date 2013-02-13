/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
--this query displays all animals co-housed with each housing record
--to be considered co-housed, they only need to overlap by any period of time
SELECT
t.lsid,
t.id,
t.date as StartDate,
t.enddate as RemovalDate,
t.room,
t.cage,
t.RoommateId,
t.RoommateStart,
t.RoommateEnd,
TIMESTAMPDIFF('SQL_TSI_DAY', t.RoommateStart, COALESCE(t.RoommateEnd, now())) as DaysCoHoused,

t.qcstate,

FROM (

SELECT

h1.lsid,
h1.id,
h1.date,
h1.enddate,
h1.room,
h1.cage,
--h1.cond AS Condition,
--COALESCE(h2.id, 'Single Housed') AS RoommateId,
h2.id as RoommateId, 
CASE
  WHEN h2.date > h1.date THEN h2.date
  else h1.date
END AS RoommateStart,
CASE
  WHEN h2.enddateCoalesced < h1.enddateCoalesced THEN h2.enddate
  else h1.enddate
END AS RoommateEnd,

h1.qcstate
FROM study.Housing h1

LEFT OUTER JOIN study.Housing h2
    ON (
      (
      (h2.Date >= h1.date AND h2.Date < COALESCE(h1.enddate, now()))
      OR
      (h1.Date >= h2.date AND h1.Date < COALESCE(h2.enddate, now()))
      OR
      (COALESCE(h2.enddate, now()) > h1.date AND COALESCE(h2.enddate, now()) <= COALESCE(h1.enddate, now()))
      OR
      (h2.Date <= h1.date AND COALESCE(h2.EndDate, now()) >= COALESCE(h1.enddate, now()))
      OR
      (h2.Date <= h1.date AND COALESCE(h2.EndDate, now()) >= COALESCE(h1.enddate, now()))

      ) AND
      h1.id != h2.id AND h1.room = h2.room AND (h1.cage = h2.cage OR (h1.cage is null and h2.cage is null))
      )


WHERE h1.qcstate.publicdata = true
AND h2.qcstate.publicdata = true

) t