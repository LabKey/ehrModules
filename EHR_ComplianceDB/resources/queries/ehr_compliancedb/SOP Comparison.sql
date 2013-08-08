/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

e.EmployeeId,
e.email,
group_concat(sc.SOP_ID) as SOPs,
min(t1.LastRead) as FirstSOPDate,
max(t1.LastRead) as LastSOPDate,
count(sc.SOP_ID) as TotalSOPs,
count(t1.lastread) as ReadSOPs,
min(c.date) as FirstCompletionDate,
max(c.date) as LastCompletionDate,
CASE
WHEN count(t1.LastRead) = 0 then false
WHEN count(sc.SOP_ID) = count(t1.lastread) THEN true
else false END as Check,

FROM ehr_compliancedb.Employees e

LEFT JOIN ehr_compliancedb.SOPbyCategory sc
  ON (e.category = sc.category)

LEFT JOIN
  (SELECT max(t.date) AS LastRead, t.SOPID, t.EmployeeId FROM ehr_compliancedb.SOPdates t GROUP BY t.EmployeeId, t.SOPID) T1
  ON (T1.SOPID = sc.SOP_ID AND T1.EmployeeId = e.employeeid)

LEFT JOIN ehr_compliancedb.CompletionDates c
    ON (e.employeeid = c.employeeid AND c.RequirementName = 'SOP Review')
WHERE e.EndDateCoalesced >= curdate()
GROUP BY e.employeeid, e.email