truncate table ehr.encounter_participants;

--this might have been created by EHRManager
EXEC core.fn_dropifexists 'encounter_participants', 'ehr', 'index', 'encounter_participants_objectid';
GO
ALTER TABLE ehr.encounter_participants ALTER COLUMN objectid ENTITYID NOT NULL;
GO
EXEC core.fn_dropifexists 'encounter_participants', 'ehr', 'constraint', 'pk_encounter_participants';

ALTER TABLE ehr.encounter_participants ADD CONSTRAINT pk_encounter_participants PRIMARY KEY (objectid);
GO
EXEC core.fn_dropifexists 'encounter_participants', 'ehr', 'index', 'encounter_participants_container_rowid_id';
EXEC core.fn_dropifexists 'encounter_participants', 'ehr', 'index', 'encounter_participants_container_rowid_parentid';
GO


ALTER TABLE ehr.encounter_participants DROP COLUMN rowid;

