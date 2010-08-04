/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

SELECT lower(id) as id, FixDate(birth) AS date, sex as gender, dam, sire1, sire2, sire3, status, weight,
     ( CONCAT_WS(',\n',
     CONCAT('Sex: ', p.sex),
     CONCAT('Dam: ', p.dam),
     CONCAT('Sire1: ', p.sire1),
     CONCAT('Sire2: ', p.sire2),
     CONCAT('Sire3: ', p.sire3),
     CONCAT('Status: ', p.status),
     CONCAT('Weight: ', p.weight)
     )) AS Description, p.ts as ts, p.uuid AS objectid


FROM pedigree p

group by p.id

/*
left join abstract p

on a.id = p.id
*/

