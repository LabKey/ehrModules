
/*
 * Copyright (c) 2010-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  proj.project,

  CONVERT(COALESCE(T2.Total, 0), INTEGER) AS ActiveAssignments,
  CONVERT(COALESCE(T3.RTotal, 0), INTEGER) AS ActiveAssignmentsRhesus,
  CONVERT(COALESCE(T1.Total, 0), INTEGER) AS ActiveAssignmentsMarmoset,
  CONVERT(COALESCE(T4.Total, 0), INTEGER) AS ActiveAssignmentsVervet,
  CONVERT(COALESCE(T5.Total, 0), INTEGER) AS ActiveAssignmentsCynomolgus,
  CONVERT(COALESCE(T6.Total, 0), INTEGER) AS ActiveAssignmentsCottonTopTamarin
  
FROM ehr.project proj

--we find total active animals assigned to this project  
LEFT JOIN
  (SELECT count(*) AS Total, T2.project FROM study.Assignment T2
  WHERE cast(T2.date as date) <= curdate() AND (T2.enddate IS null or cast(T2.enddate as date) >= curdate())
  GROUP BY T2.project) T2
  ON (CONVERT(T2.project, INTEGER) = convert(proj.project, integer))
  
--  total active rhesus that are assigned to this project
LEFT JOIN
  (SELECT count(*) AS RTotal, T3.project FROM study.Assignment T3
  WHERE cast(T3.date as date) <= curdate() AND (T3.enddate IS null or cast(T3.enddate as date) >= curdate())
      AND (T3.Id like 'r%')
   GROUP BY T3.project) T3
   ON (CONVERT(T3.project, INTEGER) = convert(proj.project, integer))

-- total active marmosets that are assigned to this project
LEFT JOIN
  (SELECT count(*) AS Total, T1.project FROM study.Assignment T1
  WHERE cast(T1.date as date) <= curdate() AND (T1.enddate IS null or cast(T1.enddate as date) >= curdate())
      AND (T1.Id like 'cj%')
   GROUP BY T1.project) T1
   ON (CONVERT(T1.project, INTEGER) = convert(proj.project, integer))

-- total active vervets that are assigned to this project
LEFT JOIN
  (SELECT count(*) AS Total, T4.project FROM study.Assignment T4
  WHERE cast(T4.date as date) <= curdate() AND (T4.enddate IS null or cast(T4.enddate as date) >= curdate())
      AND (T4.Id like 'ag%')
   GROUP BY T4.project) T4
   ON (CONVERT(T4.project, INTEGER) = convert(proj.project, integer))


-- total active cynomolgus that are assigned to this project
LEFT JOIN
  (SELECT count(*) AS Total, T5.project FROM study.Assignment T5
  WHERE cast(T5.date as date) <= curdate() AND (T5.enddate IS null or cast(T5.enddate as date) >= curdate())
      AND (T5.Id like 'cy%')
   GROUP BY T5.project) T5
   ON (CONVERT(T5.project, INTEGER) = convert(proj.project, integer))


-- total active Cotton-top Tamarin that are assigned to this project
LEFT JOIN
  (SELECT count(*) AS Total, T6.project FROM study.Assignment T6
  WHERE cast(T6.date as date) <= curdate() AND (T6.enddate IS null or cast(T6.enddate as date) >= curdate())
      AND (T6.Id like 'so%')
   GROUP BY T6.project) T6
   ON (CONVERT(T6.project, INTEGER) = convert(proj.project, integer))
  
