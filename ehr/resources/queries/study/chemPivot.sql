/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
b.id,
b.date,
b.testId,
group_concat(b.result) as results

FROM (SELECT
b.id,
b.date,
b.testId,
coalesce(b.taskid, b.parentid, b.runId) as runId,
b.resultoorindicator,
CASE
WHEN b.result IS NULL THEN  b.qualresult
  ELSE CAST(CAST(b.result AS float) AS VARCHAR)
END as result

FROM study."Chemistry Results" b
WHERE testId IN ('GLUC', 'BUN', 'CREAT', 'CPK', 'CHOL', 'TRIG','SGOT', 'LDH', 'LDL', 'TB','GGT','SGPT','TP','ALB','ALKP','CA','PHOS','FE','NA','K','CL', 'UA')
and b.qcstate.publicdata = true

) b

GROUP BY b.id, b.date, b.runId, b.testId
PIVOT results BY testId IN ('GLUC', 'BUN', 'CREAT', 'CPK', 'CHOL', 'TRIG','SGOT', 'LDH', 'LDL', 'TB','GGT','SGPT','TP','ALB','ALKP','CA','PHOS','FE','NA','K','CL', 'UA')

