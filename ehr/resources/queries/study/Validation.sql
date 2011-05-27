/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

a.id,

-- a.dataset.demographics.arrivedate,

-- a.MostRecentArrival.MostRecentArrival,

-- a.dataset.demographics.departdate,

-- a.MostRecentDeparture.MostRecentDeparture,

-- a.dataset.demographics.weight,

-- a.MostRecentWeight.MostRecentWeight,

-- a.dataset.demographics.room,

-- a.dataset.demographics.cage,

-- a.curLocation.Location,

a.dataset.demographics.status,
a.dataset.demographics.calculated_status,
--a.Status.Status as calculatedStatus,

-- CASE when cast(a.dataset.demographics.arrivedate AS date) != cast(a.MostRecentArrival.MostRecentArrival as date)
-- THEN 'error'
-- else null
-- END as arrivalCheck,

-- CASE when cast(a.dataset.demographics.departdate AS DATE) != cast(a.MostRecentDeparture.MostRecentDeparture AS DATE)
-- THEN 'error'
-- else null
-- END as departureCheck,

-- CASE when a.dataset.demographics.weight != a.MostRecentWeight.MostRecentWeight
-- THEN 'error'
-- else null
-- END as weightCheck,

-- CASE when (a.dataset.demographics.room || '-' || a.dataset.demographics.cage) != a.curLocation.Location
-- THEN 'error'
-- else null
-- END as locationCheck,

CASE
when (a.dataset.demographics.status like 'alive' AND a.dataset.demographics.calculated_status != 'Alive')
THEN 'error'
WHEN (a.dataset.demographics.status not like 'alive' AND a.dataset.demographics.calculated_status = 'Alive')
THEN 'error'
else null
END as aliveCheck,

FROM study.Animal a

WHERE

-- cast(a.dataset.demographics.arrivedate AS date) != cast(a.MostRecentArrival.MostRecentArrival as date)
--
-- OR
--
-- cast(a.dataset.demographics.departdate AS DATE) != cast(a.MostRecentDeparture.MostRecentDeparture AS DATE)

-- OR
--
-- a.dataset.demographics.weight != a.MostRecentWeight.MostRecentWeight

-- OR
--
-- (a.dataset.demographics.room || '-' || a.dataset.demographics.cage) != a.curLocation.Location
--
-- OR

(a.dataset.demographics.status like 'Alive' AND a.dataset.demographics.calculated_status != 'Alive')

OR

(a.dataset.demographics.status not like 'Alive' AND a.dataset.demographics.calculated_status = 'Alive')


--status
--avail