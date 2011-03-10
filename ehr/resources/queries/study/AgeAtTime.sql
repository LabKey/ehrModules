/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

--NOTE: do not need to account for QCstate b/c study.demographics only allows 1 row per subject

SELECT
c.lsid,

CAST(
CASE
WHEN c.id.dataset.demographics.birth is null or c.date is null
  THEN null
ELSE
  ROUND(CONVERT(age_in_months(c.id.dataset.demographics.birth, COALESCE(c.id.dataset.demographics.death, c.date)), DOUBLE) / 12, 1)
END AS numeric) as AgeAtTime,

CAST(
CASE
WHEN c.id.dataset.demographics.birth is null or c.date is null
  THEN null
ELSE
  floor(age(c.id.dataset.demographics.birth, COALESCE(c.id.dataset.demographics.death, c.date)))
END AS numeric) as AgeAtTimeYearsRounded,

CAST(
CASE
WHEN c.id.dataset.demographics.birth is null or c.date is null
  THEN null
ELSE
  CONVERT(age_in_months(c.id.dataset.demographics.birth, COALESCE(c.id.dataset.demographics.death, c.date)), INTEGER)
END AS numeric) as AgeAtTimeMonths,

FROM study.studydata c