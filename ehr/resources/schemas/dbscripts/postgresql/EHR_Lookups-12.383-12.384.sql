ALTER TABLE ehr_lookups.blood_draw_services add formtype varchar(100);
ALTER TABLE ehr_lookups.blood_draw_services add labwork_service varchar(100);

UPDATE ehr_lookups.blood_draw_services SET formtype = 'Clinpath Request';
UPDATE ehr_lookups.blood_draw_services SET labwork_service = service;
