/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
-- LabKey text column is limited to 4000 chars, use SUBSTR() to limit Description length.
SELECT lower(id) as Id, FixDateTime(date, time) AS Date, (pno) AS project, FixNewlines(so) AS so, FixNewlines(a) AS a, FixNewlines(p) AS p,
ts, uuid AS objectid,
(select group_concat(distinct UUID) as uuid from surghead t2 WHERE s.id=t2.id AND s.date=t2.date AND s.time=t2.time AND s.pno=t2.pno GROUP BY s.id,s.date,s.time,s.pno limit 1) as parentid
FROM surgsum s
WHERE id != '' and ts > ?



