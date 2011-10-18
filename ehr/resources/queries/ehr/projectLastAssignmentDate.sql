/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  proj.project,

  T1.LastAssignmentDate,

FROM ehr.project proj

--we find the most recent assignment date
LEFT JOIN
  (SELECT count(*) AS Total, T1.project, max(T1.date) AS LastAssignmentDate FROM study.Assignment T1 GROUP BY T1.project) T1
  --TODO: remove this convert once we change project to integer
  ON (CONVERT(T1.project, INTEGER) = CONVERT(proj.project, integer))

