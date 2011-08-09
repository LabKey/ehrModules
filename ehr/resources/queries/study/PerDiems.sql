/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
--this query displays all animals co-housed with each housing record
--to be considered co-housed, they only need to overlap by any period of time

SELECT
    h.id,
    --h.project,
    --h.project.protocol,
    h.account,
    h.type,
    sum(h.totalDays) as totalDays
FROM study.PerDiemsByDay h

GROUP BY h.id, h.account, h.type