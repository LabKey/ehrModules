/*
 * Copyright (c) 2013-2026 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
ALTER TABLE viral_load_assay.abi7500_detectors ADD quencher varchar(200);
ALTER TABLE viral_load_assay.abi7500_detectors ADD reporter varchar(200);
GO
UPDATE viral_load_assay.abi7500_detectors SET reporter = fluor;
ALTER TABLE viral_load_assay.abi7500_detectors DROP COLUMN fluor;