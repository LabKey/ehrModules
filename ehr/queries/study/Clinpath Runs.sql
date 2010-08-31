/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
-- SELECT
-- x.id,
-- x.date,
-- x.project,
-- x.account,
-- x.userId,
-- x.remark,
-- x.parentId,
-- x.requestId,
-- x.QCState
-- x.description,
-- x.objectId
--
--
-- FROM (

SELECT
x.id,
x.date,
x.project,
x.account,
x.userId,
x.remark,
x.parentId,
x.requestId,
x.QCState,
x.description,
x.objectId,
'bacteriology' as dataset
FROM study.bacteriologyRuns x

UNION ALL

SELECT
x.id,
x.date,
x.project,
x.account,
x.userId,
x.remark,
x.parentId,
x.requestId,
x.QCState,
x.description,
x.objectId,
'chemistry' as dataset
FROM study.chemistryRuns x

UNION ALL

SELECT
x.id,
x.date,
x.project,
x.account,
x.userId,
x.remark,
x.parentId,
x.requestId,
x.QCState,
x.description,
x.objectId,
'hematology' as dataset
FROM study.hematologyRuns x

UNION ALL

SELECT
x.id,
x.date,
x.project,
x.account,
x.userId,
x.remark,
x.parentId,
x.requestId,
x.QCState,
x.description,
x.objectId,
'parasitology' as dataset
FROM study.parasitologyRuns x

UNION ALL

SELECT
x.id,
x.date,
x.project,
x.account,
x.userId,
x.remark,
x.parentId,
x.requestId,
x.QCState,
x.description,
x.objectId,
'immunology' as dataset
FROM study.immunologyRuns x

UNION ALL

SELECT
x.id,
x.date,
x.project,
x.account,
x.userId,
x.remark,
x.parentId,
x.requestId,
x.QCState,
x.description,
x.objectId,
'urinalysis' as dataset
FROM study.urinalysisRuns x

UNION ALL

SELECT
x.id,
x.date,
x.project,
x.account,
x.userId,
x.remark,
x.parentId,
x.requestId,
x.QCState,
x.description,
x.objectId,
'virology' as dataset
FROM study.virologyRuns x

-- ) x
