SELECT
a.cage,
a.date,
a.ts,
a.objectid,
t2.objectid as key2
FROM lists.cagenotes a
full join col_dump.cagenotes t2
on a.objectid = t2.objectid
WHERE t2.objectid is null or a.objectid is null