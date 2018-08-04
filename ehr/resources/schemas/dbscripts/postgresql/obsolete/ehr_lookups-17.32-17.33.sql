
-- add Lsid column to ehr_lookups tables to allow them to be extensible
ALTER TABLE ehr_lookups.geographic_origins ADD COLUMN Lsid LSIDtype;
ALTER TABLE ehr_lookups.rooms ADD COLUMN Lsid LSIDtype;
ALTER TABLE ehr_lookups.buildings ADD COLUMN Lsid LSIDtype;
ALTER TABLE ehr_lookups.treatment_codes ADD COLUMN Lsid LSIDtype;

-- add Container column to the same ehr_lookups tables (values to be populated in Java upgrade script)
ALTER TABLE ehr_lookups.geographic_origins ADD COLUMN Container ENTITYID;
ALTER TABLE ehr_lookups.rooms ADD COLUMN Container ENTITYID;
ALTER TABLE ehr_lookups.buildings ADD COLUMN Container ENTITYID;
ALTER TABLE ehr_lookups.treatment_codes ADD COLUMN Container ENTITYID;

-- add the FK for those Container columns
ALTER TABLE ehr_lookups.geographic_origins ADD CONSTRAINT FK_geographic_origins_Container FOREIGN KEY (Container) REFERENCES core.Containers(EntityId);
ALTER TABLE ehr_lookups.rooms ADD CONSTRAINT FK_rooms_Container FOREIGN KEY (Container) REFERENCES core.Containers(EntityId);
ALTER TABLE ehr_lookups.buildings ADD CONSTRAINT FK_buildings_Container FOREIGN KEY (Container) REFERENCES core.Containers(EntityId);
ALTER TABLE ehr_lookups.treatment_codes ADD CONSTRAINT FK_treatment_codes_Container FOREIGN KEY (Container) REFERENCES core.Containers(EntityId);

-- Java upgrade script to populate the Container column from site-level EHRStudyContainer module property
SELECT core.executeJavaUpgradeCode('setEhrLookupsContainer');

-- remove any NULL rows for Container
DELETE FROM ehr_lookups.geographic_origins WHERE Container IS NULL;
DELETE FROM ehr_lookups.rooms WHERE Container IS NULL;
DELETE FROM ehr_lookups.buildings WHERE Container IS NULL;
DELETE FROM ehr_lookups.treatment_codes WHERE Container IS NULL;

--set NOT NULL constraint for the Container columns
ALTER TABLE ehr_lookups.geographic_origins ALTER COLUMN Container SET NOT NULL;
ALTER TABLE ehr_lookups.rooms ALTER COLUMN Container SET NOT NULL;
ALTER TABLE ehr_lookups.buildings ALTER COLUMN Container SET NOT NULL;
ALTER TABLE ehr_lookups.treatment_codes ALTER COLUMN Container SET NOT NULL;

-- add the INDEX for those Container columns
CREATE INDEX IX_geographic_origins_Container ON ehr_lookups.geographic_origins (Container);
CREATE INDEX IX_rooms_Container ON ehr_lookups.rooms (Container);
CREATE INDEX IX_buildings_Container ON ehr_lookups.buildings (Container);
CREATE INDEX IX_treatment_codes_Container ON ehr_lookups.treatment_codes (Container);