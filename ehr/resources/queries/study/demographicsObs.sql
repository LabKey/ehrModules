
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
  CASE
    WHEN (o.remark is null and o.description is not null) THEN o.description
    WHEN (o.remark is not null and o.description is null) THEN o.remark
    WHEN (o.remark is not null and o.description is not null) THEN (o.remark||';'||o.description)
    else null
  END as description
  from study.obs o
  WHERE o.isIrregular = true
  AND (
    CAST(o.date AS DATE) = cast(TIMESTAMPADD('SQL_TSI_DAY', -1, now()) AS DATE)
    OR
    CAST(o.date AS DATE) = cast(now() AS DATE)
  )
  AND o.qcstate.publicdata = true

  UNION ALL

  SELECT
  c.id,
  CASE
    WHEN (c.remark is null and c.description is not null) THEN c.description
    WHEN (c.remark is not null and c.description is null) THEN c.remark
    WHEN (c.remark is not null and c.description is not null) THEN (c.remark||';'||c.description)
    else null
  END as description

  FROM study."Cage Observations" c
  WHERE c.qcstate.publicdata = true
  AND (
    CAST(c.date AS DATE) = cast(TIMESTAMPADD('SQL_TSI_DAY', -1, now()) AS DATE)
    OR
    CAST(c.date AS DATE) = cast(now() AS DATE)
  )


  ) i

GROUP BY i.id
