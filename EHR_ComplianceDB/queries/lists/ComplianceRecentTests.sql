/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  e.Id,
  rn.RequirementName,
  rn.ExpirePeriod,
  T1.MostRecentDate,

  --we calculate the time since that test in months
  --age_in_months(T1.MostRecentDate, curdate()) AS TimeSinceTest,

  --we calculate the time until renewal
  /*
  CONVERT(
  CASE
    WHEN (T1.MostRecentDate IS NULL) THEN
      0
    WHEN(rn.ExpirePeriod = 0 OR rn.ExpirePeriod IS NULL) THEN
      NULL
    ELSE
     (rn.expirePeriod - (age_in_months(T1.MostRecentDate, curdate())))
  END, double)
  AS TimeUntilRenewal,
  */

  --we calculate the time until renewal
  --this subquery was written before I changed this to use joins
  --it is no longer needed, but i kept it b/c is uses age_in_months and is working
  CONVERT(
  CASE
    WHEN (T1.MostRecentDate IS NULL) THEN
      0
    WHEN(rn.ExpirePeriod = 0 OR rn.ExpirePeriod IS NULL) THEN
      NULL
    ELSE
        COALESCE(
        --(rn.ExpirePeriod - age_in_months(T1.MostRecentDate, curdate())) , 0)

      (SELECT (rn.ExpirePeriod - age_in_months(sq1.MostRecentDate, curdate())) AS TimeUntilRenewal
      FROM
        (SELECT max(t.date) AS MostRecentDate, t.RequirementName, t.EmployeeId FROM "/WNPRC/WNPRC_Units/Animal_Services/Compliance_Training/Private/EmployeeDB/".lists.CompletionDates t GROUP BY t.EmployeeId, t.RequirementName) sq1
        WHERE sq1.RequirementName = rn.RequirementName AND e.Id = sq1.EmployeeId), 0)
    END, double)
    AS MonthsUntilRenewal,

FROM "/WNPRC/WNPRC_Units/Animal_Services/Compliance_Training/Private/EmployeeDB/".lists.Employees e
    LEFT OUTER JOIN "/WNPRC/WNPRC_Units/Animal_Services/Compliance_Training/Private/EmployeeDB/".lists.RequirementsList rn

    --we add in more fields
    LEFT JOIN "/WNPRC/WNPRC_Units/Animal_Services/Compliance_Training/Private/EmployeeDB/".lists.EmployeeMiscRequirements mt
    ON (mt.RequirementName=rn.RequirementName AND mt.EmployeeId = e.Id)

    LEFT JOIN
    (SELECT max(t.date) AS MostRecentDate, t.RequirementName, t.EmployeeId FROM "/WNPRC/WNPRC_Units/Animal_Services/Compliance_Training/Private/EmployeeDB/".lists.CompletionDates t GROUP BY t.EmployeeId, t.RequirementName) T1
    ON (T1.RequirementName = rn.RequirementName AND T1.EmployeeId = e.Id)

WHERE
  --we compute whether this person requires this test
  --and only show required tests
  --the logic is defined by the Employee and TestName tables
  CASE
    WHEN rn.Required IS TRUE
      THEN TRUE
    WHEN (e.Category.Barrier IS TRUE AND rn.Access IS TRUE)
      THEN TRUE
    WHEN (e.Category.Animals IS TRUE AND rn.Animals IS TRUE)
      THEN TRUE
    WHEN (e.Category.Tissue IS TRUE AND rn.Tissues IS TRUE)
      THEN TRUE
    --if a requirement is mandatory for a given employee category and this employee is one, it's required
    WHEN (e.Category != '' AND rn.Category = e.Category)
      THEN TRUE
    --this allows to non-standard requirements to be tracked
    WHEN (rn.CertainPeople IS TRUE AND mt.RequirementName IS NOT NULL)
      THEN TRUE
    ELSE
      FALSE
  END
  IS TRUE

  AND e.EndDate IS NULL