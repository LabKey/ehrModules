/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(p1.id) as id, FixDate(p1.date) as date, seq, p1.code as code,
     ( CONCAT_WS(',\n',
     CONCAT(s1.meaning, ' (', p1.code, ')')
     ) ) AS Description,

p1.maxts as ts, p1.uuid AS objectid

FROM
/* note: this grouping is not ideal, but I think these other records are duplicates */
(select *, max(ts) as maxts from parares GROUP BY id, date, seq, code) p1

/* note: check whether this join is really faster than a subselect  */
left join
(SELECT id, date, uuid as parentId FROM parahead p GROUP BY id, date) p2
ON (p1.id = p2.id AND p1.date = p2.date)

LEFT OUTER JOIN snomed s1 ON s1.code=p1.code
