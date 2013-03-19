ALTER TABLE ehr.protocol_counts add project integer;
ALTER TABLE ehr.protocol_counts add start timestamp;
ALTER TABLE ehr.protocol_counts add enddate timestamp;
ALTER TABLE ehr.protocol_counts add gender varchar(100);

ALTER TABLE ehr.protocol add first_approval timestamp;

ALTER TABLE ehr.protocolProcedures add project integer;
ALTER TABLE ehr.protocolProcedures add daysBetween integer;

ALTER TABLE ehr.snomed_tags add id varchar(100);
ALTER TABLE ehr.snomed_tags add date timestamp;