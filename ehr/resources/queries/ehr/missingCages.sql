/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
d.room,
d.cage

FROM study.demographics d

FULL JOIN ehr_lookups.cage c

WHERE c.room is null

group by d.room, d.cage