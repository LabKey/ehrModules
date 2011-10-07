/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  b.id,
  b.date,
  b.testId,
  --b.runId,
  b.resultOORIndicator,
  b.result,
  b.qualresult,
  b.qcstate
FROM study."Urinalysis Results" b

WHERE
b.testId NOT IN ('BILIRUBIN', 'KETONE', 'SP_GRAVITY', 'BLOOD', 'PH', 'PROTEIN','UROBILINOGEN', 'NITRITE', 'LEUKOCYTES', 'APPEARANCE','MICROSCOPIC', 'GLUC')
or b.testid is null

