SELECT
  m.groupId,
  m.id.curLocation.room,
  count(distinct m.id) as totalAnimals

FROM ehr.animal_group_members m
WHERE m.enddateCoalesced >= curdate()
GROUP BY m.groupId, m.id.curLocation.room