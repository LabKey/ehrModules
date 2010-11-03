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
i.description

from study.irregularObs i

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
t.description

FROM treatmentSchedule t


