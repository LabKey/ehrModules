/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT lower(id) as id, FixDate(date) AS Date, (quantity) AS quantity, (collected_by) AS collected_by, (method) AS method, (glucose) AS glucose, (bilirubin) AS bilirubin, (ketone) AS ketone, (sp_gravity) AS sp_gravity, (blood) AS blood, (ph) AS ph, (protein) AS protein, (urobilinogen) AS urobilinogen, (nitrite) AS nitrite, (leucocytes) AS leucocytes, (appearance) AS appearance, (microscopic) AS microscopic, FixNewlines(clincomment) AS remark,
uuid as requestId,
ts, uuid AS objectid
FROM urine
WHERE ts > ?
