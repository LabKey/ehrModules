SELECT
    m.Id,
    count(distinct m.objectid) as totalGroups,
    group_concat(distinct m.name, chr(10)) as groups,

FROM (SELECT Id,
             objectid,
             groupId.name,
      FROM study.animal_group_members
      WHERE enddate is NULL) m
GROUP BY m.Id