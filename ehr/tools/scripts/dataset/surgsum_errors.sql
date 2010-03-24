/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
-- LabKey text column is limited to 4000 chars, use SUBSTR() to limit Description length.
SELECT id, FixDateTime(date, time) AS Date, (pno) AS pno, FixNewlines(so) AS so, FixNewlines(a) AS a, FixNewlines(p) AS p,
SUBSTR(CONCAT_WS(',\n',
     CONCAT('SO: ', FixNewlines(so)),
     CONCAT('A: ', FixNewlines(a)),
     CONCAT('P: ', FixNewlines(p))
), 1, 4000) AS Description
FROM surgsum
WHERE id = ''

