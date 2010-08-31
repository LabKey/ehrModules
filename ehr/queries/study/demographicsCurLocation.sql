/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

d.id,

(d2.room || '-' || d2.cage) AS Location,

d2.room,

d2.cage,

d2.cond

FROM study.Demographics d

LEFT JOIN study.housing d2
  ON (d.Id = d2.Id AND d2.odate IS NULL)

WHERE d.death IS NULL AND (d.departdate IS NULL OR d.departdate < d.arrivedate)  