/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
(
SELECT

d.id.species.species,
count(d.Id) AS AnimalCount

FROM study.Demographics d

WHERE
d.id.status.status = 'Alive'
AND d.id.species.species != 'Unknown'

GROUP BY d.id.species.species
)

UNION ALL
(
SELECT 'Total' as Species, count(*) as AnimalCount

FROM study.Demographics d2

WHERE
d2.id.status.status = 'Alive'
AND d2.id.species.species != 'Unknown'
)