/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  c.roomcage,
  c.room,
  c.cage,
  count(DISTINCT h.id) as TotalAnimals

FROM ehr_lookups.cages c

LEFT JOIN study.housing h

ON (c.room=h.room AND c.cage=h.cage)

WHERE h.odate IS NULL

GROUP BY c.roomcage, c.room, c.cage

