/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  v.id,
  count(*) as numResults,
  group_concat(DISTINCT v.virus) as pathogens

FROM study.virologyResults v
WHERE v.qcstate.publicdata = true

GROUP BY v.id
