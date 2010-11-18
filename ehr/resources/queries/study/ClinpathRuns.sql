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
x.lsid,
'Bacteriology' as type,
x.dataset.label as dataset
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
x.lsid,
'Chemistry' as type,
x.dataset.label as dataset
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
x.lsid,
'Hematology' as type,
x.dataset.label as dataset
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
x.lsid,
'Parasitology' as type,
x.dataset.label as dataset
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
x.lsid,
'Immunology' as type,
x.dataset.label as dataset
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
x.lsid,
'Urinalysis' as type,
x.dataset.label as dataset
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
x.lsid,
'Virology' as type,
x.dataset.label as dataset
FROM study.virologyRuns x

-- ) x
