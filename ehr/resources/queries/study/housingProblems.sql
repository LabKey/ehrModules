/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT * FROM (
  select
  h.id,
  group_concat(h.objectid) as ob,
  count(*) as count1
  from study.housing h
  where h.enddate is null
  group by h.id
  ) h
WHERE h.count1 > 1