ALTER TABLE ehr_lookups.blood_draw_services ADD requiredtubetype varchar(100);
ALTER TABLE ehr_lookups.blood_draw_services ADD minvolume double precision;
GO
UPDATE ehr_lookups.blood_draw_services SET requiredtubetype = 'EDTA' WHERE service = 'CBC';
UPDATE ehr_lookups.blood_draw_services SET requiredtubetype = 'SST' WHERE service = 'Vet-19';