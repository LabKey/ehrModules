/*
 * Copyright (c) 2015 LabKey Corporation
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
    d.id,
    d.dam as dam,
    'Observed' as damType,
    d.sire as sire,
    'Observed' as sireType,
    CASE
        WHEN d.dam IS NOT NULL AND d.sire IS NOT NULL THEN 2
        WHEN d.dam IS NOT NULL OR d.sire IS NOT NULL THEN 1
        ELSE 0
        END as numParents
FROM study.demographics d

