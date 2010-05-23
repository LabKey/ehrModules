/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as id, FixDateTime(date, time) AS Date, (quantity) AS quantity, (done_by) AS done_by, (done_for) AS done_for, (pno) AS pno, (p_s) AS p_s, (a_v) AS a_v, (b.code) AS code, (caretaker) AS caretaker, (tube_type) AS tube_type, null as parentid,
     ( CONCAT_WS(',\n',
     CONCAT('Quantity: ', CAST(quantity AS CHAR)),
     CONCAT('Done By: ', done_by),
     CONCAT('Done For: ', done_for),
     CONCAT('P_S: ', p_s),
     CONCAT('A_V: ', a_v),
     CONCAT('Code: ', s1.meaning, ' (', b.code, ')'),
     CONCAT('Caretaker: ', caretaker),
     CONCAT('Tube Type: ', tube_type)
     ) ) AS Description, b.ts, b.uuid AS objectid

FROM blood b

LEFT OUTER JOIN snomed s1 ON s1.code=b.code

