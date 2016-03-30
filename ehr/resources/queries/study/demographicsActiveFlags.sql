/*
 * Copyright (c) 2013-2014 LabKey Corporation
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
  f1.Id,
  group_concat(DISTINCT f1.flag, chr(10)) as flags

FROM (
SELECT
  f.Id,
  CASE
    WHEN f.flag is null THEN null
    WHEN f.flag.category IS NULL THEN f.flag.value
    ELSE cast((CAST(f.flag.category as varchar(100)) || CAST(': ' as varchar(2)) || CAST(f.flag.value as varchar(100))) as varchar(202))
  END as flag

FROM study.flags f
WHERE f.isActive = true

) f1

GROUP BY f1.Id