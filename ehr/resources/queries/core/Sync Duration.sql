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

c1.Date as Start,
c2.EndTime,
timestampdiff('SQL_TSI_MINUTE', c2.EndTime, c1.Date) AS Duration,

-- c1.key1,
c1.IntKey1 as ListErrors,
c1.IntKey2 as DatasetErrors,
-- c1.EventType,
-- c1.comment,

FROM auditlog.audit c1

left join

(
SELECT c2.date, max(c3.date) as EndTime
  FROM auditlog.audit c2 LEFT JOIN auditlog.audit c3
  ON (c2.date > c3.date)
  WHERE c2.EventType = 'EHRSyncAuditEvent' AND c3.EventType = 'EHRSyncAuditEvent' AND c3.key1='START' AND c2.key1='FINISH'
  GROUP BY c2.date
  ) c2

ON (c2.date = c1.date)

WHERE c1.EventType = 'EHRSyncAuditEvent' AND (c1.key1='FINISH' or c1.key1='FATAL ERROR')