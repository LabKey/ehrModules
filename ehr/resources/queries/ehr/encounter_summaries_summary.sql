/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  p.parentid,
  group_concat(p.remark, chr(10)) as summary
FROM ehr.encounter_summaries p
GROUP BY p.parentid