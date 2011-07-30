/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

max(t.date) AS LastRead,
t.SOP_ID,
t.EmployeeId,
--t.EmployeeId.email as email,

FROM "/WNPRC/WNPRC_Units/Animal_Services/Compliance_Training/Private/EmployeeDB/".lists.SOPdates t

GROUP BY t.EmployeeId, t.SOP_ID --, t.EmployeeId.email