/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

SELECT

h1.lsid,
h1.id,
TIMESTAMPDIFF('SQL_TSI_DAY', h1.date, COALESCE(h1.enddate, now())) + round(TIMESTAMPDIFF('SQL_TSI_HOUR', h1.date, COALESCE(h1.enddate, now()))/24, 1) as duration,
FROM study.Housing h1

