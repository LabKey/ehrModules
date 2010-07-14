/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as id, FixDateTime(idate, itime) AS date, room, cage, cond, FixDateTime(odate, otime) AS odate,
ts, uuid AS objectid
FROM housing
WHERE ts > ?
