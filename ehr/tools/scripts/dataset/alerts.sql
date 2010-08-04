/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

SELECT
lower(x.id) as id,
FixDate(x.date) AS Date,
NULL as EndDate,
x.category,
x.userId,
x.value,
x.ts, uuid as objectid

FROM

(

SELECT
a.id,
a.birth as date,
null as userid,
'Hold Code' as category,
a.hold as value,
a.ts, uuid
FROM abstract a

UNION ALL

SELECT
id,
adate as date,
null as userid,
'Vet Exemption' as category,
title as value,
a.ts, a.uuid
FROM colony.assignment a
LEFT join colony.project p on a.pno = p.pno
where avail = 'v' and a.rdate = '0000-00-00'

UNION ALL

SELECT
id,
adate as date,
null as userid,
'Pending Assignment' as category,
title as value,
a.ts, a.uuid
FROM colony.assignment a
LEFT join colony.project p on a.pno = p.pno
where avail = 'p' and a.rdate = '0000-00-00'

) x