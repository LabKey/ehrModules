/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDate(date) as date, seq, virus, result,
concat_ws(',\n',
     CONCAT('Virus: ', virus),
     CONCAT('Result: ', result)
     ) AS Description

FROM virserores

