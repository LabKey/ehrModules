/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

c.lsid,
c.gender,
c.species,
c.testId,
c.AgeAtTime,
ac.ageClass,
r.ref_range_min,
r.ref_range_max,
round(r.ref_range_min, 1) || '-' || round(r.ref_range_max, 1) as range,
CASE
WHEN convert(c.result, double) >= r.ref_range_min AND convert(c.result, double) <= r.ref_range_max
  THEN 'Normal'
WHEN convert(c.result, double) < r.ref_range_min
  THEN 'Low'
WHEN convert(c.result, double) > r.ref_range_max
  THEN 'High'
END as status

FROM
          (
            SELECT
            c.lsid,
            c.id.dataset.demographics.gender as gender,
            c.id.species.species as species,
            c.testId,
            c.result,
            c.id,
              ROUND(CONVERT(age_in_months(c.id.dataset.demographics.birth, c.date), DOUBLE) / 12, 1) as AgeAtTime
             FROM hematologyResults c
          ) c

LEFT JOIN lookups.ageclass ac
ON (
c.ageAtTime >= ac."min" AND
(c.ageAtTime < ac."max" OR ac."max" is null) AND
c.species = ac.species
)

LEFT JOIN lookups.lab_test_range r ON (
c.testId = r.test AND
c.species = r.species AND
ac.ageClass = r.age_class AND
c.gender = r.gender
)
