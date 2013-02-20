ALTER TABLE ehr.snomed_tags ADD set_number int default 1;
go
update ehr.snomed_tags set set_number = 1 where set_number is null;