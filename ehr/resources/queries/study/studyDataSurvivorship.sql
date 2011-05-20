/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
c.lsid,
c.id.dataset.demographics.calculated_status AS status,

CASE
WHEN c.date is not null
  THEN null
WHEN c.id.dataset.demographics.death is not null
  THEN age(c.date, c.id.dataset.demographics.death)
ELSE
  null
END as Survivorship,

-- CASE
-- WHEN c.date is not null
--   THEN 'No Date'
-- WHEN c.id.dataset.demographics.death is not null
--   THEN 'Animal Is Dead'
-- WHEN c.id.dataset.demographics.dapartdate is not null
--   THEN 'Animal Departed'
-- ELSE
--   'Animal Is Alive'
-- END as Comment


FROM study.studydata c