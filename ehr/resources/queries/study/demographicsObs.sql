/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

  SELECT
    i.id,
    cast(cast(TIMESTAMPADD('SQL_TSI_DAY', -1, now()) AS DATE) AS TIMESTAMP) as yesterday,
    group_concat(i.description) as previousObs
  FROM (

  SELECT
  o.id,
  o.description
  from study.obs o
  WHERE o.isIrregular = true
  AND CAST(o.date AS DATE) = cast(TIMESTAMPADD('SQL_TSI_DAY', -1, now()) AS DATE)
  AND o.qcstate.publicdata = true

  UNION ALL

  SELECT
  c.id,
  c.remark

  FROM study."Cage Observations" c
  WHERE c.qcstate.publicdata = true
  AND CAST(c.date AS DATE) = cast(TIMESTAMPADD('SQL_TSI_DAY', -1, now()) AS DATE)

  ) i

GROUP BY i.id

