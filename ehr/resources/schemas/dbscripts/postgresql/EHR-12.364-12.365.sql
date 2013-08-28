--this might have been created by EHRManager
SELECT core.fn_dropifexists('encounter_participants', 'ehr', 'INDEX', 'encounter_participants_objectid');
SELECT core.fn_dropifexists('encounter_participants', 'ehr', 'CONSTRAINT', 'pk_encounter_participants');

ALTER TABLE ehr.encounter_participants ALTER COLUMN objectid TYPE VARCHAR(60);

ALTER TABLE ehr.encounter_participants ADD CONSTRAINT pk_encounter_participants PRIMARY KEY (objectid);

