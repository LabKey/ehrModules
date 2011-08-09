/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

SELECT
*,
s.lsid || '||' || s.date as primaryKey,
null as initials,
null as restraint,
null as time,
(SELECT max(d.qcstate) as label FROM study.drug d WHERE (s.lsid || '||' || s.date) = d.parentid) as treatmentStatus,
(SELECT max(taskId) as taskId FROM study.drug d WHERE (s.lsid || '||' || s.date) = d.parentid) as taskId


FROM (
SELECT
t1.lsid,
t1.objectid,
t1.dataset,
t1.id,
-- t1.id.curLocation.room as CurrentArea,
-- t1.id.curLocation.room as CurrentRoom,
-- t1.id.curLocation.cage as CurrentCage,

t1.id.dataset.activehousing.area as CurrentArea,
t1.id.dataset.activehousing.room as CurrentRoom,
t1.id.dataset.activehousing.cage as CurrentCage,

CASE
  --these are AM,
  WHEN (t1.frequency=1 OR t1.frequency=7 OR t1.frequency=8 or t1.frequency=9 or t1.frequency=12)
    THEN timestampadd('SQL_TSI_HOUR', 8, d.date)
  --these are the multiple per day options
  WHEN (t1.frequency=2 OR t1.frequency=3 OR t1.frequency=6)
    THEN timestampadd('SQL_TSI_HOUR', 8, d.date)
  --noon
  WHEN (t1.frequency=11)
    THEN timestampadd('SQL_TSI_HOUR', 12, d.date)
  WHEN (t1.frequency=4)
    THEN timestampadd('SQL_TSI_HOUR', 14, d.date)
  WHEN (t1.frequency=5)
    THEN timestampadd('SQL_TSI_HOUR', 19, d.date)
END as date,

t1.frequency,
t1.date as StartDate,
t1.enddate,
t1.project,
CASE
  WHEN (t1.project = 300901 OR a1.project is not null) THEN null
  ELSE 'NOT ASSIGNED'
END AS projectStatus,
t1.meaning,
t1.code,

case
  WHEN (t1.volume is null or t1.volume = 0)
    THEN null
  else
    (CONVERT(t1.volume, NUMERIC) || ' ' || t1.vol_units)
END as volume2,
t1.volume,
t1.vol_units,
case
  WHEN (t1.concentration is null or t1.concentration = 0)
    THEN null
  else
    (CONVERT(t1.concentration, NUMERIC) || ' ' || t1.conc_units)
END as conc2,
t1.concentration,
t1.conc_units,
case
  WHEN (t1.amount is null or t1.amount = 0)
    THEN null
  else
    (CONVERT(t1.amount, NUMERIC) || ' ' || t1.amount_units)
END as amount2,
t1.amount,
t1.amount_units,
case
  WHEN (t1.dosage is null or t1.dosage = 0)
    THEN null
  else
    (CONVERT(t1.dosage, NUMERIC) || ' ' || t1.dosage_units)
END as dosage2,
t1.dosage,
t1.dosage_units,
t1.qualifier,

t1.route,
t1.performedby,
t1.remark,
t1.description,
CASE WHEN t1.enddate is null AND t1.meaning IS null AND t1.code.meaning IS null THEN
  ('Drug: ' || t1.code)
WHEN t1.enddate is null AND t1.meaning IS NOT null THEN
  ('Drug: ' || t1.meaning || ' (' || t1.code || ')')
WHEN t1.enddate is null AND t1.code.meaning IS NOT null THEN
  ('Drug: ' || t1.code.meaning || ' (' || t1.code || ')')
WHEN t1.enddate is not null AND t1.meaning IS NOT null THEN
  ('Drug: ' || t1.meaning || ' (' || t1.code || ')
End Date: ' || t1.enddate)
WHEN t1.enddate is not null AND t1.code.meaning IS NOT null THEN
  ('Drug: ' || t1.code.meaning || ' (' || t1.code || ')
End Date: ' || t1.enddate)
ELSE
  ('Drug: ' || t1.code || '
End Date: ' || t1.enddate)
END AS description2,
t1.qcstate,

CASE
  WHEN (t1.frequency=1 OR t1.frequency=7 OR t1.frequency=8 or t1.frequency=9)
    THEN 'AM'
  --these are the multiple per day options
  WHEN (t1.frequency=2 OR t1.frequency=3 OR t1.frequency=6)
    THEN 'AM'
  WHEN (t1.frequency=11)
    THEN 'Noon'
  WHEN (t1.frequency=12)
    THEN 'Any Time'
  WHEN (t1.frequency=4)
    THEN 'PM'
  WHEN (t1.frequency=5)
    THEN 'Night'
END as TimeOfDay,

CASE
  WHEN (t1.frequency=1 OR t1.frequency=7 OR t1.frequency=8 OR t1.frequency=9 or t1.frequency=12  OR t1.frequency=11)
    THEN 1
  --these are the multiple per day options
  WHEN (t1.frequency=2 OR t1.frequency=3 OR t1.frequency=6)
    THEN 1
  WHEN (t1.frequency=4)
    THEN 2
  WHEN (t1.frequency=5)
    THEN 3
END as SortOrder

FROM ehr_lookups.next30Days d

LEFT JOIN study."Treatment Orders" t1
  ON (d.date >= t1.date and (d.date <= cast(t1.enddate as date) OR t1.enddate is null) AND (
  --daily
  (t1.frequency=1 OR t1.frequency=2 OR t1.frequency=3 OR t1.frequency=4 OR t1.frequency=5 OR t1.frequency=6 OR t1.frequency=11 OR t1.frequency=12)
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
LEFT JOIN study.assignment a1
  ON (a1.project = t1.project AND a1.date <= d.date AND (a1.enddate is null or COALESCE(a1.enddate, curdate()) >= d.date) AND a1.id = t1.id)
WHERE t1.date is not null
AND t1.qcstate.publicdata = true

--clunky, but it will add the second time for twice dailies
UNION ALL

SELECT
t1.lsid,
t1.objectid,
t1.dataset,
t1.id,
-- t1.id.curLocation.room as CurrentArea,
-- t1.id.curLocation.room as CurrentRoom,
-- t1.id.curLocation.cage as CurrentCage,

t1.id.dataset.activehousing.area as CurrentArea,
t1.id.dataset.activehousing.room as CurrentRoom,
t1.id.dataset.activehousing.cage as CurrentCage,

CASE
  WHEN (t1.frequency=2 OR t1.frequency=3)
    THEN timestampadd('SQL_TSI_HOUR', 14, d.date)
  WHEN (t1.frequency=6)
    THEN timestampadd('SQL_TSI_HOUR', 19, d.date)
END as date,

t1.frequency,
t1.date as StartDate,
t1.enddate,
t1.project,
CASE
  WHEN (t1.project = 300901 OR a1.project is not null) THEN null
  ELSE 'NOT ASSIGNED'
END AS projectStatus,
t1.meaning,
t1.code,

case
  WHEN (t1.volume is null or t1.volume = 0)
    THEN null
  else
    (CONVERT(t1.volume, NUMERIC) || ' ' || t1.vol_units)
END as volume2,
t1.volume,
t1.vol_units,
case
  WHEN (t1.concentration is null or t1.concentration = 0)
    THEN null
  else
    (CONVERT(t1.concentration, NUMERIC) || ' ' || t1.conc_units)
END as conc2,
t1.concentration,
t1.conc_units,
case
  WHEN (t1.amount is null or t1.amount = 0)
    THEN null
  else
    (CONVERT(t1.amount, NUMERIC) || ' ' || t1.amount_units)
END as amount2,
t1.amount,
t1.amount_units,
case
  WHEN (t1.dosage is null or t1.dosage = 0)
    THEN null
  else
    (CONVERT(t1.dosage, NUMERIC) || ' ' || t1.dosage_units)
END as dosage2,
t1.dosage,
t1.dosage_units,
t1.qualifier,

t1.route,
t1.performedby,
t1.remark,
t1.description,
CASE WHEN t1.enddate is null AND t1.meaning IS null AND t1.code.meaning IS null THEN
  ('Drug: ' || t1.code)
WHEN t1.enddate is null AND t1.meaning IS NOT null THEN
  ('Drug: ' || t1.meaning || ' (' || t1.code || ')')
WHEN t1.enddate is null AND t1.code.meaning IS NOT null THEN
  ('Drug: ' || t1.code.meaning || ' (' || t1.code || ')')
WHEN t1.enddate is not null AND t1.meaning IS NOT null THEN
  ('Drug: ' || t1.meaning || ' (' || t1.code || ')
End Date: ' || t1.enddate)
WHEN t1.enddate is not null AND t1.code.meaning IS NOT null THEN
  ('Drug: ' || t1.code.meaning || ' (' || t1.code || ')
End Date: ' || t1.enddate)
ELSE
  ('Drug: ' || t1.code || '
End Date: ' || t1.enddate)
END AS description2,
t1.qcstate,

CASE
  WHEN (t1.frequency=2 OR t1.frequency=3)
    THEN 'PM'
  WHEN (t1.frequency=6)
    THEN 'Night'
END as TimeOfDay,

CASE
  WHEN (t1.frequency=2 OR t1.frequency=3)
    THEN 2
  WHEN (t1.frequency=6)
    THEN 3
END as SortOrder

FROM ehr_lookups.next30Days d

LEFT JOIN study."Treatment Orders" t1
  ON (d.date >= t1.date and (d.date <= cast(t1.enddate as date) OR t1.enddate is null) AND (
  --duplicate the daily ones
  (t1.frequency=2 OR t1.frequency=3 OR t1.frequency=6)
  ))
LEFT JOIN study.assignment a1
  ON (a1.project = t1.project AND a1.date <= d.date AND (a1.enddate is null or COALESCE(a1.enddate, curdate()) >= d.date) AND a1.id = t1.id)

WHERE t1.date is not null
AND t1.qcstate.publicdata = true

--clunkier still, but will add the third per day dose
UNION ALL

SELECT
t1.lsid,
t1.objectid,
t1.dataset,
t1.id,
-- t1.id.curLocation.room as CurrentArea,
-- t1.id.curLocation.room as CurrentRoom,
-- t1.id.curLocation.cage as CurrentCage,

t1.id.dataset.activehousing.area as CurrentArea,
t1.id.dataset.activehousing.room as CurrentRoom,
t1.id.dataset.activehousing.cage as CurrentCage,

timestampadd('SQL_TSI_HOUR', 19, d.date) as date,
t1.frequency,
t1.date as StartDate,
t1.enddate,
t1.project,
CASE
  WHEN (t1.project = 300901 OR a1.project is not null) THEN null
  ELSE 'NOT ASSIGNED'
END AS projectStatus,
t1.meaning,
t1.code,

case
  WHEN (t1.volume is null or t1.volume = 0)
    THEN null
  else
    (CONVERT(t1.volume, NUMERIC) || ' ' || t1.vol_units)
END as volume2,
t1.volume,
t1.vol_units,
case
  WHEN (t1.concentration is null or t1.concentration = 0)
    THEN null
  else
    (CONVERT(t1.concentration, NUMERIC) || ' ' || t1.conc_units)
END as conc2,
t1.concentration,
t1.conc_units,
case
  WHEN (t1.amount is null or t1.amount = 0)
    THEN null
  else
    (CONVERT(t1.amount, NUMERIC) || ' ' || t1.amount_units)
END as amount2,
t1.amount,
t1.amount_units,
case
  WHEN (t1.dosage is null or t1.dosage = 0)
    THEN null
  else
    (CONVERT(t1.dosage, NUMERIC) || ' ' || t1.dosage_units)
END as dosage2,
t1.dosage,
t1.dosage_units,
t1.qualifier,
t1.route,
t1.performedby,
t1.remark,
t1.description,
CASE WHEN t1.enddate is null AND t1.meaning IS null AND t1.code.meaning IS null THEN
  ('Drug: ' || t1.code)
WHEN t1.enddate is null AND t1.meaning IS NOT null THEN
  ('Drug: ' || t1.meaning || ' (' || t1.code || ')')
WHEN t1.enddate is null AND t1.code.meaning IS NOT null THEN
  ('Drug: ' || t1.code.meaning || ' (' || t1.code || ')')
WHEN t1.enddate is not null AND t1.meaning IS NOT null THEN
  ('Drug: ' || t1.meaning || ' (' || t1.code || ')
End Date: ' || t1.enddate)
WHEN t1.enddate is not null AND t1.code.meaning IS NOT null THEN
  ('Drug: ' || t1.code.meaning || ' (' || t1.code || ')
End Date: ' || t1.enddate)
ELSE
  ('Drug: ' || t1.code || '
End Date: ' || t1.enddate)
END AS description2,
t1.qcstate,

'Night' as TimeOfDay,

3 as SortOrder

FROM ehr_lookups.next30Days d

LEFT JOIN study."Treatment Orders" t1
  ON (d.date >= t1.date and (d.date <= cast(t1.enddate as date) OR t1.enddate is null) AND
    t1.frequency=3
  )
LEFT JOIN study.assignment a1
  ON (a1.project = t1.project AND a1.date <= d.date AND (a1.enddate is null or COALESCE(a1.enddate, curdate()) >= d.date) AND a1.id = t1.id)

WHERE t1.date is not null
AND t1.qcstate.publicdata = true

) s

