/*
 * Copyright (c) 2011-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  sd.id,
  t.taskId,
  t.formtype

FROM ehr.tasks t

JOIN study.studydata sd

ON (t.taskid = sd.taskid)

GROUP BY t.taskId, t.formtype, sd.id

