/*
 * Copyright (c) 2014 LabKey Corporation
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
 t2.Id,
 t2.date,
 t2.observation,
 t2.previousMens,
 t2.daysSinceLastMens,
 t2.lastCycleStart,
 TIMESTAMPDIFF('SQL_TSI_DAY', t2.lastCycleStart, t2.date) as cycleLength

FROM (
SELECT

  t.Id,
  t.date,
  t.observation,
  t.previousMens,
  t.daysSinceLastMens,
  (SELECT max(t1.date) as expr FROM study.menseDay1 t1 WHERE t1.Id = t.Id AND t1.date < t.date) as lastCycleStart

FROM study.menseDay1 t

) t2