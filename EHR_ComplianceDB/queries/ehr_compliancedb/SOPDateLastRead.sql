/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

max(t.date) AS LastRead,
t.SOPID,
t.EmployeeId,
--t.EmployeeId.email as email,

FROM ehr_compliancedb.SOPdates t

GROUP BY t.EmployeeId, t.SOPID --, t.EmployeeId.email