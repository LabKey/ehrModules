ALTER TABLE ehr_lookups.procedure_default_charges drop Column quantity;
ALTER TABLE ehr_lookups.procedure_default_charges ADD quantity double precision;

ALTER TABLE ehr_lookups.cage_type add cageslots integer default 1;
ALTER TABLE ehr_lookups.cage_type add CageCapacity integer;
ALTER TABLE ehr_lookups.cage_type add MaxAnimalWeight double precision;

CREATE TABLE ehr_lookups.locations (
  location varchar(100),
  area varchar(100),
  buildingId int,
  locationtype int,
  housingcategory int,
  size double precision,
  active bit,

  createdby userid,
  created datetime,
  modifiedby userid,
  modified datetime,

  CONSTRAINT pk_locations PRIMARY KEY (location)
);