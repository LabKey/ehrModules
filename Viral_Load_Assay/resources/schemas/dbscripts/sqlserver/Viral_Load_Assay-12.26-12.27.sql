/*
 * Copyright (c) 2020-2026 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
INSERT INTO viral_load_assay.vl_instrument (instrument)
  SELECT 'LC96'
  WHERE
    NOT EXISTS (
        SELECT instrument FROM viral_load_assay.vl_instrument WHERE instrument = 'LC96'
    );