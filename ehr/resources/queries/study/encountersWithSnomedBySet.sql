/*
 * Copyright (c) 2013-2017 LabKey Corporation
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

e.Id,
e.date,
e.caseno,
e.set_number,
group_concat(e.codeWithSort, chr(10)) as codes,
group_concat(e.codeMeaning, chr(10)) as codesMeaning,

FROM (

SELECT
  e.Id,
  e.date,
  e.objectid,
  e.caseno,
  s.set_number,
  cast(s.codeWithSort as varchar) as codeWithSort,
  s.code,
  sno.meaning,
  cast((cast(s.sort as varchar(10)) || ': ' || sno.meaning || ' (' || s.code || ')') as varchar(2000)) as codeMeaning

FROM study.encounters e
JOIN ehr.snomed_tags s ON (e.id = s.id AND e.objectid = s.recordid)
JOIN ehr_lookups.snomed sno ON (s.code = sno.code)

) e

GROUP BY e.Id, e.date, e.objectid, e.caseno, e.set_number