/*
 * Copyright (c) 2020-2026 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
BEGIN;

ALTER TABLE viral_load_assay.nucleic_acid DROP CONSTRAINT pk_nucleic_acid;
ALTER TABLE viral_load_assay.nucleic_acid ADD CONSTRAINT pk_nucleic_acid PRIMARY KEY (type);

ALTER TABLE viral_load_assay.source_material DROP CONSTRAINT pk_source_material;
ALTER TABLE viral_load_assay.source_material ADD CONSTRAINT pk_source_material PRIMARY KEY (type);

COMMIT;