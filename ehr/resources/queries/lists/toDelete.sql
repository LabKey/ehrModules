Select
d.id,
d.orig_id,
d.uuid,
d.ts
FROM lists.deleted_records d
Left join study.studydata s on (d.uuid like s.lsid)