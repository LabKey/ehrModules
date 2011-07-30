/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  p.protocol,
  count(a.TotalAssignments) AS TotalActiveAnimals,
  --pc.allowed - p.TotalAnimals as TotalRemaining,

FROM lists.protocol p

--we find total distinct animals ever assigned to this protocol
LEFT JOIN
  (SELECT a.Project.protocol as protocol, a.id, count(*) AS TotalAssignments, max(a.date) as LatestStart, max(coalesce(a.enddate, now())) as LatestEnd FROM study.assignment a WHERE a.enddate is null GROUP BY a.project.protocol, a.id) a
  ON (p.protocol = a.protocol)

--WHERE a.Total > 0 --AND a.LatestEnd >= p.approve
group by p.protocol