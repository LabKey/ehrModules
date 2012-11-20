/*
 * Copyright (c) 2010-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
PARAMETERS(StartDate TIMESTAMP, NumDays INTEGER DEFAULT 30)

SELECT
i.date,
cast(dayofyear(i.date) as integer) as DayOfYear,
cast(dayofmonth(i.date) as integer) as DayOfMonth,
cast(dayofweek(i.date) as integer) as DayOfWeek,
ceiling(cast(dayofmonth(i.date) as float) / 7.0) as WeekOfMonth,
cast(week(i.date) as integer) as WeekOfYear,

FROM (SELECT

timestampadd('SQL_TSI_DAY', i.key, CAST(COALESCE(StartDate, curdate()) AS TIMESTAMP)) as date,

FROM ehr_lookups.integers i

WHERE i.key <= NumDays) i
