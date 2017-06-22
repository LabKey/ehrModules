/*
 * Copyright (c) 2010-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

d2.id,

-- Adding case statement because when cage is null no value is returned even when there is a room.
case when d2.cage is null THEN
d2.room
else (d2.room || '-' || d2.cage) end AS Location,

d2.room.area,

d2.room,

d2.cage
,

h.enddate as enddate

FROM study.housing d2
JOIN (SELECT id, max(date) as maxDate, max(enddate) as enddate FROM study.housing h GROUP BY id) h
ON (h.id = d2.id and d2.date = h.maxdate)
WHERE d2.qcstate.publicdata = true