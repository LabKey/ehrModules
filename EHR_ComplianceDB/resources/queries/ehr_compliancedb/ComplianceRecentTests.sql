/*
 * Copyright (c) 2010-2014 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  e.employeeid,
  coalesce(rn.RequirementName, t1.requirementname) as requirementname,
  T1.timesCompleted,
  rn.ExpirePeriod,
  T1.MostRecentDate,

  --we calculate the time since that test in months
  age_in_months(T1.MostRecentDate, curdate()) AS TimeSinceTest,

  --we calculate the time until renewal
  CAST(
  CASE
    WHEN (e.isActive = false) THEN NULL --dont bother to include if the employee is not active
    WHEN (rn.requirementname IS NULL) THEN NULL
    WHEN (T1.MostRecentDate IS NULL) THEN 0
    WHEN(rn.ExpirePeriod = 0 OR rn.ExpirePeriod IS NULL) THEN NULL
    ELSE (rn.expirePeriod - (age_in_months(T1.MostRecentDate, curdate())))
  END AS double)
  AS MonthsUntilRenewal,

  --this is the logic to determine if the requirement is required
  --it is cut/paste from the WHERE clause below, so any change here should be reflected there too
  CASE
    --if this employee/test appears in the exemptions table, it's not required
    WHEN (ee.RequirementName is not null) THEN 'N'
    WHEN (rn.Required = TRUE) THEN 'Y'
    WHEN (e.Barrier = TRUE AND rn.Access = TRUE) THEN 'Y'
    WHEN (e.Animals = TRUE AND rn.Animals = TRUE) THEN 'Y'
    WHEN (e.contactsSla = TRUE AND rn.contactsSla = TRUE) THEN 'Y'
    WHEN (e.Tissue = TRUE AND rn.Tissues = TRUE) THEN 'Y'
    --if a requirement is mandatory for a given employee category/unit and this employee is one, it's required
    WHEN (rc.RequirementName IS NOT NULL) THEN 'Y'
    --this allows to non-standard requirements to be tracked
    WHEN (mt.RequirementName IS NOT NULL) THEN 'Y'
    ELSE 'N'
  END as isRequired

FROM ehr_compliancedb.Employees e

LEFT JOIN ehr_compliancedb.Requirements rn ON (1=1)

--we add in category/unit specific requirements
LEFT JOIN (
  SELECT e.employeeid, rc.requirementname
  FROM ehr_compliancedb.employees e
  JOIN ehr_compliancedb.requirementspercategory rc ON (
      (rc.Category = e.category AND rc.unit = e.unit) OR
      (rc.Category = e.category AND rc.unit IS NULL) OR
      (rc.Category IS NULL AND rc.unit = e.unit)
  )
  GROUP BY e.employeeid, rc.requirementname
) rc ON (rc.employeeid = e.employeeid AND rn.requirementname = rc.requirementname)

--we add in misc requirements specific per employee
LEFT JOIN (
  SELECT mt.employeeid, mt.requirementname
  FROM ehr_compliancedb.requirementsperemployee mt
  GROUP BY mt.employeeid, mt.requirementname
) mt ON (mt.RequirementName=rn.RequirementName AND mt.EmployeeId = e.employeeid)

--we add employee exemptions
LEFT JOIN (
  SELECT ee.employeeid, ee.requirementname
  FROM ehr_compliancedb.EmployeeRequirementExemptions ee
  GROUP BY ee.employeeid, ee.requirementname
) ee ON (ee.RequirementName=rn.RequirementName AND ee.EmployeeId = e.employeeid)

--we add the dates employees completed each requirement
LEFT JOIN (
  SELECT max(t.date) AS MostRecentDate, count(*) as timesCompleted, t.RequirementName, t.EmployeeId
  FROM ehr_compliancedb.CompletionDates t
  GROUP BY t.EmployeeId, t.RequirementName
) T1 ON (T1.RequirementName = rn.RequirementName AND T1.EmployeeId = e.employeeid)

WHERE
  --we compute whether this person requires this test
  --and only show required tests
  --it is nearly cut/paste from the CASE statement above, so any change here should be reflected there too
  --the only difference is that this has an additional condition to also include requirements the person happens to have completed
  CASE
    --if this employee/test appears in the exemptions table, it's not required
    WHEN (ee.RequirementName is not null) THEN false
    WHEN (rn.Required = TRUE) THEN TRUE
    WHEN (e.Barrier = TRUE AND rn.Access = TRUE) THEN TRUE
    WHEN (e.Animals = TRUE AND rn.Animals = TRUE) THEN TRUE
    WHEN (e.contactsSla = TRUE AND rn.contactsSla = TRUE) THEN TRUE
    WHEN (e.Tissue = TRUE AND rn.Tissues = TRUE) THEN TRUE
    --if a requirement is mandatory for a given employee category/unit and this employee is one, it's required
    WHEN (rc.RequirementName IS NOT NULL) THEN TRUE
    --this allows to non-standard requirements to be tracked
    WHEN (mt.RequirementName IS NOT NULL) THEN TRUE
    --include the requirement if the person happens to have completed it
    WHEN (T1.RequirementName IS NOT NULL) THEN TRUE
    ELSE FALSE
  END = TRUE