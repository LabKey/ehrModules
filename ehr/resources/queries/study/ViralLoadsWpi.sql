/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  v.Id,
  v.Date,
  vc.date as ChallengeDate,
  vc.code,
  v.ViralLoad,
  v.LogVL,
  TIMESTAMPDIFF('SQL_TSI_DAY', vc.date, v.Date) as DPI,
  TIMESTAMPDIFF('SQL_TSI_DAY', vc.date, v.Date)/7 as WPI

FROM study.ViralLoads v

LEFT JOIN demographicsViralChallenge vc
  ON (v.id = vc.id)


WHERE vc.pathogen = 'SIV' AND vc.challenge_Type = 'Challenge'

AND vc.date is not null
