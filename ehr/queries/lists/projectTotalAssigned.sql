/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  proj.project,

  CONVERT(COALESCE(T2.Total, 0), INTEGER) AS ActiveAssignments,

FROM lists.project proj

--we find total active animals assigned to this project  
LEFT JOIN
  (SELECT count(*) AS Total, T2.project FROM study.Assignment T2 WHERE T2.rdate IS null GROUP BY T2.project) T2
  ON (CONVERT(T2.project, INTEGER) = convert(proj.project, integer))
