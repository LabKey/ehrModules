SELECT
  t2.groupId,
  group_concat(distinct t2.rooms, chr(10)) as rooms


FROM (
  SELECT
    t1.groupId,
    t1.room || ' (' || cast(t1.total as varchar) || ')' as rooms
  FROM (
    SELECT
      m.groupId,
      m.id.curLocation.room,
      count(distinct m.id) as total

    FROM ehr.animal_group_members m
    WHERE m.enddateCoalesced >= curdate()
    GROUP BY m.groupId, m.id.curLocation.room
  ) t1
) t2

GROUP BY t2.groupId
