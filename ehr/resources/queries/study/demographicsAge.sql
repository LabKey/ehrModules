/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

d.id,
d.species,
d.birth,

floor(age(d.birth, COALESCE(d.death, curdate()))) AS AgeInYearsRounded,

ROUND(CONVERT(age_in_months(d.birth, COALESCE(d.death, curdate())), DOUBLE), 1) AS AgeInMonths,

ROUND(CONVERT(age_in_months(d.birth, COALESCE(d.death, curdate())), DOUBLE) / 12, 1) AS AgeInYears,

TIMESTAMPDIFF('SQL_TSI_DAY', d.birth, COALESCE(d.death, curdate())) as AgeInDays,

case
  when (age_in_months(d.birth, COALESCE(d.death, curdate()))) < 1
    then (CONVERT(TIMESTAMPDIFF('SQL_TSI_DAY', d.birth, COALESCE(d.death, curdate())), NUMERIC) || ' days')
  when (age_in_months(d.birth, COALESCE(d.death, curdate()))) < 12
    then (CONVERT(ROUND(age_in_months(d.birth, COALESCE(d.death, curdate())), 1), NUMERIC) || ' months')
  else
    (CONVERT(ROUND(age_in_months(d.birth, COALESCE(d.death, curdate())) / 12, 1), NUMERIC) || ' years')
end as AgeFriendly

FROM study.Demographics d


