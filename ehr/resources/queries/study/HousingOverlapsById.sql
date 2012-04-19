/*
 * Copyright (c) 2011-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

PARAMETERS(StartDate TIMESTAMP, EndDate TIMESTAMP)

SELECT
h.id

FROM study.housing h

WHERE

/*User must enter a start date */
coalesce(STARTDATE, cast('1900-01-01 00:00:00.0' as timestamp)) > cast('1900-01-02 00:00:00.0' as timestamp)
and
/* entered startdate must be <= enddate */
STARTDATE <= coalesce(ENDDATE, now())
and
/* entered startdate must be less than record's enddate */
coalesce( STARTDATE , cast('1900-01-01 00:00:00.0' as timestamp)) <= coalesce(h.enddate, now())
and
/* entered enddate must be greater than record's startdate */
coalesce(ENDDATE, now()) >= coalesce(h.date, now())
            


GROUP BY h.id