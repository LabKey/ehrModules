/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
a.Id,

group_concat(a.project) as projects,
-- group_concat(DISTINCT a.project.avail.meaning) as availability,
group_concat(DISTINCT a.project.avail) as availability,
group_concat(DISTINCT a.project.title) as titles,

--   group_concat(
--   CASE
--     WHEN a.project.avail = 'u' and a.project != 20050602 THEN 'Unassigned'
--     WHEN a.project.avail = 'p' OR a.project = 20050602 THEN 'Pending Assignment'
--     WHEN a.project.avail = 'r' OR a.project.avail = 'n' THEN 'Assigned to Research'
--     WHEN a.project.avail = 'b' THEN 'Assigned to Breeding'
--   END)
CASE
  WHEN group_concat(DISTINCT a.project.avail) LIKE '%r%' THEN 'Assigned'
  WHEN group_concat(DISTINCT a.project.avail) LIKE '%n%' THEN 'Assigned'
  WHEN group_concat(DISTINCT a.project.avail) LIKE '%b%' THEN 'Assigned'
  WHEN group_concat(a.project) like '%20050602%' THEN 'Pending'
  WHEN group_concat(DISTINCT a.project.avail) LIKE '%p%' THEN 'Pending'

   ELSE 'Unassigned'
END as AssignmentStatus

FROM study.assignment a
WHERE a.qcstate.publicdata = true and (a.enddate is null or a.enddate > now())
GROUP BY a.id