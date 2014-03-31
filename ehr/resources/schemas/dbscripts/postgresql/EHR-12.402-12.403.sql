ALTER TABLE ehr.snomed_tags ADD formsort integer;
ALTER TABLE ehr.snomed_tags ADD date timestamp;
ALTER TABLE ehr.encounter_summaries ADD formsort integer;
ALTER TABLE ehr.encounter_participants ADD formsort integer;

ALTER TABLE ehr.formtemplates ADD hidden bool default false;
UPDATE ehr.formtemplates SET hidden = false;
