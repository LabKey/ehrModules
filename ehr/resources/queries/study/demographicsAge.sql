/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

d.id,
d.species,
d.birth,
d.death,

floor(age(d.birth, COALESCE(d.death, now()))) AS ageInYearsRounded,

ROUND(CONVERT(age_in_months(d.birth, COALESCE(d.death, now())), DOUBLE), 1) AS ageInMonths,

ROUND(CONVERT(age_in_months(d.birth, COALESCE(d.death, now())), DOUBLE) / 12, 1) AS ageInYears,

TIMESTAMPDIFF('SQL_TSI_DAY', d.birth, COALESCE(d.death, now())) as ageInDays,

case
  when (age_in_months(d.birth, COALESCE(d.death, now()))) < 1
    then (CONVERT(CONVERT(TIMESTAMPDIFF('SQL_TSI_DAY', d.birth, COALESCE(d.death, now())), float), VARCHAR) || ' days')
  when (age_in_months(d.birth, COALESCE(d.death, now()))) < 12
    then (CONVERT(CONVERT(ROUND(age_in_months(d.birth, COALESCE(d.death, now())), 1), float), VARCHAR) || ' months')
  else
    (CONVERT(CONVERT(FLOOR(age_in_months(d.birth, COALESCE(d.death, now())) / 12), SQL_INTEGER), VARCHAR) || '.' || CONVERT(MOD(CONVERT(ROUND(age_in_months(d.birth, COALESCE(d.death, now())) / 12.0 * 10.0, 0), SQL_INTEGER), 10), VARCHAR) || ' years')
end as ageFriendly

FROM study.Demographics d


