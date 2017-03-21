CREATE PROCEDURE ehr.handleSpeciesUpgrade AS
  BEGIN
    IF NOT EXISTS(SELECT column_name
                  FROM information_schema.columns
                  WHERE table_name='species' and table_schema='ehr_lookups' and column_name='USDA')
      BEGIN
        -- Run variants of scripts from onprc15.2Prod
        ALTER TABLE ehr_lookups.species ADD  USDA bit;
        ALTER TABLE ehr_lookups.species ADD  Gestation INTEGER;
      END
  END;

GO

EXEC ehr.handleSpeciesUpgrade
GO

DROP PROCEDURE ehr.handleSpeciesUpgrade
GO


