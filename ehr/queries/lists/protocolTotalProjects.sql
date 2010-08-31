/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  p.protocol,

  CONVERT(COALESCE(p2.Total, 0), INTEGER) AS TotalProjects,

FROM lists.protocol p

--we find total projects assigned to this protocol  
LEFT JOIN
  (SELECT count(*) AS Total, p2.protocol FROM lists.project p2 GROUP BY p2.protocol) p2
  ON (p.protocol = p2.protocol)
