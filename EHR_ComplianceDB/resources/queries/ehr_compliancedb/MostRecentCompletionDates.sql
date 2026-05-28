/*
 * Copyright (c) 2020-2026 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
PARAMETERS (RequirementName VARCHAR DEFAULT 'SOP REVIEW-ANNUAL')

SELECT t1.employeeid, t3.lastname, t3.firstname, t1.requirementname, t1.date
FROM ehr_compliancedb.completiondates t1
  JOIN ehr_compliancedb.employees t3
    ON t1.employeeid = t3.employeeid
WHERE EXISTS (SELECT 1
              FROM ehr_compliancedb.completiondates t2
              WHERE t1.employeeid = t2.employeeid
                    AND t1.requirementname = t2.requirementname
                    AND UPPER(t2.requirementname) = UPPER(RequirementName)
              GROUP BY t2.employeeid, t2.requirementname
              HAVING t1.date = MAX(t2.date))
ORDER BY LOWER(t1.employeeid) ASC
