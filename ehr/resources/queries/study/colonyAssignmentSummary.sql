/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
  d.id.dataset.demographics.v_status as v_status,
  d.id.species.species as species,
  count(coalesce(d.id.dataset.demographics.v_status, '')) as TotalAnimals,

  count(d.ActiveAssignments2) AS ActiveAssignments,
  count(coalesce(d.id.dataset.demographics.v_status, '')) - count(d.ActiveAssignments2) AS NoAssignments,
  count(d.PendingAssignments2) AS PendingAssignments,
  count(d.ActiveResearchAssignments2) as ActiveResearchAssignments,
  count(d.ActiveBreedingAssignments2) as ActiveBreedingAssignments,
  count(d.ActiveTrainingAssignments2) as ActiveTrainingAssignments,

  --count(T3.Total) as ActiveVetAssignments,
  count(d.ActiveSPF_StockAssignments2) AS ActiveSPF_StockAssignments,
  count(d.ActiveConventionalStockAssignments2) AS ActiveConventionalStockAssignments,
  count(d.ActiveMarmStockAssignments2) AS ActiveMarmStockAssignments,


FROM study.demographicsAssignmentSummary d

WHERE d.id.status.status = 'Alive'
AND d.id.species.species != 'Unknown'

GROUP BY d.id.dataset.demographics.v_status, d.id.species.species

