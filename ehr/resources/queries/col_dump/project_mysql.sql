SELECT
a.project,
a.ts,
a.objectid,
t2.objectid as key2
FROM lists.project a
full join col_dump.project t2
on a.objectid = t2.objectid
WHERE t2.objectid is null or a.objectid is null