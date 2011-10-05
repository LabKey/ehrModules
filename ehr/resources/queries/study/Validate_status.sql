/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

select * from (

SELECT

a.id,
a.status as demographicsStatus,
a.calculated_status,
a.birth as demographicsBirth,
a.id.dataset.birth.date as birthTable,
a.death as demographicsDeath,
a.id.dataset.deaths.date as deathTable,
a.id.MostRecentArrival.MostRecentArrival as MostRecentArrival,
a.id.MostRecentDeparture.MostRecentDeparture as MostRecentDeparture,

CASE
  WHEN
    (a.created IS NULL)
    THEN 'No Information'
  WHEN
    (a.id.dataset.birth.date IS NULL AND a.id.MostRecentArrival.MostRecentArrival IS NULL)
    THEN 'Never at WNPRC'
  WHEN
    (a.death IS NOT NULL)
    THEN 'Dead'
  WHEN
    (a.id.MostRecentDeparture.MostRecentDeparture IS NOT NULL AND (a.id.MostRecentArrival.MostRecentArrival IS NULL OR a.id.MostRecentDeparture.MostRecentDeparture > a.id.MostRecentArrival.MostRecentArrival))
    THEN 'Shipped'
  WHEN
    (a.id.dataset.birth.date IS NOT NULL OR a.id.MostRecentArrival.MostRecentArrival IS NOT NULL) AND (a.id.MostRecentDeparture.MostRecentDeparture IS NULL OR a.id.MostRecentDeparture.MostRecentDeparture < a.id.MostRecentArrival.MostRecentArrival)
    THEN 'Alive'
  ELSE
    'ERROR'
END as status,

FROM study.demographics a

) a

WHERE

(
--a.calculated_status is null

--OR

(a.status like 'Alive' AND a.calculated_status != 'Alive')

OR

(a.status like 'Dead' AND a.calculated_status != 'Dead')

OR

(a.deathTable is not null AND a.calculated_status != 'Dead')

OR

(a.status like 'Shipped' AND a.calculated_status != 'Shipped' and a.demographicsDeath is null)

OR

a.calculated_status = 'No Record At WNPRC'

OR

a.calculated_status = 'ERROR'
)
