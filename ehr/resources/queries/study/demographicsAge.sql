/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

d.id,
d.species,
d.birth,

floor(age(d.birth, COALESCE(d.death, now()))) AS AgeInYearsRounded,

ROUND(CONVERT(age_in_months(d.birth, COALESCE(d.death, now())), DOUBLE), 1) AS AgeInMonths,

ROUND(CONVERT(age_in_months(d.birth, COALESCE(d.death, now())), DOUBLE) / 12, 1) AS AgeInYears,

TIMESTAMPDIFF('SQL_TSI_DAY', d.birth, COALESCE(d.death, now())) as AgeInDays,

case
  when (age_in_months(d.birth, COALESCE(d.death, now()))) < 1
    then (CONVERT(CONVERT(TIMESTAMPDIFF('SQL_TSI_DAY', d.birth, COALESCE(d.death, now())), DOUBLE), VARCHAR) || ' days')
  when (age_in_months(d.birth, COALESCE(d.death, now()))) < 12
    then (CONVERT(CONVERT(ROUND(age_in_months(d.birth, COALESCE(d.death, now())), 1), DOUBLE), VARCHAR) || ' months')
  else
    (CONVERT(CONVERT(FLOOR(age_in_months(d.birth, COALESCE(d.death, now())) / 12), SQL_INTEGER), VARCHAR) || '.' || CONVERT(MOD(CONVERT(ROUND(age_in_months(d.birth, COALESCE(d.death, now())) / 12 * 10, 0), SQL_INTEGER), 10), VARCHAR) || ' years')
end as AgeFriendly

FROM study.Demographics d


