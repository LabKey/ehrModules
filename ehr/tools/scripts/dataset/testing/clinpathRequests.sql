/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
x.id
x.date,
x.uuid as objectId
x.userId,
x.ts,
x.category

FROM (

SELECT id, date, account, uuid, ts, null as userId, 'Bacteriology' as category
FROM bacteriology

UNION ALL

SELECT id, date, account, uuid, ts, null as userId, 'Chemistry' as category
FROM chemistry

UNION ALL

SELECT id, date, account, uuid, ts, null as userId, 'Hematology' as category
FROM hematology

UNION ALL

SELECT id, date, account, uuid, ts, null as userId, 'Immunology' as category
FROM immunology

UNION ALL

SELECT id, date, account, uuid, ts, null as userId, 'Parasitology' as category
FROM parahead

UNION ALL

SELECT id, date, account, uuid, ts, null as userId, 'Virology/Serology' as category
FROM virserohead
GROUP BY id, date, account

UNION ALL

SELECT id, date, account, uuid, ts, null as userId, 'Virology/Isolation' as category
FROM virisohead
GROUP BY id, date, account

UNION ALL

SELECT id, date, account, uuid, ts, null as userId, 'Urinalysis' as category
FROM urine




) x

where x.date != '0000-00-00'