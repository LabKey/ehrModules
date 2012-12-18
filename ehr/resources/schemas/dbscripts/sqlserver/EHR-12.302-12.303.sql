ALTER TABLE ehr.tasks ADD billingType int;

alter table ehr.project add name varchar(100);
alter table ehr.project add investigatorId int;

alter table ehr.protocol add investigatorId int;