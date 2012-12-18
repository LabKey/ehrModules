CREATE TABLE ehr_lookups.billingTypes (
  rowid serial,
  name varchar(100),

  CONSTRAINT PK_billingTypes PRIMARY KEY (rowid)
);

INSERT INTO ehr_lookups.billingTypes (name) VALUES ('Surgery');
INSERT INTO ehr_lookups.billingTypes (name) VALUES ('Clinical');
INSERT INTO ehr_lookups.billingTypes (name) VALUES ('Non-Center Staff');

ALTER TABLE ehr_lookups.species ADD blood_vol_multiplier double precision;
UPDATE ehr_lookups.species set blood_vol_multiplier = 0.1;