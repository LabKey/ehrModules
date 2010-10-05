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
  ROUND(CONVERT(age_in_months(c.id.dataset.demographics.birth, c.date), DOUBLE) / 12, 1)
END as AgeAtTime

FROM study.studydata c