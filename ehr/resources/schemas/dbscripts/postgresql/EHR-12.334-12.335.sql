DROP INDEX ehr.snomed_tags_id_recordid;

CREATE INDEX snomed_tags_id_recordid_code on ehr.snomed_tags (id, recordid, code);