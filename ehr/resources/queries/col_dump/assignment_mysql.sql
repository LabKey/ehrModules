SELECT
a.id,
a.date,
a.project,
a.rdate,
a.parentid,
a.ts,
a.objectid,
t2.objectid as key2
FROM study.assignment a
full join col_dump.assignment t2
on a.objectid = t2.objectid
WHERE t2.objectid is null or a.objectid is null