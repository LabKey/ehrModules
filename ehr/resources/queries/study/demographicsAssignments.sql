/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
a.Id,

group_concat(a.project) as projects,
group_concat(DISTINCT a.project.avail) as availability
FROM study.assignment a
WHERE a.qcstate.publicdata = true and a.enddate is null
GROUP BY a.id