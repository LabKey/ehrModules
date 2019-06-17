/*
 * Copyright (c) 2011-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

SELECT
CASE WHEN c.cage IS NULL THEN c.room ELSE (c.room || '-' || c.cage) END AS location,
c.room,
c.cage,
max(c.joinToCage) as joinToCage

FROM (

SELECT c.room, c.cage, c.joinToCage FROM ehr_lookups.cage c

UNION ALL

SELECT h.room, h.cage, null as joinToCage FROM study.housing h WHERE h.isActive = true

) c
WHERE c.room is not null and c.room != ''
group by c.room, c.cage