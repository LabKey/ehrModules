SELECT
a.protocol,
a.ts,
a.objectid,
t2.objectid as key2
FROM lists.protocol a
full join col_dump.protocol t2
on a.objectid = t2.objectid
WHERE t2.objectid is null or a.objectid is null