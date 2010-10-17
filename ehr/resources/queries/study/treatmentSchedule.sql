/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
t1.lsid,
t1.id,
t1.id.curLocation.room as CurrentRoom,
t1.id.curLocation.cage as CurrentCage,

d.date,
t1.frequency,
t1.date as StartDate,
t1.enddate,
t1.project,
t1.code,
case
  WHEN (t1.volume is null or t1.volume = 0)
    THEN null
  else
    (CONVERT(t1.volume, NUMERIC) || ' ' || t1.vunits)
END as volume,
case
  WHEN (t1.conc is null or t1.conc = 0)
    THEN null
  else
    (CONVERT(t1.conc, NUMERIC) || ' ' || t1.cunits)
END as conc,
case
  WHEN (t1.amount is null or t1.amount = 0)
    THEN null
  else
    (CONVERT(t1.amount, NUMERIC) || ' ' || t1.units)
END as amount,

t1.route,
t1.userid,
t1.remark,
t1.description,

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
  ON (d.date >= t1.date and (d.date <= t1.enddate OR t1.enddate is null) AND (
  --daily
  (t1.frequency=1 OR t1.frequency=2 OR t1.frequency=3 OR t1.frequency=4 OR t1.frequency=5 OR t1.frequency=6)
  OR
  --monthly
  --always 1st tues
  (t1.frequency=8 AND d.dayofmonth<=7 AND d.dayofweek=3)
  OR
  --weekly
  --always on same day as start date
  (t1.frequency=7 AND d.dayofweek=dayofweek(t1.date))
  OR
  --alternating days.  relative to start date
  (t1.frequency=9 AND mod(d.dayofyear,2)=mod(cast(dayofyear(t1.date) as integer),2))
  ))

WHERE t1.date is not null


--clunky, but it will add the second time for twice dailies
UNION ALL

SELECT
t1.lsid,
t1.id,
t1.id.curLocation.room as CurrentRoom,
t1.id.curLocation.cage as CurrentCage,

d.date,
t1.frequency,
t1.date as StartDate,
t1.enddate,
t1.project,
t1.code,
case
  WHEN (t1.volume is null or t1.volume = 0)
    THEN null
  else
    (CONVERT(t1.volume, NUMERIC) || ' ' || t1.vunits)
END as volume,
case
  WHEN (t1.conc is null or t1.conc = 0)
    THEN null
  else
    (CONVERT(t1.conc, NUMERIC) || ' ' || t1.cunits)
END as conc,
case
  WHEN (t1.amount is null or t1.amount = 0)
    THEN null
  else
    (CONVERT(t1.amount, NUMERIC) || ' ' || t1.units)
END as amount,
t1.route,
t1.userid,
t1.remark,
t1.description,

CASE
  WHEN (t1.frequency=2 OR t1.frequency=3)
    THEN 'PM'
  WHEN (t1.frequency=6)
    THEN 'Night'
END as TimeOfDay

FROM lists.next30Days d

LEFT JOIN study.treatment_order t1
  ON (d.date >= t1.date and (d.date <= t1.enddate OR t1.enddate is null) AND (
  --duplicate the daily ones
  (t1.frequency=2 OR t1.frequency=3 OR t1.frequency=6)
  ))

WHERE t1.date is not null


--clunkier still, but will add the third per day dose
UNION ALL

SELECT
t1.lsid,
t1.id,
t1.id.curLocation.room as CurrentRoom,
t1.id.curLocation.cage as CurrentCage,

d.date,
t1.frequency,
t1.date as StartDate,
t1.enddate,
t1.project,
t1.code,
case
  WHEN (t1.volume is null or t1.volume = 0)
    THEN null
  else
    (CONVERT(t1.volume, NUMERIC) || ' ' || t1.vunits)
END as volume,
case
  WHEN (t1.conc is null or t1.conc = 0)
    THEN null
  else
    (CONVERT(t1.conc, NUMERIC) || ' ' || t1.cunits)
END as conc,
case
  WHEN (t1.amount is null or t1.amount = 0)
    THEN null
  else
    (CONVERT(t1.amount, NUMERIC) || ' ' || t1.units)
END as amount,
t1.route,
t1.userid,
t1.remark,
t1.description,

'Night' as TimeOfDay

FROM lists.next30Days d

LEFT JOIN study.treatment_order t1
  ON (d.date >= t1.date and (d.date <= t1.enddate OR t1.enddate is null) AND 
    t1.frequency=3
    )

WHERE t1.date is not null