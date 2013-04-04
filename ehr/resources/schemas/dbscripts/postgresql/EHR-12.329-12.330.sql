DROP INDEX ehr.encounter_encounter_participants_id;
CREATE INDEX encounter_participants_id ON ehr.encounter_participants (id);