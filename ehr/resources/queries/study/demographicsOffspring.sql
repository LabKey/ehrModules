/*
 * Copyright (c) 2015-2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
    d.id as Id,
    d2.id  AS Offspring,
    d2.birth AS date,
    d2.sire,
    d2.dam,
    d2.gender AS sex,
    d.qcstate
FROM study.Demographics d

INNER JOIN study.Demographics d2 ON ((d2.sire = d.id OR d2.dam = d.id) AND d.id != d2.id)

GROUP BY d.id, d2.id, d2.birth, d2.sire, d2.dam, d2.gender, d.qcstate
