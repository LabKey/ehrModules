/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT *,

case
  when c.alertOnAny is true then true
  when (c.alertOnAbnormal is true AND (c.status='Low' or c.status='High')) then true
  else false
end as alertStatus

FROM (

SELECT

c.lsid,
c.id,
c.date,
c.gender,
c.species,
c.testId,
c.AgeAtTime,
c.ageClass,
c.result,
c.resultOORIndicator,
c.ref_range_min,
c.ref_range_max,
c.range,
c.status,
c.taskid,
c.qcstate,
c.alertOnAbnormal,
c.alertOnAny,
'Chemistry' as dataset,
'Chemistry_'||c.testid as test_key,
from study.chemistryRefRange c

union all

SELECT

c.lsid,
c.id,
c.date,
c.gender,
c.species,
c.testId,
c.AgeAtTime,
c.ageClass,
c.result,
c.resultOORIndicator,
c.ref_range_min,
c.ref_range_max,
c.range,
c.status,
c.taskid,
c.qcstate,
c.alertOnAbnormal,
c.alertOnAny,
'Hematology' as dataset,
'Hematology_'||c.testid as test_key,
from study.hematologyRefRange c

union all

SELECT

c.lsid,
c.id,
c.date,
c.gender,
c.species,
c.testId,
c.AgeAtTime,
c.ageClass,
c.result,
c.resultOORIndicator,
c.ref_range_min,
c.ref_range_max,
c.range,
c.status,
c.taskid,
c.qcstate,
c.alertOnAbnormal,
c.alertOnAny,
'Immunology' as dataset,
'Immunology_'||c.testid as test_key,
from study.immunologyRefRange c

union all

SELECT

c.lsid,
c.id,
c.date,
c.gender,
c.species,
c.testId,
c.AgeAtTime,
c.ageClass,
c.result,
c.resultOORIndicator,
c.ref_range_min,
c.ref_range_max,
c.range,
c.status,
c.taskid,
c.qcstate,
c.alertOnAbnormal,
c.alertOnAny,
'Urinalysis' as dataset,
'Urinalysis_'||c.testid as test_key,
from study.urinalysisRefRange c

) c

