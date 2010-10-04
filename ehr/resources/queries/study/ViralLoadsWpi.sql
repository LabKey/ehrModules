/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  v.Id,
  v.SampleDate,
  vc.date as ChallengeDate,
  vc.code,
  v.ViralLoad,
  v.LogVL,
  TIMESTAMPDIFF('SQL_TSI_DAY', vc.date, v.SampleDate) as DPI,
  TIMESTAMPDIFF('SQL_TSI_DAY', vc.date, v.SampleDate)/7 as WPI

FROM study.ViralLoads v

LEFT JOIN demographicsViralChallenge vc
  ON (v.id = vc.id)


WHERE vc.pathogen = 'SIV' AND vc.challengeType = 'Challenge'

AND vc.date is not null
