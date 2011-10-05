/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
a.ts,
a.protocol,
t2.protocol as key2
FROM lists.protocol a
full join ehr.protocol t2
on a.protocol = t2.protocol
WHERE (t2.protocol is null or a.protocol is null)