/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

SELECT
b.dam as Id,
b.date,
'Birth' as type,
case
  when b.id.dataset.birth.weight is null
    then ('Offspring: ' || b.id)
  else ('Offspring: ' || b.id || chr(10) || 'Offspring Weight: ' || cast(b.id.dataset.birth.weight as numeric) || ' kg')
END as remark
from study.birth b
WHERE b.qcstate.publicdata = true AND b.dam is not null and b.dam != ''

UNION ALL

SELECT
v.Id,
v.date,
'Viral Challenge' as type,
v.remark
from study.ViralChallenges v

UNION ALL

SELECT
s.id,
s.date,
'Surgery' as type,
'Major: '||s.major as remark
FROM study."Clinical Encounters" s
WHERE s.qcstate.publicdata = true AND type = 'Surgery'

