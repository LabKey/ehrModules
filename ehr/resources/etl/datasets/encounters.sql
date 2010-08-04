/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

lower(x.id) as id,
x.date,
x.enddate,
x.pno as project,
x.category,
x.ts,
x.uuid as objectid

FROM

(
/*
SELECT
id,
FixDateTime(date, time) as date,
null as enddate,
pno,
'Behavior' AS category,
ts,
uuid

FROM behavehead
GROUP BY id, date, time, pno, vfyd

UNION ALL


SELECT
id,
FixDate(date) as date,
null as enddate,
NULL as pno,
caseno as EncounterId,
'Biopsy' AS category,
account,
ts,
uuid

FROM biopsyhead

UNION ALL
*/

SELECT
id,
FixDateTime(date, time) as date,
null as enddate,
pno,
'Clinical' AS category,
ts,
uuid

FROM clinhead
WHERE ts > ?
GROUP BY id, date, time, pno

UNION ALL

SELECT
id,
FixDateTime(date, time) as date,
null as enddate,
pno,
'Hormone' AS category,
ts,
uuid

FROM hormhead
WHERE ts > ?
GROUP BY id, date, time, pno

/*
UNION ALL

SELECT
id,
FixDate(date) as date,
null as enddate,
NULL AS pno,
caseno as EncounterId,
NULL as PerformedBy,
'Necropsy' AS category,
account,
ts,
uuid

FROM necropsyhead

UNION ALL

SELECT
id,
FixDateTime(date, time) as date,
FixDateTime(enddate, endtime) as enddate,
pno,
null as EncounterId,
surgeon as PerformedBy,
'Surgery' AS category,
NULL AS account,
ts,
uuid

/* major
age
inves
remark,

FROM surghead
GROUP BY id, surghead.date, surghead.time, pno
*/

) x

