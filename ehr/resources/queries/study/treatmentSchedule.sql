/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

t1.id,
d.date,
t1.frequency,
t1.date as StartDate,
t1.enddate,
t1.project,
t1.code,
round(t1.volume, 2) || ' ' || t1.vunits as volume,
round(t1.conc, 2) || ' ' || t1.cunits as conc,
round(t1.amount, 2) || ' ' || t1.units as amount,
t1.route,
t1.userid,
t1.remark,

CASE
  WHEN (t1.frequency=1 OR t1.frequency=7 OR t1.frequency=8)
    THEN 'AM'
  --these are the multiple per day options
  WHEN (t1.frequency=2 OR t1.frequency=3 OR t1.frequency=6)
    THEN 'AM'
  WHEN (t1.frequency=4)
    THEN 'PM'
  WHEN (t1.frequency=5)
    THEN 'Night'
END as TimeOfDay

FROM lists.next30Days d

LEFT JOIN study.treatment_order t1
  ON (
  --daily
  (t1.frequency=1 OR t1.frequency=2 OR t1.frequency=3 OR t1.frequency=4 OR t1.frequency=5 OR t1.frequency=6)
  OR
  --monthly
  (t1.frequency=8 AND d.dayofmonth=1)
  OR
  --weekly
  (t1.frequency=7 AND d.dayofweek=2)
  OR
  --alternating days
  (t1.frequency=9 AND mod(d.dayofmonth,2)=1)
  )

--clunky, but it will add the second time for twice dailies
UNION ALL

SELECT

t1.id,
d.date,
t1.frequency,
t1.date as StartDate,
t1.enddate,
t1.project,
t1.code,
round(t1.volume, 2) || ' ' || t1.vunits as volume,
round(t1.conc, 2) || ' ' || t1.cunits as conc,
round(t1.amount, 2) || ' ' || t1.units as amount,
t1.route,
t1.userid,
t1.remark,

CASE
  WHEN (t1.frequency=2 OR t1.frequency=3)
    THEN 'PM'
  WHEN (t1.frequency=6)
    THEN 'Night'
END as TimeOfDay

FROM lists.next30Days d

LEFT JOIN study.treatment_order t1
  ON (
  --duplicate the daily ones
  (t1.frequency=2 OR t1.frequency=3 OR t1.frequency=6)
  )

--clunkier still, but will add the third per day dose
UNION ALL

SELECT

t1.id,
d.date,
t1.frequency,
t1.date as StartDate,
t1.enddate,
t1.project,
t1.code,
round(t1.volume, 2) || ' ' || t1.vunits as volume,
round(t1.conc, 2) || ' ' || t1.cunits as conc,
round(t1.amount, 2) || ' ' || t1.units as amount,
t1.route,
t1.userid,
t1.remark,


'Night' as TimeOfDay

FROM lists.next30Days d

LEFT JOIN study.treatment_order t1
  ON (t1.frequency=3)
