CREATE TABLE viral_load_assay.abi7500_detectors (
  rowid int identity(1,1),
  assayName varchar(200),
  detector varchar(200),
  fluor varchar(200),

  constraint PK_abi7500_detectors PRIMARY KEY (rowid)
);

CREATE TABLE viral_load_assay.fluors (
  name varchar(200),

  constraint PK_fluors PRIMARY KEY (name)
);

INSERT INTO viral_load_assay.fluors (name) VALUES ('FAM');
