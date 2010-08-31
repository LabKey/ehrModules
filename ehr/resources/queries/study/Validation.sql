/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

a.id,

a.dataset.demographics.arrivedate,

a.MostRecentArrival.MostRecentArrival,

a.dataset.demographics.departdate,

a.MostRecentDeparture.MostRecentDeparture,

a.dataset.demographics.weight,

a.MostRecentWeight.MostRecentWeight,

a.dataset.demographics.room,

a.dataset.demographics.cage,

a.curLocation.Location,

a.dataset.demographics.status,

a.Status.Status as calculatedStatus,

CASE when a.dataset.demographics.arrivedate != a.MostRecentArrival.MostRecentArrival
THEN 'error'
else null
END as arrivalCheck,

CASE when a.dataset.demographics.departdate != a.MostRecentDeparture.MostRecentDeparture
THEN 'error'
else null
END as departureCheck,

CASE when a.dataset.demographics.weight != a.MostRecentWeight.MostRecentWeight
THEN 'error'
else null
END as weightCheck,

CASE when (a.dataset.demographics.room || '-' || a.dataset.demographics.cage) != a.curLocation.Location
THEN 'error'
else null
END as locationCheck,

CASE
when (a.dataset.demographics.status like 'alive' AND a.Status.Status != 'Alive')
THEN 'error'
WHEN
(a.dataset.demographics.status not like 'alive' AND a.Status.Status = 'Alive')
THEN 'error'
else null
END as aliveCheck,

FROM study.Animal a

WHERE

a.dataset.demographics.arrivedate != a.MostRecentArrival.MostRecentArrival

OR

a.dataset.demographics.departdate != a.MostRecentDeparture.MostRecentDeparture

OR

a.dataset.demographics.weight != a.MostRecentWeight.MostRecentWeight

OR

(a.dataset.demographics.room || '-' || a.dataset.demographics.cage) != a.curLocation.Location

OR

(a.dataset.demographics.status like 'Alive' AND a.Status.Status != 'Alive')

OR

(a.dataset.demographics.status not like 'Alive' AND a.Status.Status = 'Alive')


--status
--avail