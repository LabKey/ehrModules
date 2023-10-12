ALTER TABLE ehr.animal_groups ALTER COLUMN purpose TYPE text;

ALTER TABLE ehr.encounter_flags ALTER COLUMN remark TYPE text;

ALTER TABLE ehr.encounter_participants ALTER COLUMN comment TYPE text;

ALTER TABLE ehr.formpanelsections ALTER COLUMN metadatasources TYPE text;
ALTER TABLE ehr.formpanelsections ALTER COLUMN buttons TYPE text;
ALTER TABLE ehr.formpanelsections ALTER COLUMN initialtemplates TYPE text;

ALTER TABLE ehr.formtypes ALTER COLUMN configjson TYPE text;

ALTER TABLE ehr.observation_types ALTER COLUMN editorconfig TYPE text;

ALTER TABLE ehr.project ALTER COLUMN contact_emails TYPE text;

ALTER TABLE ehr.protocol_amendments ALTER COLUMN Comment TYPE text;

ALTER TABLE ehr.protocol_counts ALTER COLUMN description TYPE text;

ALTER TABLE ehr.protocolexemptions ALTER COLUMN remark TYPE text;

ALTER TABLE ehr.protocolprocedures ALTER COLUMN remark TYPE text;

ALTER TABLE ehr.reports ALTER COLUMN jsonconfig TYPE text;
ALTER TABLE ehr.reports ALTER COLUMN description TYPE text;

ALTER TABLE ehr.requests ALTER COLUMN remark TYPE text;

ALTER TABLE ehr.scheduled_tasks ALTER COLUMN description TYPE text;

ALTER TABLE ehr.status ALTER COLUMN description TYPE text;

ALTER TABLE ehr.supplemental_pedigree ALTER COLUMN species TYPE text;