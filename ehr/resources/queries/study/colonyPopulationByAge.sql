/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  d.species,
  d.gender,
  d.id.age.AgeInYearsRounded AS AgeInYears,
  count(d.Id) AS AnimalCount

FROM study.Demographics d

WHERE d.id.status.status = 'Alive' AND d.species != 'Unknown'

GROUP BY d.species, d.gender, d.id.age.AgeInYearsRounded
-- ORDER BY d.id.species.species, d.gender, d.id.age.AgeInYears


