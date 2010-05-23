/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

lower(x.id) as id,
FixDate(x.date) as date,
x.source,
x.SpecimenType,
x.code,
x.quantity,
x.CollectedBy,
x.CollectionDate,
x.CollectionMethod,
x.SpecimenComment,
x.ReqId,
x.status,
x.uuid,
x.ts


FROM

(

SELECT
id,
date,
source,
't-70060' as SpecimenType,
null as code,
quantity,
CollectedBy,
date as CollectionDate,
method as CollectionMethod,
null as SpecimenComment,
null as ReqId,
uuid,
ts
FROM urine

UNION ALL

SELECT
id,
date,
source,
source as SpecimenType,
null as quantity,
null as CollectedBy,
date as CollectionDate,
null as CollectionMethod,
null as SpecimenComment,
null as ReqId,
uuid,
ts
FROM bacteriology


UNION ALL


SELECT
id,
date,
source,
source as SpecimenType,
null as quantity,
null as CollectedBy,
date as CollectionDate,
null as CollectionMethod,
null as SpecimenComment,
null as ReqId,
uuid,
ts
FROM virisores









) x


