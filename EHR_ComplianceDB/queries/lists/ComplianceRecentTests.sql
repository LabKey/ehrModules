SELECT
  e.PersonID,
  e.LastName,
  rn.RequirementName,
  rn.ExpirePeriod,
  T1.MostRecentDate,
  
  --we calculate the time since that test in months
  age_in_months(T1.MostRecentDate, curdate()) AS TimeSinceTest,

  --we calculate the time until renewal
  /*
  CASE
    WHEN (T1.MostRecentDate IS NULL) THEN
      0
    ELSE
     (rn.expirePeriod - (age_in_months(T1.MostRecentDate, curdate())))
  END AS TimeUntilRenewal,
  */

  --we calculate the time until renewal
  --this subquery was written before I changed this to use joins
  --it is no longer needed, but i kept it b/c is uses age_in_months and is working 
  
  CASE
    WHEN (T1.MostRecentDate IS NULL) THEN
      0
    WHEN(rn.ExpirePeriod = 0 OR rn.ExpirePeriod IS NULL) THEN
      NULL
    ELSE
      COALESCE((SELECT (rn.ExpirePeriod - age_in_months(sq1.MostRecentDate, curdate())) AS TimeUntilRenewal
      FROM
        (SELECT max(t.date) AS MostRecentDate, t.RequirementName, t.PersonId FROM lists.CompletionDates t GROUP BY t.PersonID, t.RequirementName) sq1
      WHERE sq1.RequirementName = rn.RequirementName AND e.PersonID = sq1.PersonID), 0)
    END
    AS MonthsUntilRenewal,

FROM lists.employees e
    LEFT OUTER JOIN lists.RequirementsList rn

    --we add in more fields
    LEFT JOIN lists.EmployeeMiscRequirements mt
    ON (mt.RequirementName=rn.RequirementName AND mt.PersonId = e.PersonID)

    LEFT JOIN
    (SELECT max(t.date) AS MostRecentDate, t.RequirementName, t.PersonId FROM lists.CompletionDates t GROUP BY t.PersonID, t.RequirementName) T1
    ON (T1.RequirementName = rn.RequirementName AND T1.PersonID = e.PersonID)

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
