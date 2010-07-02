/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/* no time column */
SELECT lower(id) as id, FixDate(date) AS Date, caseno, account,
Concat('Biopsy: ', caseno) AS description,
ts, uuid AS objectid
FROM biopsyhead
GROUP BY id, date, caseno, account
