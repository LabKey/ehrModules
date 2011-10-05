/*
 * Copyright (c) 2011 LabKey Corporation
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
  b.qcstate,
  b.taskid
FROM study."Hematology Results" b

WHERE b.testId NOT IN ('WBC', 'RBC', 'HGB', 'HCT', 'MCV', 'MCH', 'MCHC', 'RDW', 'PLT', 'MPV', 'PCV', 'NE', 'LY', 'MN', 'EO', 'BS', 'BANDS', 'METAMYELO', 'MYELO', 'TP', 'RETICULO', 'PRO MYELO', 'ATYL LYMPH', 'OTHER')
or b.testid is null
