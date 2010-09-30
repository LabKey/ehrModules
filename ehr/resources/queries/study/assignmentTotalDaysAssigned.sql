/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
--TODO: verify single day assignments
SELECT

T1.id,
T1.year,

--T1.StartYear,
--T1.EndYear,



convert(SUM(
CASE
  WHEN (T1.year > T1.startYear AND T1.year < T1.EndYear) THEN
    365
  WHEN (T1.year = T1.startYear AND T1.year < T1.EndYear) THEN
    TIMESTAMPDIFF('SQL_TSI_DAY', T1.date, convert('12-12-'||T1.year, DATE))
  WHEN (T1.year > T1.startYear AND T1.year = T1.EndYear) THEN
    TIMESTAMPDIFF('SQL_TSI_DAY', convert('01-01-'||T1.year, DATE), T1.rdate)
  WHEN (T1.year = T1.startYear AND T1.year = T1.EndYear) THEN
    TIMESTAMPDIFF('SQL_TSI_DAY', T1.date, T1.rdate)
  ELSE
    9999
END
), integer)
AS TotalDaysAssigned,



FROM (
SELECT

a.id,
i.year,

a.date,
coalesce(a.rdate, curdate()) AS rdate,

convert(year(a.date), 'INTEGER') as StartYear,
convert(year(coalesce(a.rdate, curdate())), 'INTEGER') as EndYear,

--TIMESTAMPDIFF('SQL_TSI_DAY', a.date, coalesce(a.rdate, curdate())) AS TotalDaysAssigned,

FROM (SELECT convert(year(curdate()), 'INTEGER')-i.key as Year FROM lists.integers i WHERE i.key <=5) i
LEFT JOIN study.assignment a
  ON (
  i.Year >= year(a.date)
  AND i.year <= year(coalesce(a.rdate, curdate()))
  AND (a.project.avail = 'n' OR a.project.avail = 'r')
  )

) T1



GROUP BY T1.id, T1.year
ORDER BY T1.id, T1.year