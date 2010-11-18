SELECT
a.id,
a.date,
a.ts,
a.objectid,
t2.objectid as key2
FROM study.weight	 a
full join col_dump.weight	 t2
on a.objectid = t2.objectid
WHERE t2.objectid is null or a.objectid is null