SELECT
a.cage,
a.ts,
a.objectid,
t2.objectid as key2
FROM lists.cage a
full join col_dump.cage t2
on a.objectid = t2.objectid
WHERE t2.objectid is null or a.objectid is null