/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

SELECT

i.id,
i.Room,
i.Cage,
i.date,
i.DateOnly,
'Obs' as type,
i.userid,
i.remark,
i.dataset,
i.description,

from study.irregularObsByLocation i

UNION ALL

SELECT

t.id,
t.CurrentRoom as room,
t.CurrentCage as Cage,
t.date,
t.date as DateOnly,
'Treatment' as type,
t.userid,
null as remark, -- t.remark,
t.dataset,
CASE WHEN t.enddate is null THEN
  ('Drug: ' || t.code)
ELSE
  ('Drug: ' || t.code || '
End Date: ' || t.enddate)
END AS description2

FROM treatmentSchedule t


