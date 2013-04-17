/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

d2.id,

CASE
  WHEN d2.cage is null then d2.room
  ELSE (d2.room || '-' || d2.cage)
END AS Location,

d2.room.area,

d2.room,

d2.cage,

d2.cond,

d2.date

FROM study.housing d2

WHERE d2.enddate IS NULL
AND d2.qcstate.publicdata = true