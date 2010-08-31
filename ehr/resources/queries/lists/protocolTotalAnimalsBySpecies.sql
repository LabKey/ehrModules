/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

p.protocol,
p.species,
pc.allowed,
p.TotalAnimals,

FROM
(
SELECT
  coalesce(p.protocol, pa.protocol) as protocol,
  pa.species,
  CONVERT(Count(pa.id), INTEGER) AS TotalAnimals,

FROM lists.protocol p
LEFT OUTER JOIN lists.protocolAnimals pa ON (p.protocol = pa.protocol)

GROUP BY coalesce(p.protocol, pa.protocol), pa.species

) p

LEFT JOIN lists.protocol_counts pc ON (p.protocol = pc.protocol AND pc.species = p.species)

WHERE p.species IS NOT NULL
