/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
d.room,
d.cage

FROM study.housing d

LEFT JOIN ehr_lookups.cage c
  on (c.room=d.room and c.cage=d.cage)

WHERE c.cage is null

group by d.room, d.cage