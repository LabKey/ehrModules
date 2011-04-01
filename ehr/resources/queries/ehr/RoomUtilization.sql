/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  coalesce(h.room, c.room) as room,
  count(DISTINCT c.cage) as TotalCages,
  count(DISTINCT h.cage) as CagesUsed,
  count(DISTINCT c.cage) - count(DISTINCT h.cage) as CagesEmpty, 
  count(DISTINCT h.id) as TotalAnimals

FROM ehr_lookups.cage c

FULL JOIN study.housing h
  ON (c.room=h.room AND c.cage=h.cage)

WHERE h.odate IS NULL  and c.room is not null and c.room != ''

GROUP BY coalesce(h.room, c.room)

