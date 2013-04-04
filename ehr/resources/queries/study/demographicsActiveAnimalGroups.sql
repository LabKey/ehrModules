SELECT
  m.id,
  count(distinct m.id) as totalGroups,
  group_concat(distinct m.groupId.name, chr(10)) as groups
FROM ehr.animal_group_members m
WHERE m.enddateCoalesced >= curdate()
GROUP BY m.id