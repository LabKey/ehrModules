/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
--this query displays all animals co-housed with each housing record
--to be considered co-housed, they only need to overlap by any period of time

SELECT

h1.id,

-- max(h2.date) as LastStart,
-- max(h2.odate) as LastStop,

CASE
  WHEN max(h2.date) >= max(h2.odate)
    THEN now()
  WHEN max(h2.odate) IS NULL AND max(h2.date) is not null
    THEN now()
  WHEN max(h2.odate) IS NULL
    THEN min(h1.date)
  ELSE
    max(h2.odate)
END as AloneSince,

convert(
CASE
  WHEN max(h2.date) >= max(h2.odate)
    THEN 0
  WHEN max(h2.odate) IS NULL AND max(h2.date) is not null
    THEN 0
  WHEN max(h2.odate) IS NULL
    then TIMESTAMPDIFF('SQL_TSI_DAY', min(h1.date), now())
  ELSE
    TIMESTAMPDIFF('SQL_TSI_DAY', max(h2.odate), now())
END, 'INTEGER') as DaysAlone,

max(a.value) as Exemptions 

FROM study.Housing h1

--find any overlapping housing record
LEFT OUTER JOIN study.Housing h2
    ON (
      (
      (h2.Date >= h1.date AND h2.Date < COALESCE(h1.odate, curdate()))
      OR
      (COALESCE(h2.odate, curdate()) > h1.date AND COALESCE(h2.odate, curdate()) <= COALESCE(h1.odate, curdate()))

      ) AND
      h1.id != h2.id AND h1.room = h2.room AND h1.cage = h2.cage
      )

--join to vet exemptions
LEFT JOIN study.alerts a
  ON (h1.id = a.id AND a.EndDate IS NULL and a.value LIKE '%pairing exempt%')

WHERE
h1.id.Status.Status = 'Alive'
--filter out pairing exempt animals
--AND a.id IS NULL

GROUP BY
h1.id

-- HAVING
-- max(a.value) IS NULL
