/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  p.protocol,
  count(a.TotalAssignments) AS TotalActiveAnimals,
  group_concat(distinct a.Id) AS ActiveAnimals,

FROM ehr.protocol p

--we find total distinct animals ever assigned to this protocol
LEFT JOIN
  (SELECT a.Project.protocol as protocol, a.id, count(*) AS TotalAssignments, max(a.date) as LatestStart,
  CASE WHEN min(a.enddate) is null then null ELSE max(a.enddate) END
  as LatestEnd FROM study.assignment a
  WHERE cast(a.date as date) <= curdate() AND (a.enddate is null or cast(a.enddate as date) >= curdate())
  GROUP BY a.project.protocol, a.id) a
  ON (p.protocol = a.protocol)

group by p.protocol