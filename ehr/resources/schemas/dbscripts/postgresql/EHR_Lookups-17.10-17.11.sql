/*
 * Copyright (c) 2015-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
CREATE FUNCTION ehr.handleSpeciesUpgrade() RETURNS VOID AS $$
DECLARE
    BEGIN
      IF NOT EXISTS (
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name='species' and table_schema='ehr_lookups' and column_name='usda'
      )
      THEN
        -- Run variants of scripts from onprc15.2

        ALTER TABLE ehr_lookups.species ADD USDA BOOLEAN;
        ALTER TABLE ehr_lookups.species ADD  Gestation INTEGER;
      END IF;
    END;
$$ LANGUAGE plpgsql;

SELECT ehr.handleSpeciesUpgrade();

DROP FUNCTION ehr.handleSpeciesUpgrade();
