CREATE TABLE viral_load_assay.nucleic_acid
(
  type CHARACTER VARYING(200) NOT NULL,
  container entityid NOT NULL,
  rowid SERIAL NOT NULL,

  CONSTRAINT pk_nucleic_acid PRIMARY KEY (rowid)
);

CREATE TABLE viral_load_assay.source_material
(
  type CHARACTER VARYING(200) NOT NULL,
  liquid BOOLEAN NOT NULL,
  container entityid NOT NULL,
  rowid SERIAL NOT NULL,

  CONSTRAINT pk_source_material PRIMARY KEY (rowid)
);