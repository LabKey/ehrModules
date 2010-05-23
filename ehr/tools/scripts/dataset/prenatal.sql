/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as id, FixDate(date) as date, FixSpecies(species) as species, sex, weight, lower(dam) as dam, lower(sire) as sire, room, cage, concat(room, "-", cage) AS roomcage, FixDate(conception) as conception, remark,
     ( CONCAT_WS(',\n',
     CONCAT('Species: ', FixSpecies(species)),
     CONCAT('Sex: ', sex),
     CONCAT('Weight: ', weight),
     CONCAT('Dam: ', dam),
     CONCAT('Sire: ', sire),
     CONCAT('Room: ', room),
     CONCAT('Cage: ', cage),
     CONCAT('Conception: ', FixDate(conception)),
     CONCAT('remark: ', FixNewlines(remark))
     )) AS Description, ts, uuid AS objectid

FROM prenatal p

