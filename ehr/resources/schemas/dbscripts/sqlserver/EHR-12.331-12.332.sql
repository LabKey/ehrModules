--remove not null constraint
alter table ehr.protocol_counts alter column protocol varchar(200) null;