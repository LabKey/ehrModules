/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

d.id,
ac.AgeClass,
--ac.dataset,

FROM study.Demographics d
LEFT JOIN lists.ageclass ac
ON (
d.id.age.ageInYears IS NOT NULL AND
d.id.age.ageInYears >= ac."min" AND
(d.id.age.ageInYears <= ac."max" OR ac."max" is null) AND
d.species = ac.species
)
