/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
e.Id,
CASE WHEN u1.DisplayName is null THEN 'NO' ELSE '' END AS "HasUsername",
CASE WHEN u2.DisplayName is NULL THEN 'NO' ELSE '' END AS "EmailExists",

CASE WHEN (u2.DisplayName is NOT NULL AND u1.displayName is not null) THEN '' ELSE 'NO' END AS "BothCorrect"

FROM lists.employees e

LEFT JOIN core.users u1
ON (e.id = u1.DisplayName)

LEFT JOIN core.users u2
ON (e.email = u2.email)

