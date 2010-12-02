/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

d.id,
ac.AgeClass,

FROM study.demographics d
LEFT JOIN lists.ageclass ac
ON (
d.birth IS NOT NULL AND
(CONVERT(age_in_months(d.birth, COALESCE(d.death, curdate())), DOUBLE) / 12) >= ac."min" AND
((CONVERT(age_in_months(d.birth, COALESCE(d.death, curdate())), DOUBLE) / 12) <= ac."max" OR ac."max" is null) AND
d.species = ac.species
)
