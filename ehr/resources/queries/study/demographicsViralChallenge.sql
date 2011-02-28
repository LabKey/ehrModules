/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

d.Id AS Id,

d.date,

round(
CASE
  WHEN (d.id.dataset.demographics.death IS NULL)
    THEN (timestampdiff('SQL_TSI_DAY', d.date, curdate())/7)
   ELSE
    --(timestampdiff('SQL_TSI_DAY', d.date, id.dataset.demographics.death)/7)
    null
END
, 1)
as WeeksSinceChallenge,

d.code,
d.remark,

v.challenge_type,

v.pathogen,

FROM study.drug d

JOIN ehr_lookups.Virus_SNOMED v ON v.code = d.code