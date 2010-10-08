/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

o.lsid,

CASE
WHEN(
  (o.feces is not null AND o.feces !='') OR
  (o.menses is not null AND o.menses !='') OR
  (o.behavior is not null AND o.behavior !='') OR
  (o.breeding is not null AND o.breeding !='') OR
  (o.other is not null AND o.other !='') OR
  (o.tlocation is not null AND o.tlocation !='') OR
  (o.remark is not null AND o.remark !='') OR
  (o.otherbehavior is not null AND o.otherbehavior !='')
)
THEN true
ELSE false
END as hasObs,

convert((year(o.date) || '-' || month(o.date) || '-' || dayofmonth(o.date) || '-'), 'DATE') as DateOnly

FROM study.obs o

