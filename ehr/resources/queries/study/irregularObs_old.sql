/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

SELECT

o.id,
o.id.curLocation.room as Room,
o.id.curLocation.cage as Cage,
o.date,
-- convert((year(o.date) || '-' || month(o.date) || '-' || dayofmonth(o.date) || '-'), 'DATE') as DateOnly,
cast(o.date as DATE) as DateOnly,
o.userid,
o.feces,
o.menses,
o.behavior,
o.breeding,
o.other,
o.tlocation,
o.otherbehavior,
o.remark,
o.description

from study.obs o
-- LEFT JOIN study.housing h
--   ON (h.id=o.id AND h.date<=o.date AND (o.date<=coalesce(h.odate, now()) ))

WHERE
  (o.feces is not null AND o.feces !='') OR
  (o.menses is not null AND o.menses !='') OR
  (o.behavior is not null AND o.behavior !='') OR
  (o.breeding is not null AND o.breeding !='') OR
  (o.other is not null AND o.other !='') OR
  (o.tlocation is not null AND o.tlocation !='') OR
  (o.remark is not null AND o.remark !='') OR
  (o.otherbehavior is not null AND o.otherbehavior !='')

UNION ALL

SELECT

null as id,
c.room,
c.cage,
c.date,
-- -- convert((year(c.date) || '-' || month(c.date) || '-' || dayofmonth(c.date) || '-'), 'DATE') as DateOnly,
cast(c.date as DATE) as DateOnly,
c.userid,
null as feces,
null as menses,
null as behavior,
null as breeding,
null as other,
null as tlocation,
null as otherbehavior,
c.note as Remark,
null as description

FROM lists.cagenotes c



