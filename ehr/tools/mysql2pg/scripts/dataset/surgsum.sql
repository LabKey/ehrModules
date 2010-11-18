/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
-- LabKey text column is limited to 4000 chars, use SUBSTR() to limit Description length.
SELECT lower(id) as Id, now() AS Date, (pno) AS project, null AS so, null AS a, null AS p,
ts, uuid AS objectid,
(select UUID from surghead t2 WHERE s.id=t2.id AND s.date=t2.date AND s.time=t2.time GROUP BY s.id,s.date,s.time limit 1) as parentid
FROM surgsum s
WHERE id != ''



