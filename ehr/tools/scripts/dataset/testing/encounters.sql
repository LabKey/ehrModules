/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

lower(x.id) as id,
x.date,
x.enddate,
x.pno,
x.vfyd as Status,
x.category,
x.ts,
x.uuid as objectid,
( CONCAT_WS(',\n',
     CONCAT('Patient Encounter: ', x.category)
     ) ) AS Description

FROM

(

SELECT
id,
FixDateTime(date, time) as date,
null as enddate,
pno,
vfyd,
'Behavior' AS category,
ts,
uuid

FROM behavehead
GROUP BY id, date, time, pno, vfyd

UNION ALL

/*
SELECT
id,
FixDate(date) as date,
null as enddate,
NULL as pno,
caseno as EncounterId,
NULL as vfyd,
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
vfyd,
'Clinical' AS category,
ts,
uuid

FROM clinhead
GROUP BY id, date, time, pno, vfyd

UNION ALL

SELECT
id,
FixDateTime(date, time) as date,
null as enddate,
pno,
NULL as vfyd,
'Hormone' AS category,
ts,
uuid

FROM hormhead
GROUP BY id, date, time, pno, vfyd

/*
UNION ALL

SELECT
id,
FixDate(date) as date,
null as enddate,
NULL AS pno,
caseno as EncounterId,
NULL as PerformedBy,
NULL AS vfyd,
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
NULL AS vfyd,
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

WHERE x.id != '' and x.date IS NOT NULL and x.date != '0000-00-00'