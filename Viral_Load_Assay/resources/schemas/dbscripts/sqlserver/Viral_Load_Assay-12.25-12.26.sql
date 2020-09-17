CREATE TABLE viral_load_assay.nucleic_acid
(
  type NVARCHAR(200) NOT NULL,
  container entityid NOT NULL,
  rowid INT IDENTITY(1, 1),

  CONSTRAINT pk_nucleic_acid PRIMARY KEY (rowid)
);

CREATE TABLE viral_load_assay.source_material
(
  type NVARCHAR(200) NOT NULL,
  liquid BIT NOT NULL,
  container entityid NOT NULL,
  rowid INT IDENTITY(1, 1),

  CONSTRAINT pk_source_material PRIMARY KEY (rowid)
);