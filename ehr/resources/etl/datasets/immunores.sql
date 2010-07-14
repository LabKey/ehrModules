/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as id, FixDate(date) AS Date, (reqid) AS requestId, (cd3) AS cd3, (cd20) AS cd20, (cd4) AS cd4, (cd8) AS cd8,
uuid as requestId,
ts, uuid AS objectid
FROM immunores
WHERE ts > ?
