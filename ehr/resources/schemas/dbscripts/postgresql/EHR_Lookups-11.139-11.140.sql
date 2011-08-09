/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

DELETE FROM ehr_lookups.death_cause;

INSERT INTO ehr_lookups.death_cause
(cause) VALUES
('Experimental'),
('Clinical'),
('Other'),
('Quarantine Clinical (QC)'),
('Quarantine Experimental (QX)'),
('Quarantine Other')
;

DROP TABLE IF EXISTS ehr_lookups.death_manner;
CREATE TABLE ehr_lookups.death_manner (
manner varchar(255) not null,

CONSTRAINT PK_death_manner PRIMARY KEY (manner)
)
WITH (OIDS=FALSE)

;

INSERT INTO ehr_lookups.death_manner
(manner) VALUES
('Euthanasia'),
('Died during medical treatment'),
('Found dead'),
('Other')
;

delete from ehr_lookups.conc_units where unit = 'g/mL';

INSERT INTO ehr_lookups.conc_units
(unit, denominator, numerator) VALUES
('g/mL', 'g', 'piece(s)')
;

delete from ehr_lookups.treatment_codes where meaning = 'Inulin (Fiber Bites) ';
delete from ehr_lookups.treatment_codes where meaning = 'Inulin (Fiber Bites)';


INSERT INTO ehr_lookups.treatment_codes
(category,meaning,code,qualifier,route,concentration,conc_units,dosage,dosage_units,volume,vol_units,amount,amount_units,frequency)
values
('GI' ,'Inulin (Fiber Bites)' ,'r-f94e9' ,'' ,'oral' ,2 ,'g/piece', null, null, 1, 'piece(s)', 2, 'g', 1)
;