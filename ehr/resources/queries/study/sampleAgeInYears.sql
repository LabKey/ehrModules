/*
 * Copyright (c) 2022-2026 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

PARAMETERS(sampleDate TIMESTAMP)

SELECT
    d.id,
    ROUND(CONVERT(age_in_months(d.birth, COALESCE(d.lastDayAtCenter, now())), DOUBLE) / 12, 1) AS atSample
FROM study.Demographics d