/*
 * Copyright (c) 2010-2011 LabKey Corporation
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
convert(r.ref_range_min, numeric) || '-' || convert(r.ref_range_max, numeric) as range,
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
             FROM chemistryResults c
          ) c

LEFT JOIN ehr_lookups.ageclass ac
ON (
c.ageAtTime >= ac."min" AND
(c.ageAtTime < ac."max" OR ac."max" is null) AND
c.species = ac.species
)

LEFT JOIN ehr_lookups.lab_test_range r ON (
c.testId = r.test AND
c.species = r.species AND
ac.ageClass = r.age_class AND
c.gender = r.gender
)

