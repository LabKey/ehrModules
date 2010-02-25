/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT id, FixDate(date) AS Date, morphology AS morphology, (account) AS account,
     ( CONCAT_WS(',\n',
     CONCAT('Morphology: ', morphology),
     CONCAT('Account: ', account)
     ) ) AS Description


FROM hemamisc
