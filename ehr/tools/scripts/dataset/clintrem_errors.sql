/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDateTime(date, time) AS Date, (pno) AS pno, (userid) AS userid, FixNewlines(remark) AS remark, FixNewlines(remark) AS description
FROM clintrem
WHERE id IS NULL OR id = ''
