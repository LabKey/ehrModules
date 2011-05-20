/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

k1.id,
k1.coefficient,
k2.id as id2,
k2.coefficient as coefficient2,

k1.coefficient * k2.coefficient AS kinship

FROM study."Inbreeding Coefficients" k1
CROSS JOIN study."Inbreeding Coefficients" k2

WHERE
k1.id.dataset.demographics.species = k2.id.dataset.demographics.species
OR k1.id.dataset.demographics.species IS NULL
OR k2.id.dataset.demographics.species IS NULL