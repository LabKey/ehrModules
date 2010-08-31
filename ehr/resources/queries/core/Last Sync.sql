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
x.LastSync,
x.TimeSinceSync,
x.Days,
hour(x.TimeSinceSync) as Hours,
minute(x.TimeSinceSync) as Minutes, 

FROM (

SELECT

max(a.Date) as LastSync,
(now() - max(a.Date)) as TimeSinceSync,
TIMESTAMPDIFF('SQL_TSI_DAY', max(a.Date), now() ) as Days,
FROM auditlog.audit a

WHERE a.EventType = 'EHRSyncAuditEvent' AND a.Key1='FINISH'
AND a.IntKey1 = 0 AND a.IntKey2 = 0

GROUP BY a.EventType

) x