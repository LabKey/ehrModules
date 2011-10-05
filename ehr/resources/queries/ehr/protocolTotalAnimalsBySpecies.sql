/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

p.protocol,
p.approve,
p.species,
pc.allowed,
p.TotalAnimals,
pc.allowed - p.TotalAnimals as TotalRemaining,
round(cast(p.TotalAnimals as numeric) / cast(pc.allowed as numeric) * 100, 1) as PercentUsed,
p.Animals,

FROM
(
SELECT
  coalesce(p.protocol, pa.protocol) as protocol,
  p.approve,
  pa.species,
  group_concat(DISTINCT pa.id) as Animals,
  CONVERT(Count(pa.id), INTEGER) AS TotalAnimals,

FROM ehr.protocol p
LEFT OUTER JOIN ehr.protocolAnimals pa ON (p.protocol = pa.protocol)

GROUP BY coalesce(p.protocol, pa.protocol), p.approve, pa.species

) p

LEFT JOIN ehr.protocol_counts pc ON (p.protocol = pc.protocol AND pc.species = p.species)

WHERE p.species IS NOT NULL
