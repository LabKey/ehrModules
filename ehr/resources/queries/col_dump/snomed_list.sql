/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
a.ts,
a.code,
t2.code as key2
FROM lists.snomed a
full join ehr_lookups.snomed t2
on a.code = t2.code
WHERE (t2.code is null or a.code is null)