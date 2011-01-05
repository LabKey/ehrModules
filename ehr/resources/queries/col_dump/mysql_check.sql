/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
-- SELECT
-- id,
-- date,
-- ts,
-- objectid,
-- 'alerts' as type,
-- key2
-- FROM col_dump.alerts_mysql

-- UNION ALL

SELECT
id,
date,
ts,
objectid,
'arrival' as type,
key2
FROM col_dump.arrival_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid,
'assignment' as type,
key2
FROM col_dump.assignment_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid,
'bactresults' as type,
key2
FROM col_dump.bacteriologyresults_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid,
'bactruns' as type,
key2
FROM col_dump.bacteriologyruns_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid,
'behave' as type,
key2
FROM col_dump.behavetrem_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid,
'biopsy' as type,
key2
FROM col_dump.biopsy_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid,
'biopsydiag' as type,
key2
FROM col_dump.biopsydiag_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid,
'birth' as type,
key2
FROM col_dump.birth_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid,
'blood' as type,
key2
FROM col_dump.blood_mysql

UNION ALL

SELECT
null as id,
null as date,
ts,
objectid,
'cage' as type,
key2
FROM col_dump.cage_mysql

UNION ALL

SELECT
null as id,
null as date,
ts,
objectid,
'cageclass' as type,
key2
FROM col_dump.cageclass_mysql

UNION ALL

SELECT
null as id,
date,
ts,
objectid,
'cagenotes' as type,
key2
FROM col_dump.cagenotes_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid,
'chemresults' as type,
key2
FROM col_dump.chemistryresults_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid,
'chemruns' as type,
key2
FROM col_dump.chemistryruns_mysql

UNION ALL

SELECT
null as id,
null as date,
ts,
objectid,
'chemnorm' as type,
key2
FROM col_dump.chemnorm_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid,
'clinremarks' as type,
key2
FROM col_dump.clinremarks_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid,
'demographics' as type,
key2
FROM col_dump.demographics_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid,
'departure' as type,
key2
FROM col_dump.departure_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid,
'drug' as type,
key2
FROM col_dump.drug_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid,
'encounters' as type,
key2
FROM col_dump.encounters_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid,
'hemamorph' as type,
key2
FROM col_dump.hematologymorphology_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid,
'hemaresults' as type,
key2
FROM col_dump.hematologyresults_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid,
'hemaruns' as type,
key2
FROM col_dump.hematologyruns_mysql

UNION ALL

SELECT
null as id,
null as date,
ts,
objectid,
'hold' as type,
key2
FROM col_dump.hold_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid,
'housing' as type,
key2
FROM col_dump.housing_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid,
'immunoresults' as type,
key2
FROM col_dump.immunologyresults_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid,
'immunoruns' as type,
key2
FROM col_dump.immunologyruns_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid,
'necropsy' as type,
key2
FROM col_dump.necropsy_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid,
'necropsydiag' as type,
key2
FROM col_dump.necropsydiag_mysql

UNION ALL

SELECT
null as id,
null as date,
ts,
objectid,
'newsnomed' as type,
key2
FROM col_dump.newsnomed_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid,
'obs' as type,
key2
FROM col_dump.obs_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid,
'parasitologyresults' as type,
key2
FROM col_dump.parasitologyresults_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid,
'parasitologyruns' as type,
key2
FROM col_dump.parasitologyruns_mysql

UNION ALL

SELECT
null as id,
null as date,
ts,
objectid,
'perdiem' as type,
key2
FROM col_dump.perdiemrates_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid,
'prenatal' as type,
key2
FROM col_dump.prenatal_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid,
'problem' as type,
key2
FROM col_dump.problem_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid,
'procedures' as type,
key2
FROM col_dump.procedures_mysql

UNION ALL

SELECT
null as id,
null as date,
ts,
objectid,
'project' as type,
key2
FROM col_dump.project_mysql

UNION ALL

-- SELECT
-- null as id,
-- null as date,
-- ts,
-- objectid,
-- 'protocol_counts' as type,
-- key2
-- FROM col_dump.protocol_counts_mysql
--
-- UNION ALL

SELECT
null as id,
null as date,
ts,
objectid,
'protocol' as type,
key2
FROM col_dump.protocol_mysql

UNION ALL

SELECT
null as id,
null as date,
ts,
objectid,
'ref_range' as type,
key2
FROM col_dump.ref_range_mysql

UNION ALL

SELECT
null as id,
null as date,
ts,
objectid,
'rhesaux' as type,
key2
FROM col_dump.rhesaux_mysql

UNION ALL

SELECT
null as id,
null as date,
ts,
objectid,
'snomap' as type,
key2
FROM col_dump.snomap_mysql

UNION ALL

SELECT
null as id,
null as date,
ts,
objectid,
'snomed' as type,
key2
FROM col_dump.snomed_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid,
'surgsum' as type,
key2
FROM col_dump.surgsum_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid,
'tb' as type,
key2
FROM col_dump.tb_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid,
'tissue_requests' as type,
key2
FROM col_dump.tissue_requests_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid,
'treatments' as type,
key2
FROM col_dump.treatment_order_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid,
'urinalysisresults' as type,
key2
FROM col_dump.urinalysisresults_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid,
'urinalysisruns' as type,
key2
FROM col_dump.urinalysisruns_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid,
'virologyresults' as type,
key2
FROM col_dump.virologyresults_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid,
'virologyruns' as type,
key2
FROM col_dump.virologyruns_mysql

UNION ALL

SELECT
id,
date,
ts,
objectid,
'weight' as type,
key2
FROM col_dump.weight_mysql
