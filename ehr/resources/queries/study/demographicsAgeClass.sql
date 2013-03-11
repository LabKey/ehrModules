/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

d.id,
ac.AgeClass,
ac.label

FROM study.demographics d
LEFT JOIN ehr_lookups.ageclass ac
ON (
  (CONVERT(age_in_months(d.birth, COALESCE(d.death, now())), DOUBLE) / 12) >= ac."min" AND
  ((CONVERT(age_in_months(d.birth, COALESCE(d.death, now())), DOUBLE) / 12) < ac."max" OR ac."max" is null) AND
  d.species = ac.species
)
WHERE d.birth IS NOT NULL
