--this might have been created by EHRManager
EXEC core.fn_dropifexists 'encounter_participants', 'ehr', 'index', 'encounter_participants_objectid';
EXEC core.fn_dropifexists 'encounter_participants', 'ehr', 'CONSTRAINT', 'PK_encounter_participants';

GO
ALTER TABLE ehr.encounter_participants ALTER COLUMN objectid VARCHAR(60) NOT NULL;
GO

ALTER TABLE ehr.encounter_participants ADD CONSTRAINT pk_encounter_participants PRIMARY KEY (objectid);

