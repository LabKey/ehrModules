/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
(
SELECT

d.id.dataset.demographics.species,
count(d.Id) AS AnimalCount

FROM study.Demographics d

WHERE
d.calculated_status = 'Alive'
--d.calculated_status = 'Alive'
AND d.id.dataset.demographics.species != 'Unknown'

GROUP BY d.id.dataset.demographics.species
)

UNION ALL
(
SELECT null as Species, count(*) as AnimalCount

FROM study.Demographics d2

WHERE
--d2.id.status.status = 'Alive'
d2.calculated_status = 'Alive'
AND d2.id.dataset.demographics.species != 'Unknown'
)