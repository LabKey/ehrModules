SELECT
a.id,
a.date,
a.ts,
a.objectid,
t2.objectid as key2
FROM study.necropsy	 a
full join col_dump.necropsy	 t2
on a.objectid = t2.objectid
WHERE t2.objectid is null or a.objectid is null