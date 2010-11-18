/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
c.lsid,

CASE
WHEN c.id.dataset.demographics.birth is null or c.date is null
  THEN null
ELSE
  ROUND(CONVERT(age_in_months(c.id.dataset.demographics.birth, COALESCE(c.id.dataset.demographics.death, c.date)), DOUBLE) / 12, 1)
END as AgeAtTime,

CASE
WHEN c.id.dataset.demographics.birth is null or c.date is null
  THEN null
ELSE
  floor(age(c.id.dataset.demographics.birth, COALESCE(c.id.dataset.demographics.death, c.date)))
END as AgeAtTimeYearsRounded,

CASE
WHEN c.id.dataset.demographics.birth is null or c.date is null
  THEN null
ELSE
  CONVERT(age_in_months(c.id.dataset.demographics.birth, COALESCE(c.id.dataset.demographics.death, c.date)), INTEGER)
END as AgeAtTimeMonths,

FROM study.studydata c