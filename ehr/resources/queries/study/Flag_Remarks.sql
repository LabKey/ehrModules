/*
 * Copyright (c) 2015 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

 /* Created 2-25-2015 Blasa  - Provide Filtered information on Animal Flags  */

SELECT
      a.participantid as Id,
      a.date as date,
      b.category as alert,
      b.value as alertMeaning,
       a.remark as remark,
       a.performedby performedby





FROM study.Flags a, ehr_lookups.flag_values b
Where not(a.remark = '')
And (a.enddate is null or a.enddate >= now() )
And a.flag = b.objectid
And b.category = 'Alert'


