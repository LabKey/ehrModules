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
SELECT e.key,
        e.wiscID,
        e.LastName,
        rn.RequirementName,
        rn.expirePeriod,
        T1.MostRecentDate,

--The following 2 uses of age_in_months throw errors
--The error is:
--ERROR: syntax error at or near "{" Position: 3646
--see related comment below

  --we calculate the time since that test in months
        age_in_months(T1.MostRecentDate, curdate()) AS TimeSinceTest,

--we calculate the time until renewal
        CASE
          WHEN (T1.MostRecentDate IS NULL) THEN 0
                ELSE
                rn.expirePeriod -
                        (age_in_months(T1.MostRecentDate, curdate()))
                END AS TimeUntilRenewal,

--this use of age_in_months does work:
  --we calculate the time until renewal
  --this subquery was written before I changed this to use joins
  --it is no longer needed, but i kept it b/c is uses age_in_months and is working 
        CASE
          WHEN
                  (rn.ExpirePeriod = 0 OR rn.ExpirePeriod IS NULL)
          THEN NULL
                ELSE
                (SELECT (rn.ExpirePeriod -
                        age_in_months(sq1.MostRecentDate, curdate())) AS TimeUntilRenewal
                  FROM (SELECT max(t.date) AS MostRecentDate, t.RequirementName, t.PersonId
                    FROM lists.TestDates t
                    GROUP BY t.PersonID, t.RequirementName) sq1
                  WHERE sq1.RequirementName = rn.RequirementName AND e.key = sq1.PersonID)
                END
                AS MonthsUntilRenewal

  FROM lists.employees e
          LEFT OUTER JOIN lists.TestName rn

          --we add in more fields
          LEFT JOIN lists.EmployeeMiscTests mt
    ON (mt.TestName=rn.RequirementName AND mt.EmployeeId = e.key)

          LEFT JOIN
          (SELECT max(t.date) AS MostRecentDate, t.RequirementName, t.PersonId
            FROM lists.TestDates t
            GROUP BY t.PersonID, t.RequirementName) T1
    ON (T1.RequirementName = rn.RequirementName AND T1.PersonID = e.key)

  WHERE
  --we compute whether this person requires this test
--and only show required tests
--the logic is defined by the Employee and TestName tables
          CASE
            WHEN rn.Required IS TRUE
            THEN TRUE
            WHEN
                    (e.Category.Barrier IS TRUE AND rn.Access IS TRUE)
            THEN TRUE
            WHEN
                    (e.Category.Animals IS TRUE AND rn.Animals IS TRUE)
            THEN TRUE
            WHEN
                    (e.Category.Tissue IS TRUE AND rn.Tissues IS TRUE)
            THEN TRUE
                  --if a requirement is mandatory for a given employee category and this employee is one, it's required
            WHEN
                    (e.Category != '' AND rn.Category = e.Category)
            THEN TRUE
                  --this allows to non-standard requirements to be tracked
            WHEN
                    (rn.SpecificPeople IS TRUE AND mt.TestName IS NOT NULL)
            THEN TRUE
                  ELSE FALSE
                  END
IS TRUE
