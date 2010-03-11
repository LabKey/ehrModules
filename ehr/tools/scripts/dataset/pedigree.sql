/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, birth AS date, sex, dam, sire1, sire2, sire3, status, weight,
     ( CONCAT_WS(',\n',
     CONCAT('Sex: ', sex),
     CONCAT('Dam: ', dam),
     CONCAT('Sire1: ', sire1),
     CONCAT('Sire2: ', sire2),
     CONCAT('Sire3: ', sire3),
     CONCAT('Status: ', status),
     CONCAT('Weight: ', weight)
     )) AS Description

FROM pedigree p

