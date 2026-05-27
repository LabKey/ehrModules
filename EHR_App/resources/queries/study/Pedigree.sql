/*
 * Copyright (c) 2026 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

    d.id as Id,
    d.dam as Dam,
    d.sire as Sire,

    CASE (d.id.demographics.gender.code)
        WHEN 'e' THEN 1
        WHEN 'm' THEN 1
        WHEN 'v' THEN 1
        WHEN 'c' THEN 2
        WHEN 'f' THEN 2
        WHEN 's' THEN 2
        ELSE 3
        END AS gender,
    d.id.demographics.gender.meaning as gender_code,
    CASE (d.id.demographics.calculated_status)
        WHEN 'Alive' THEN 0
        ELSE 1
        END
        AS status,
    d.id.demographics.calculated_status as status_code,
    d.id.demographics.species.common as species,
    '' as Display,
    'Demographics' as source,
    d.modified

FROM study.demographics d
WHERE d.Dam IS NOT NULL OR d.Sire IS NOT NULL
