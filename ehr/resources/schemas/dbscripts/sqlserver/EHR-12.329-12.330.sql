DROP INDEX encounter_encounter_participants_id ON ehr.encounter_participants;
CREATE INDEX encounter_participants_id ON ehr.encounter_participants (id);