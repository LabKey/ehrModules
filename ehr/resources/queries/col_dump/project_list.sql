/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
a.ts,
a.project,
t2.project as key2
FROM lists.project a
full join ehr.project t2
on a.project = t2.project
WHERE (t2.project is null or a.project is null)