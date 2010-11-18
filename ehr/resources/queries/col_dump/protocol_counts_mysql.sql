SELECT
a.protocol,
a.ts,
a.objectid,
t2.objectid as key2
FROM lists.protocol_counts a
full join col_dump.protocol_counts t2
on a.objectid = t2.objectid
WHERE t2.objectid is null or a.objectid is null