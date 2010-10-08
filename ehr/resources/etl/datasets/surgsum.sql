/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
-- LabKey text column is limited to 4000 chars, use SUBSTR() to limit Description length.
SELECT lower(id) as Id, FixDateTime(date, time) AS Date, (pno) AS project, FixNewlines(so) AS so, FixNewlines(a) AS a, FixNewlines(p) AS p,
ts, uuid AS objectid,
(select UUID from surghead t2 WHERE p.id=t2.id AND p.date=t2.date AND p.time=t2.time GROUP BY p.id,p.date,p.time limit 1) as parentid
FROM surgsum s
WHERE id != '' and ts > ?



