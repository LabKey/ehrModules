/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  p.protocol,
  p.approve,
  a.id,
  a.species,
  a.LatestStart,
  a.LatestEnd,

  COALESCE(a.Total, 0) AS TotalAssignments,

FROM ehr.protocol p

--we find total distinct animals ever assigned to this protocol
LEFT JOIN
  (SELECT a.Project.protocol as protocol, a.id, a.id.dataset.demographics.Species AS Species, count(*) AS Total, max(a.date) as LatestStart,
  CASE WHEN min(a.enddate) is null then null ELSE max(a.enddate) END
  as LatestEnd,
  FROM study.assignment a
  GROUP BY a.project.protocol, a.id, a.id.dataset.demographics.species) a
  ON (p.protocol = a.protocol)

WHERE a.Total > 0
