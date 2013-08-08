/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
e.employeeid,
e.LastName,
e.FirstName,
e.Email,
e.Title,
e.Unit,
e.Category,
e.Location,
e.OfficePhone

FROM ehr_compliancedb.employees e

WHERE

e.EndDateCoalesced >= curdate()