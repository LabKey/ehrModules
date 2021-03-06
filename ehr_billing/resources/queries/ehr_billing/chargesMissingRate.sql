/*
 * Copyright (c) 2019 LabKey Corporation
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
PARAMETERS (Date TIMESTAMP)

SELECT
  ci.rowid,
  ci.name,
  ci.chargeCategoryId,
  ci.allowscustomunitcost,
  r.rowid as rateId
FROM ehr_billing.chargeableItems ci
LEFT JOIN ehr_billing.chargeRates r
         ON (r.chargeId = ci.rowid
               AND CAST(Date as DATE) >= cast(r.startDate as date)
               AND CAST(Date as DATE) <= coalesce(r.enddate, curdate()))
where ci.active = true and ((r.rowid is null AND ci.allowscustomunitcost != true))