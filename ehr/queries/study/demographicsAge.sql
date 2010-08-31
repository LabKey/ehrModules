/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

d.id,

d.birth,

--CONVERT(age(d.birth, COALESCE(d.death, curdate())), INTEGER) AS "AgeInYearsRounded",
floor(age(d.birth, COALESCE(d.death, curdate()))) AS "AgeInYearsRounded",

CONVERT(age_in_months(d.birth, COALESCE(d.death, curdate())), INTEGER) AS "AgeInMonths",

ROUND(CONVERT(age_in_months(d.birth, COALESCE(d.death, curdate())), DOUBLE) / 12, 1) AS "AgeInYears",

FROM study.Demographics d


