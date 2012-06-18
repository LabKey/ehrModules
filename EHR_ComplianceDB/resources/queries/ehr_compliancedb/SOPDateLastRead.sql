/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

e.employeeId,
sop.id as SOP_ID,
sop.name,
sop.pdf,
sop.Spanish_PDF,
sop.video,
T1.LastRead,
sop.activeDate


FROM ehr_compliancedb.employees e 


LEFT JOIN
( SELECT max(t.date) as LastRead, t.SOPID, t.EmployeeId from ehr_compliancedb.SOPdates t group by t.employeeid, t.sopid) T1
 ON (T1.employeeId = e.employeeId )

LEFT JOIN "/WNPRC/WNPRC_Units/Animal_Services/Compliance_Training/Public/SOPs/".lists.SOPs sop
 ON (T1.SOPID = sop.id)