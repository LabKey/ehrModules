/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

b.id,
b.date,
max(b.bilirubin) as bilirubin,
max(b.ketone) as ketone,
max(b.sp_gravity) as sp_gravity,
max(b.blood) as blood,
max(b.ph) as pH,
max(b.protein) as protein,
max(b.urobilinogen) as urobilinogen,
max(b.nitrite) as nitrite,
max(b.leukocytes) as leukocytes,
max(b.appearance) as appearance,
max(b.microscopic) as microscopic

FROM (

SELECT

b.id,
b.date,
b.runId,

CASE WHEN b.testid='BILIRUBIN'
  THEN b.qualResult
  ELSE null
END as bilirubin,

CASE WHEN b.testid='KETONE'
  THEN b.qualResult
  ELSE null
END as ketone,

CASE WHEN b.testid='SP_GRAVITY'
  THEN b.result
  ELSE null
END as sp_gravity,

CASE WHEN b.testid='BLOOD'
  THEN b.qualResult
  ELSE null
END as blood,

CASE WHEN b.testid='PH'
  THEN b.result
  ELSE null
END as ph,

CASE WHEN b.testid='PROTEIN'
  THEN b.qualResult
  ELSE null
END as protein,

CASE WHEN b.testid='UROBILINOGEN'
  THEN b.result
  ELSE null
END as urobilinogen,

CASE WHEN b.testid='NITRITE'
  THEN b.qualResult
  ELSE null
END as nitrite,

CASE WHEN b.testid='LEUKOCYTES'
  THEN b.qualResult
  ELSE null
END as leukocytes,

CASE WHEN b.testid='APPEARANCE'
  THEN b.qualResult
  ELSE null
END as appearance,

CASE WHEN b.testid='MICROSCOPIC'
  THEN b.qualResult
  ELSE null
END as microscopic


FROM study."Urinalysis Results" b
WHERE b.qcstate.publicdata = true

) b

GROUP BY b.id, b.date, b.runId