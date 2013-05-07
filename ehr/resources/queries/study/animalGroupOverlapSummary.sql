SELECT
  o.groupId,
  count(distinct o.id) as totalAnimals,

  max(o.StartDate) as StartDate,
  max(o.EndDate) as EndDate,

FROM study.animalGroupOverlaps o

GROUP BY o.groupId