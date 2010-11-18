SELECT
a.ts,
a.objectid,
t2.objectid as key2
FROM lists.snomap a
full join col_dump.snomap t2
on a.objectid = t2.objectid
WHERE t2.objectid is null or a.objectid is null