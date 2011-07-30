/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

e.Id,
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

FROM "/WNPRC/WNPRC_Units/Animal_Services/Compliance_Training/Private/EmployeeDB/".lists.Employees e

LEFT JOIN "/WNPRC/WNPRC_Units/Animal_Services/Compliance_Training/Private/EmployeeDB/".lists.SOPbyCategory sc
  ON (e.category = sc.category)

LEFT JOIN
  (SELECT max(t.date) AS LastRead, t.SOP_ID, t.EmployeeId FROM "/WNPRC/WNPRC_Units/Animal_Services/Compliance_Training/Private/EmployeeDB/".lists.SOPdates t GROUP BY t.EmployeeId, t.SOP_ID) T1
  ON (T1.SOP_ID = sc.SOP_ID AND T1.EmployeeId = e.Id)

LEFT JOIN lists.CompletionDates c
    ON (e.id = c.employeeid AND c.RequirementName = 'SOP Review')
WHERE e.enddate is null
GROUP BY e.id, e.email