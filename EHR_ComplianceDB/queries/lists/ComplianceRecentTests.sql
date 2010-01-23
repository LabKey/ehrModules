SELECT
  e.key,
  e.wiscID AS WiscID,
  e.LastName,
  rn.RequirementName,
  rn.ExpirePeriod,        
        
  --we compute whether this person requires this test
  --the logic is defined by the Employee and TestName tables
  CASE
    WHEN rn.Required IS TRUE
      THEN true
    WHEN (e.Category.Barrier IS TRUE AND rn.Access IS TRUE)
      THEN true
    WHEN (e.Category.Animals IS TRUE AND rn.Animals IS TRUE)
      THEN true
    WHEN (e.Category.Tissue IS TRUE AND rn.Tissues IS TRUE)
      THEN true
    --if a requirement is mandatory for a given employee category and this employee is one, it's required
    WHEN (e.Category != '' AND rn.Category = e.Category)
      THEN true
    WHEN (rn.SpecificPeople IS TRUE)
      THEN
      --need subquery
      FALSE
    ELSE
      FALSE
  END
  AS TestRequired,

  --we find the date of the last test where TestName matches the one in this row
  (SELECT sq1.MostRecentDate
   FROM (SELECT max(t.date) AS MostRecentDate, t.RequirementName, t.PersonId FROM lists.TestDates t GROUP BY t.PersonID, t.RequirementName) sq1
   WHERE sq1.RequirementName = rn.RequirementName AND e.key = sq1.PersonID) AS MostRecentDate,
   
  --we calculate the time since that test
  (SELECT (curdate() - sq1.MostRecentDate) AS TimeSinceTest   FROM (SELECT max(t.date) AS MostRecentDate, t.RequirementName, t.PersonId FROM lists.TestDates t GROUP BY t.PersonID, t.RequirementName) sq1
   WHERE sq1.RequirementName = rn.RequirementName AND e.key = sq1.PersonID) AS TimeSinceTest,

  --we calculate the time since that test in month
  --(SELECT AGE(curdate(), sq1.MostRecentDate, 'SQL_TSI_MONTH') AS TimeSinceTest   FROM (SELECT max(t.date) AS MostRecentDate, t.RequirementName, t.PersonId FROM lists.TestDates t GROUP BY t.PersonID, t.RequirementName) sq1
  --WHERE sq1.RequirementName = rn.RequirementName AND e.key = sq1.PersonID) AS TimeSinceTestMonth,


  --we calculate the time until renewal
  CASE
     WHEN (rn.ExpirePeriod = 0 OR rn.ExpirePeriod IS NULL) 
       THEN NULL
     ELSE
        1
--      (SELECT (CONVERT (datetime, rn.ExpirePeriod) - (curdate() - sq1.MostRecentDate)) AS TimeUntilRenewal
--       FROM (SELECT max(t.date) AS MostRecentDate, t.RequirementName, t.PersonId FROM lists.TestDates t GROUP BY t.PersonID, t.RequirementName) sq1
--       WHERE sq1.RequirementName = rn.RequirementName AND e.key = sq1.PersonID)
  END
  AS TimeUntilRenewal

  
  --we calculate the time since that test in months
--  (SELECT age(curdate(), sq1.MostRecentDate, SQL_TSI_MONTH) AS TimeSinceTest
--   FROM (SELECT max(t.date) AS MostRecentDate, t.TestName, t.PersonId FROM lists.TestDates t GROUP BY t.PersonID, t.TestName, t.Date HAVING t.date = max(t.date)) sq1
--   WHERE sq1.TestName = rn.TestType AND e.key = sq1.PersonID) AS TimeSinceTest2


FROM lists.employees e LEFT OUTER JOIN lists.TestName rn