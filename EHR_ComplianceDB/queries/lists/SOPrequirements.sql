/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  sc.SOP_ID,
  e.Id,
  e.email,
  T1.LastRead,

  --we calculate the time since that test in months
  --age_in_months(T1.MostRecentDate, curdate()) AS TimeSinceTest,

  --we calculate the time until renewal
  --this throws an error on my laptop, but not the server
  /*
  CONVERT(
  CASE
    WHEN (T1.MostRecentDate IS NULL) THEN
      0
    ELSE
     (12 - (age_in_months(T1.MostRecentDate, curdate())))
  END, double)
  AS TimeUntilRenewal,
  */

  --we calculate the time until renewal
  --this subquery was written before I changed this to use joins
  --it is no longer needed, but i kept it b/c is uses age_in_months and is working
  CONVERT(
  CASE
    WHEN (T1.LastRead IS NULL) THEN
      0
    ELSE
      COALESCE(
        --(12 - age_in_months(T1.MostRecentDate, curdate())) , 0)

      (SELECT (12 - age_in_months(sq1.MostRecentDate, curdate())) AS TimeUntilRenewal
      FROM
        (SELECT max(t.date) AS MostRecentDate, t.SOP_ID, t.EmployeeId FROM "/WNPRC/WNPRC_Units/Animal_Services/Compliance_Training/Private/SOPs/".lists.SOPdates t GROUP BY t.EmployeeId, t.SOP_ID) sq1
        WHERE sq1.SOP_ID = sc.SOP_ID AND e.Id = sq1.EmployeeId), 0)
    END, double)
    AS MonthsUntilRenewal,

FROM "/WNPRC/WNPRC_Units/Animal_Services/Compliance_Training/Private/EmployeeDB/".lists.Employees e

LEFT JOIN "/WNPRC/WNPRC_Units/Animal_Services/Compliance_Training/Private/SOPs/".lists.SOPbyCategory sc
  ON (e.category = sc.category)

LEFT JOIN
  (SELECT max(t.date) AS LastRead, t.SOP_ID, t.EmployeeId FROM "/WNPRC/WNPRC_Units/Animal_Services/Compliance_Training/Private/SOPs/".lists.SOPdates t GROUP BY t.EmployeeId, t.SOP_ID) T1
  ON (T1.SOP_ID = sc.SOP_ID AND T1.EmployeeId = e.Id)

WHERE

--active employees only
e.EndDate IS NULL