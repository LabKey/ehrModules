/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

SELECT
c.roomcage,
c.room,
c.cage

FROM (
SELECT
coalesce(c.room, d.room) || '-' || coalesce(c.cage, d.cage) as roomcage,
coalesce(c.room, d.room) as room,
coalesce(c.cage, d.cage) as cage

FROM ehr_lookups.cage c
FULL JOIN study.demographics d
  ON (c.room=d.room AND c.cage=d.cage)

) c
group by c.roomcage, c.room, c.cage