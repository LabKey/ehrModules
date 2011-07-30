/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

DROP TABLE IF EXISTS ehr_lookups.urinalysis_qualitative_results;
CREATE TABLE ehr_lookups.urinalysis_qualitative_results (
result varchar(255) not null,

CONSTRAINT PK_urinalysis_qualitative_results PRIMARY KEY (result)
)
WITH (OIDS=FALSE)

;

INSERT INTO ehr_lookups.urinalysis_qualitative_results
(result) VALUES
('Small'),
('Moderate'),
('Large'),
('Trace'),
('Trace-Lysed'),
('Trace-Intact'),
('Clear'),
('Hazy'),
('Cloudy'),
('Flocc.')
;

