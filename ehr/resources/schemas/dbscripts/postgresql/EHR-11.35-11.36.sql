drop TABLE ehr.client_errors;

--modify column sizes:
alter table ehr.project alter column title TYPE varchar(200);
alter table ehr.project alter column inves TYPE varchar(200);
alter table ehr.project alter column reqname TYPE varchar(200);

alter table ehr.project alter column protocol TYPE varchar(200);

alter table ehr.protocol_counts alter column protocol TYPE varchar(200);

alter table ehr.requests alter column title TYPE varchar(200);

alter table ehr.tasks alter column title TYPE varchar(200);

alter table ehr.qcstatemetadata alter column qcstatelabel TYPE varchar(200);

alter table ehr.formpanelsections alter column formtype TYPE varchar(200);
alter table ehr.formpanelsections alter column destination TYPE varchar(200);
alter table ehr.formpanelsections alter column title TYPE varchar(200);

alter table ehr.formtemplaterecords alter column storeid TYPE varchar(1000);

alter table ehr.formtemplates alter column title TYPE varchar(200);
alter table ehr.formtemplates alter column formtype TYPE varchar(200);

alter table ehr.notificationrecipients alter column notificationtype TYPE varchar(200);

alter table ehr.notificationtypes alter column notificationtype TYPE varchar(200);

--add container columns:
alter table ehr.supplemental_pedigree add column container entityid;

--update the wisconsin site - only active EHR user
update ehr.supplemental_pedigree p set container = (select entityid from core.containers where name = 'EHR');
