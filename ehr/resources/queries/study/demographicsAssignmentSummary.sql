/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
d.Id AS Id,

convert(T4.Total, INTEGER) as NumActiveAssignments,
convert(T2.Total, INTEGER) as NumPendingAssignments,
convert(T1.Total, INTEGER) as NumActiveResearchAssignments,
convert(T3.Total, INTEGER) as NumActiveVetAssignments,
convert(T10.Total, INTEGER) as NumActiveTrainingAssignments,
convert(T9.Total, INTEGER) as NumActiveBreedingAssignments,

T4.Projects as ActiveAssignments,
T2.Projects as PendingAssignments,
T1.Projects as ActiveResearchAssignments,
T3.Projects as ActiveVetAssignments,
T10.Projects as ActiveTrainingAssignments,
T9.Projects as ActiveBreedingAssignments,


CASE WHEN T6.Total > 0 THEN 'Y' ELSE null END as ActiveSPF_StockAssignment,
CASE WHEN T7.Total > 0 THEN 'Y' ELSE null END as ActiveConventionalStockAssignment,
CASE WHEN T8.Total > 0 THEN 'Y' ELSE null END as ActiveMarmStockAssignment,
convert(T5.Total, INTEGER) as NumActiveStockAssignments,
T5.Projects as ActiveStockAssignments,

-- T4.Total as ActiveAssignments2,
-- T2.Total as PendingAssignments2,
-- T1.Total as ActiveResearchAssignments2,
-- T3.Total as ActiveVetAssignments2,
-- T10.Total as ActiveTrainingAssignments2,
T6.Total as ActiveSPF_StockAssignments,
T7.Total as ActiveConventionalStockAssignments,
T8.Total as ActiveMarmStockAssignments,
-- T5.Total as ActiveStockAssignments2,
-- T9.Total as ActiveBreedingAssignments2,

FROM study.demographics d

--we find the number of active research project assignments
LEFT JOIN
    (SELECT T1.Id, count(DISTINCT T1.project) AS Total, group_concat(DISTINCT project) AS Projects FROM study.Assignment T1 WHERE T1.qcstate.publicdata = true AND T1.rdate IS NULL AND (T1.project.avail = 'r' OR T1.project.avail = 'n') GROUP BY T1.Id) T1
    ON (T1.Id = d.Id)

--we find the number of pending project assignments
LEFT JOIN
    (SELECT T2.Id, count(DISTINCT T2.project) AS Total, group_concat(DISTINCT project) AS Projects FROM study.Assignment T2 WHERE T2.qcstate.publicdata = true AND T2.rdate IS NULL AND (T2.project.avail = 'p') GROUP BY T2.Id) T2
    ON (T2.Id = d.Id)

--we find the number of active vet project assignments
LEFT JOIN
    (SELECT T3.Id, count(DISTINCT T3.project) AS Total, group_concat(DISTINCT project) AS Projects FROM study.Assignment T3 WHERE T3.qcstate.publicdata = true AND T3.rdate IS NULL AND T3.project.avail = 'v' GROUP BY T3.Id) T3
    ON (T3.Id = d.Id)

--we find the number of active breeding project assignments
LEFT JOIN
    (SELECT T9.Id, count(DISTINCT T9.project) AS Total, group_concat(DISTINCT project) AS Projects FROM study.Assignment T9 WHERE T9.qcstate.publicdata = true AND T9.rdate IS NULL AND T9.project.avail = 'b' GROUP BY T9.Id) T9
    ON (T9.Id = d.Id)

--we find the number of active breeding project assignments
LEFT JOIN
    (SELECT T10.Id, count(DISTINCT T10.project) AS Total, group_concat(DISTINCT project) AS Projects FROM study.Assignment T10 WHERE T10.qcstate.publicdata = true AND T10.rdate IS NULL AND T10.project.avail = 't' GROUP BY T10.Id) T10
    ON (T10.Id = d.Id)

--we find the number of total active project assignments
LEFT JOIN
    (SELECT T4.Id, count(DISTINCT T4.project) AS Total, group_concat(DISTINCT project) AS Projects FROM study.Assignment T4 WHERE t4.qcstate.publicdata = true AND t4.rdate IS NULL GROUP BY T4.Id) T4
    ON (T4.Id = d.Id)

--we find the number of active stock project assignments
--spf stock animals (20020201)
--conventional stock animals (20070202)
--marmoset stock animals (20070801)
LEFT JOIN
    (SELECT T5.Id, count(DISTINCT T5.project) AS Total, group_concat(DISTINCT project) AS Projects FROM study.Assignment T5 WHERE t5.qcstate.publicdata = true AND t5.rdate IS NULL AND (t5.project = '20020201' OR t5.project = '20070202' OR t5.project = '20070801') GROUP BY T5.Id) T5
    ON (T5.Id = d.Id)

--we find the number of active spf stock project assignments
--spf stock animals (20020201)
LEFT JOIN
    (SELECT T6.Id, count(*) AS Total, group_concat(DISTINCT project) AS Projects FROM study.Assignment T6 WHERE t6.qcstate.publicdata = true AND t6.rdate IS NULL AND (t6.project = '20020201') GROUP BY T6.Id) T6
    ON (T6.Id = d.Id)

--we find the number of active conventional stock project assignments
--conventional stock animals (20070202)
LEFT JOIN
    (SELECT T7.Id, count(DISTINCT T7.project) AS Total, group_concat(DISTINCT project) AS Projects FROM study.Assignment T7 WHERE t7.qcstate.publicdata = true AND t7.rdate IS NULL AND (t7.project = '20070202') GROUP BY T7.Id) T7
    ON (T7.Id = d.Id)

--we find the number of active marm stock project assignments
--marmoset stock animals (20070801)
LEFT JOIN
    (SELECT T8.Id, count(DISTINCT T8.project) AS Total, group_concat(DISTINCT project) AS Projects FROM study.Assignment T8 WHERE t8.qcstate.publicdata = true AND t8.rdate IS NULL AND (t8.project = '20070801') GROUP BY T8.Id) T8
    ON (T8.Id = d.Id)

WHERE
d.id.status.status = 'Alive'
AND d.id.species.species != 'Unknown'
