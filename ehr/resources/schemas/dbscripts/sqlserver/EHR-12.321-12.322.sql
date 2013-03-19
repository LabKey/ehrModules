ALTER TABLE ehr.protocol_counts add project integer;
ALTER TABLE ehr.protocol_counts add start datetime;
ALTER TABLE ehr.protocol_counts add enddate datetime;
ALTER TABLE ehr.protocol_counts add gender varchar(100);

ALTER TABLE ehr.protocol add first_approval datetime;

ALTER TABLE ehr.protocolProcedures add project integer;
ALTER TABLE ehr.protocolProcedures add daysBetween integer;