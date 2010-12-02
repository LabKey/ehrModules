/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  d.id.dataset.demographics.v_status as v_status,
  d.id.species.species as species,
  count(coalesce(d.id.dataset.demographics.v_status, '')) as TotalAnimals,

  count(d.ActiveAssignments) AS ActiveAssignments,
  count(coalesce(d.id.dataset.demographics.v_status, '')) - count(d.ActiveAssignments) AS NoAssignments,
  count(d.PendingAssignments) AS PendingAssignments,
  count(d.ActiveResearchAssignments) as ActiveResearchAssignments,
  count(d.ActiveBreedingAssignments) as ActiveBreedingAssignments,
  count(d.ActiveTrainingAssignments) as ActiveTrainingAssignments,

  --count(T3.Total) as ActiveVetAssignments,
  count(d.ActiveSPF_StockAssignments) AS ActiveSPF_StockAssignments,
  count(d.ActiveConventionalStockAssignments) AS ActiveConventionalStockAssignments,
  count(d.ActiveMarmStockAssignments) AS ActiveMarmStockAssignments,


FROM study.demographicsAssignmentSummary d

WHERE d.id.status.status = 'Alive'
AND d.id.species.species != 'Unknown'

GROUP BY d.id.dataset.demographics.v_status, d.id.species.species

