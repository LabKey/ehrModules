/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
Id,
LastName,
FirstName,
Email,
Title,
Unit,
Category,
Location,
OfficePhone

FROM lists.employees

WHERE

EndDate is null