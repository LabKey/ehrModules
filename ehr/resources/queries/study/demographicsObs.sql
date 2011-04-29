/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

  SELECT
    i.id,
    cast(TIMESTAMPADD('SQL_TSI_DAY', -1, now()) AS DATE) as yesterday,
    group_concat(i.description) as yesterdaysObs,

  FROM study.irregularObs i
  WHERE CAST(i.date AS DATE) = cast(TIMESTAMPADD('SQL_TSI_DAY', -1, now()) AS DATE)
  GROUP BY i.id


