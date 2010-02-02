/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
SELECT
  e.key,
  e.wiscID AS WiscID,
  e.LastName,
  rn.RequirementName,
  rn.ExpirePeriod,        
  mt.TestName AS MiscTest,

  --we compute whether this person requires this test
  --the logic is defined by the Employee and TestName tables
  CASE
    WHEN rn.Required IS TRUE
      THEN TRUE
    --
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
    WHEN (rn.SpecificPeople IS TRUE AND mt.TestName IS NOT NULL)
      THEN TRUE
    ELSE
      FALSE
  END
  AS TestRequired,

  --we find the date of the last test where RequirementName matches the one in this row
  (SELECT sq1.MostRecentDate
   FROM (SELECT max(t.date) AS MostRecentDate, t.RequirementName, t.PersonId FROM lists.TestDates t GROUP BY t.PersonID, t.RequirementName) sq1
   WHERE sq1.RequirementName = rn.RequirementName AND e.key = sq1.PersonID) AS MostRecentDate,
   

  --we calculate the time since that test in months
  (SELECT age_in_months(sq1.MostRecentDate, curdate()) AS TimeSinceTest   FROM (SELECT max(t.date) AS MostRecentDate, t.RequirementName, t.PersonId FROM lists.TestDates t GROUP BY t.PersonID, t.RequirementName) sq1
   WHERE sq1.RequirementName = rn.RequirementName AND e.key = sq1.PersonID) AS MonthsSinceTest,


  --we calculate the time until renewal
  CASE
     WHEN (rn.ExpirePeriod = 0 OR rn.ExpirePeriod IS NULL) 
       THEN NULL
     ELSE
      (SELECT (rn.ExpirePeriod - age_in_months(sq1.MostRecentDate, curdate())) AS TimeUntilRenewal   FROM (SELECT max(t.date) AS MostRecentDate, t.RequirementName, t.PersonId FROM lists.TestDates t GROUP BY t.PersonID, t.RequirementName) sq1
       WHERE sq1.RequirementName = rn.RequirementName AND e.key = sq1.PersonID)
  END
  AS MonthsUntilRenewal,

FROM lists.employees e LEFT OUTER JOIN lists.TestName rn
        LEFT JOIN lists.EmployeeMiscTests mt ON (mt.TestName=rn.RequirementName AND mt.EmployeeId = e.LastName)
