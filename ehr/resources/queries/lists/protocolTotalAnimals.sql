/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  p.protocol,
  
  CONVERT(COALESCE(Count(*), 0), INTEGER) AS TotalAnimals,

FROM lists.protocolAnimals p

GROUP BY p.protocol
