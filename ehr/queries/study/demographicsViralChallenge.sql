/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

d.Id AS Id,

d.date,

round(timestampdiff('SQL_TSI_DAY', d.date, curdate())/7, 1) AS wpi,

d.code,
d.remark,

v.ChallengeType,

v.pathogen,

FROM study.drug d

INNER JOIN lists.Virus_SNOMED v ON v.code = d.code