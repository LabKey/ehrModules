/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  e.employeeid,
  rn.RequirementName,
  rn.ExpirePeriod,
  T1.MostRecentDate,

  --we calculate the time since that test in months
  age_in_months(T1.MostRecentDate, curdate()) AS TimeSinceTest,

  --we calculate the time until renewal
  CONVERT(
  CASE
    WHEN (T1.MostRecentDate IS NULL) THEN
      0
    WHEN(rn.ExpirePeriod = 0 OR rn.ExpirePeriod IS NULL) THEN
      NULL
    ELSE
     (rn.expirePeriod - (age_in_months(T1.MostRecentDate, curdate())))
  END, double)
  AS MonthsUntilRenewal,

FROM ehr_compliancedb.Employees e

LEFT JOIN ehr_compliancedb.Requirements rn
  ON (1=1)

--we add in category/unit specific requirements
LEFT JOIN ehr_compliancedb.requirementspercategory rc
ON (rc.RequirementName=rn.RequirementName AND (
      rc.Category = e.category AND rc.unit = e.unit OR
      rc.Category = e.category AND rc.unit IS NULL OR
      rc.Category IS NULL AND rc.unit = e.unit
      ))

--we add in misc requirements specific per employee
LEFT JOIN ehr_compliancedb.requirementsperemployee mt
  ON (mt.RequirementName=rn.RequirementName AND mt.EmployeeId = e.employeeid)

--we add employee exemptions
LEFT JOIN ehr_compliancedb.EmployeeRequirementExemptions ee
  ON (ee.RequirementName=rn.RequirementName AND ee.EmployeeId = e.employeeid)

--we add the dates employees completed each requirement
LEFT JOIN
(SELECT max(t.date) AS MostRecentDate, t.RequirementName, t.EmployeeId FROM ehr_compliancedb.CompletionDates t GROUP BY t.EmployeeId, t.RequirementName) T1
  ON (T1.RequirementName = rn.RequirementName AND T1.EmployeeId = e.employeeid)

WHERE
  --we compute whether this person requires this test
  --and only show required tests

  CASE
    --if this employee/test appears in the exemptions table, it's not required
    WHEN ee.RequirementName is not null
      THEN false
    WHEN rn.Required = TRUE
      THEN TRUE
    WHEN (e.Barrier = TRUE AND rn.Access = TRUE)
      THEN TRUE
    WHEN (e.Animals = TRUE AND rn.Animals = TRUE)
      THEN TRUE
    WHEN (e.Tissue = TRUE AND rn.Tissues = TRUE)
      THEN TRUE
    --if a requirement is mandatory for a given employee category/unit and this employee is one, it's required
    WHEN (rc.RequirementName IS NOT NULL)
      THEN TRUE
    --this allows to non-standard requirements to be tracked
    WHEN (mt.RequirementName IS NOT NULL)
      THEN TRUE
    ELSE
      FALSE
  END
  = TRUE

  AND e.EndDate IS NULL