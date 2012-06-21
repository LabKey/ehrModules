CREATE SCHEMA ehr_lookups;
GO

CREATE TABLE ehr_lookups.ageclass
(
  rowid INT IDENTITY(1,1) NOT NULL,
  species VARCHAR(255),
  "ageclass" int,
  min double precision,
  max double precision,
  CONSTRAINT pk_ageclass PRIMARY KEY (rowid )
);

CREATE TABLE ehr_lookups.alopecia_cause
(
  cause VARCHAR(4000) NOT NULL,
  CONSTRAINT pk_alopecia_cause PRIMARY KEY (cause )
);

CREATE TABLE ehr_lookups.alopecia_score
(
  score integer NOT NULL,
  meaning VARCHAR(250) DEFAULT NULL,
  CONSTRAINT pk_alopecia_score PRIMARY KEY (score )
);

CREATE TABLE ehr_lookups.amount_units
(
  unit VARCHAR(100) NOT NULL,
  CONSTRAINT pk_amount_units PRIMARY KEY (unit )
);

CREATE TABLE ehr_lookups.arearooms
(
  rowid INT IDENTITY(1,1) NOT NULL,
  area VARCHAR(20) NOT NULL,
  room VARCHAR(20) NOT NULL,
  CONSTRAINT pk_arearooms PRIMARY KEY (rowid )
);

CREATE TABLE ehr_lookups.areas
(
  area VARCHAR(20) NOT NULL,
  CONSTRAINT pk_areas PRIMARY KEY (area )
);

CREATE TABLE ehr_lookups.avail_codes
(
  code VARCHAR(4000) NOT NULL,
  meaning VARCHAR(4000),
  CONSTRAINT pk_avail_codes PRIMARY KEY (code )
);

CREATE TABLE ehr_lookups.bacteriology_method
(
  method VARCHAR(255) NOT NULL,
  CONSTRAINT pk_bacteriology_method PRIMARY KEY (method )
);

CREATE TABLE ehr_lookups.bacteriology_sensitivity
(
  code VARCHAR(4000) NOT NULL,
  meaning VARCHAR(4000),
  CONSTRAINT pk_bacteriology_sensitivity PRIMARY KEY (code )
);

CREATE TABLE ehr_lookups.bcs_score
(
  score double precision NOT NULL,
  meaning VARCHAR(250) DEFAULT NULL,
  description VARCHAR(500) DEFAULT NULL,
  CONSTRAINT pk_bcs_score PRIMARY KEY (score )
);

CREATE TABLE ehr_lookups.behavior_category
(
  category VARCHAR(4000) NOT NULL,
  CONSTRAINT pk_behavior_category PRIMARY KEY (category )
);

CREATE TABLE ehr_lookups.biopsy_type
(
  type VARCHAR(255) NOT NULL,
  CONSTRAINT pk_biopsy_type PRIMARY KEY (type )
);

CREATE TABLE ehr_lookups.birth_type
(
  type VARCHAR(45) NOT NULL,
  meaning text,
  CONSTRAINT pk_birth_type PRIMARY KEY (type )
);

CREATE TABLE ehr_lookups.blood_billed_by
(
  code VARCHAR(200) NOT NULL,
  title VARCHAR(200),
  CONSTRAINT pk_blood_billed_by PRIMARY KEY (code )
);

CREATE TABLE ehr_lookups.blood_code_prefixes
(
  prefix VARCHAR(10) NOT NULL,
  CONSTRAINT pk_blood_code_prefixes PRIMARY KEY (prefix )
);

CREATE TABLE ehr_lookups.blood_draw_services
(
  service VARCHAR(255) NOT NULL,
  automaticrequestfromblooddraw bit NOT NULL DEFAULT 1,
  CONSTRAINT pk_blood_draw_services PRIMARY KEY (service )
);

CREATE TABLE ehr_lookups.blood_draw_tube_type
(
  type VARCHAR(255) NOT NULL,
  CONSTRAINT pk_blood_draw_tube_type PRIMARY KEY (type )
);

CREATE TABLE ehr_lookups.blood_tube_volumes
(
  volume double precision NOT NULL,
  tube_types VARCHAR(100),
  CONSTRAINT pk_blood_tube_volumes PRIMARY KEY (volume )
);

CREATE TABLE ehr_lookups.cage
(
  rowid INT IDENTITY(1,1) NOT NULL,
  roomcage VARCHAR(24) NOT NULL,
  room VARCHAR(8) DEFAULT NULL,
  cage VARCHAR(8) DEFAULT NULL,
  length double precision,
  width double precision,
  height double precision,
  ts datetime DEFAULT NULL,
  uuid varchar(36) DEFAULT NULL,
  jointocage VARCHAR(50),
  CONSTRAINT pk_cage PRIMARY KEY (roomcage )
);

CREATE TABLE ehr_lookups.cageclass
(
  rowid INT IDENTITY(1,1) NOT NULL,
  low double precision,
  high double precision,
  sqft double precision,
  height double precision,
  CONSTRAINT pk_cageclass PRIMARY KEY (rowid )
);

CREATE TABLE ehr_lookups.calculated_status_codes
(
  code VARCHAR(20) NOT NULL,
  meaning VARCHAR(255) DEFAULT NULL,
  CONSTRAINT pk_calculated_status_codes PRIMARY KEY (code )
);

CREATE TABLE ehr_lookups.charge_items
(
  rowid INT IDENTITY(1,1) NOT NULL,
  category VARCHAR(255),
  description VARCHAR(4000) NOT NULL,
  cost double precision,
  container entityid,
  createdby userid NOT NULL,
  created datetime NOT NULL,
  modifiedby userid NOT NULL,
  modified datetime NOT NULL,
  CONSTRAINT pk_charge_items PRIMARY KEY (rowid )
);

CREATE TABLE ehr_lookups.chemistry_method
(
  method VARCHAR(255) NOT NULL,
  CONSTRAINT pk_chemistry_method PRIMARY KEY (method )
);

CREATE TABLE ehr_lookups.chemistry_tests
(
  testid VARCHAR(100) NOT NULL,
  name VARCHAR(100),
  units VARCHAR(100),
  aliases VARCHAR(500),
  alertonabnormal bit DEFAULT 1,
  alertonany bit DEFAULT 0,
  includeinpanel bit DEFAULT 0,
  sort_order integer,
  CONSTRAINT pk_chemistry_tests PRIMARY KEY (testid )
);

CREATE TABLE ehr_lookups.chow_types
(
  type VARCHAR(200) NOT NULL,
  CONSTRAINT pk_chow_types PRIMARY KEY (type )
);

CREATE TABLE ehr_lookups.clinpath_collection_method
(
  method VARCHAR(255) NOT NULL,
  CONSTRAINT pk_clinpath_collection_method PRIMARY KEY (method )
);

CREATE TABLE ehr_lookups.clinpath_sampletype
(
  sampletype VARCHAR(255) NOT NULL,
  CONSTRAINT pk_clinpath_sampletype PRIMARY KEY (sampletype )
);

CREATE TABLE ehr_lookups.clinpath_status
(
  status VARCHAR(255) NOT NULL,
  CONSTRAINT pk_clinpath_status PRIMARY KEY (status )
);

CREATE TABLE ehr_lookups.clinpath_tests
(
  testname VARCHAR(255) NOT NULL,
  units VARCHAR(20),
  dataset VARCHAR(200),
  alertoncomplete bit DEFAULT 0,
  CONSTRAINT pk_testname PRIMARY KEY (testname )
);

CREATE TABLE ehr_lookups.clinpath_types
(
  type VARCHAR(255) NOT NULL,
  CONSTRAINT pk_clinpath_types PRIMARY KEY (type )
);

CREATE TABLE ehr_lookups.clinremarks_category
(
  category VARCHAR(255) NOT NULL,
  CONSTRAINT pk_clinremarks_category PRIMARY KEY (category )
);

CREATE TABLE ehr_lookups.conc_units
(
  unit VARCHAR(100) NOT NULL,
  denominator VARCHAR(100),
  numerator VARCHAR(100),
  CONSTRAINT pk_conc_units PRIMARY KEY (unit )
);

CREATE TABLE ehr_lookups.condition_codes
(
  code VARCHAR(255) NOT NULL,
  meaning VARCHAR(255) DEFAULT NULL,
  min integer,
  max integer,
  CONSTRAINT pk_condition_codes PRIMARY KEY (code )
);

CREATE TABLE ehr_lookups.container_types
(
  type VARCHAR(100) NOT NULL,
  CONSTRAINT pk_container_types PRIMARY KEY (type )
);

CREATE TABLE ehr_lookups.cytology_tests
(
  testid VARCHAR(100) NOT NULL,
  name VARCHAR(100),
  units VARCHAR(100),
  sort_order integer,
  alertonabnormal bit DEFAULT 1,
  alertonany bit DEFAULT 0,
  includeinpanel bit DEFAULT 0,
  CONSTRAINT pk_cytology_tests PRIMARY KEY (testid )
);

CREATE TABLE ehr_lookups.death_cause
(
  cause VARCHAR(255) NOT NULL,
  CONSTRAINT pk_death_cause PRIMARY KEY (cause )
);

CREATE TABLE ehr_lookups.death_codes
(
  code VARCHAR(255) NOT NULL,
  meaning VARCHAR(255) DEFAULT NULL,
  CONSTRAINT pk_death_codes PRIMARY KEY (code )
);

CREATE TABLE ehr_lookups.death_manner
(
  manner VARCHAR(255) NOT NULL,
  CONSTRAINT pk_death_manner PRIMARY KEY (manner )
);

CREATE TABLE ehr_lookups.death_remarks
(
  title VARCHAR(100) NOT NULL,
  remark VARCHAR(500),
  CONSTRAINT pk_death_remarks PRIMARY KEY (title )
);

CREATE TABLE ehr_lookups.dental_gingivitis
(
  result VARCHAR(255) NOT NULL,
  sort_order integer,
  CONSTRAINT pk_dental_gingivitis PRIMARY KEY (result )
);

CREATE TABLE ehr_lookups.dental_jaw
(
  jaw VARCHAR(255) NOT NULL,
  CONSTRAINT pk_dental_jaw PRIMARY KEY (jaw )
);

CREATE TABLE ehr_lookups.dental_priority
(
  priority VARCHAR(255) NOT NULL,
  criteria VARCHAR(255),
  sort_order integer,
  CONSTRAINT pk_dental_priority PRIMARY KEY (priority )
);

CREATE TABLE ehr_lookups.dental_side
(
  side VARCHAR(255) NOT NULL,
  CONSTRAINT pk_dental_side PRIMARY KEY (side )
);

CREATE TABLE ehr_lookups.dental_status
(
  status VARCHAR(255) NOT NULL,
  CONSTRAINT pk_dental_status PRIMARY KEY (status )
);

CREATE TABLE ehr_lookups.dental_tartar
(
  result VARCHAR(255) NOT NULL,
  CONSTRAINT pk_dental_tartar PRIMARY KEY (result )
);

CREATE TABLE ehr_lookups.dental_teeth
(
  teeth varchar(100) NOT NULL,
  seq_order integer,
  CONSTRAINT pk_dental_teeth PRIMARY KEY (teeth )
);

CREATE TABLE ehr_lookups.dosage_units
(
  unit VARCHAR(100) NOT NULL,
  numerator VARCHAR(100),
  denominator VARCHAR(20),
  CONSTRAINT pk_dosage_units PRIMARY KEY (unit )
);

CREATE TABLE ehr_lookups.drug_categories
(
  category VARCHAR(200) NOT NULL,
  CONSTRAINT pk_drug_categories PRIMARY KEY (category )
);

CREATE TABLE ehr_lookups.drug_defaults
(
  code VARCHAR(255) NOT NULL,
  dosage double precision,
  dosage_units VARCHAR(255),
  concentration double precision,
  conc_units VARCHAR(255),
  CONSTRAINT pk_drug_defaults PRIMARY KEY (code )
);

CREATE TABLE ehr_lookups.encounter_types
(
  type VARCHAR(255) NOT NULL,
  CONSTRAINT pk_encounter_types PRIMARY KEY (type )
);

CREATE TABLE ehr_lookups.error_types
(
  type VARCHAR(255) NOT NULL,
  sort_order integer,
  CONSTRAINT pk_error_types PRIMARY KEY (type )
);

CREATE TABLE ehr_lookups.full_snomed
(
  code VARCHAR(255) NOT NULL,
  meaning VARCHAR(2000),
  createdby userid NOT NULL,
  created datetime NOT NULL,
  modifiedby userid NOT NULL,
  modified datetime NOT NULL,
  CONSTRAINT pk_full_snomed PRIMARY KEY (code )
);

CREATE TABLE ehr_lookups.gender_codes
(
  code VARCHAR(255) NOT NULL,
  meaning VARCHAR(255) DEFAULT NULL,
  origgender VARCHAR(255) DEFAULT NULL,
  CONSTRAINT pk_gender_codes PRIMARY KEY (code )
);

CREATE TABLE ehr_lookups.hematology_method
(
  method VARCHAR(255) NOT NULL,
  CONSTRAINT pk_hematology_method PRIMARY KEY (method )
);

CREATE TABLE ehr_lookups.hematology_morphology
(
  morphology VARCHAR(255) NOT NULL,
  CONSTRAINT pk_hematology_morphology PRIMARY KEY (morphology )
);

CREATE TABLE ehr_lookups.hematology_score
(
  score VARCHAR(255) NOT NULL,
  CONSTRAINT pk_hematology_score PRIMARY KEY (score )
);

CREATE TABLE ehr_lookups.hematology_tests
(
  testid VARCHAR(100) NOT NULL,
  name VARCHAR(100),
  units VARCHAR(100),
  sort_order integer,
  alertonabnormal bit DEFAULT 1,
  alertonany bit DEFAULT 0,
  includeinpanel bit DEFAULT 0,
  CONSTRAINT pk_hematology_tests PRIMARY KEY (testid )
);

CREATE TABLE ehr_lookups.histology_stain
(
  stain VARCHAR(255) NOT NULL,
  CONSTRAINT pk_histology_stain PRIMARY KEY (stain )
);

CREATE TABLE ehr_lookups.hold_codes
(
  code VARCHAR(255) NOT NULL,
  meaning VARCHAR(255) DEFAULT NULL,
  CONSTRAINT pk_hold_codes PRIMARY KEY (code )
);

CREATE TABLE ehr_lookups.housing_reason
(
  reason VARCHAR(200) NOT NULL,
  CONSTRAINT pk_housing_reason PRIMARY KEY (reason )
);

CREATE TABLE ehr_lookups.immunology_method
(
  method VARCHAR(255) NOT NULL,
  CONSTRAINT pk_immunology_method PRIMARY KEY (method )
);

CREATE TABLE ehr_lookups.immunology_tests
(
  testid VARCHAR(100) NOT NULL,
  name VARCHAR(100),
  units VARCHAR(100),
  alertonabnormal bit DEFAULT 1,
  alertonany bit DEFAULT 0,
  includeinpanel bit DEFAULT 0,
  sort_order integer,
  CONSTRAINT pk_immunology_tests PRIMARY KEY (testid )
);

CREATE TABLE ehr_lookups.integers
(
  "key" integer NOT NULL,
  CONSTRAINT pk_integers PRIMARY KEY ("key" )
);

CREATE TABLE ehr_lookups.lab_test_range
(
  rowid INT IDENTITY(1,1) NOT NULL,
  test VARCHAR(255),
  species VARCHAR(255),
  gender VARCHAR(255),
  age_class smallint,
  ref_range_min double precision,
  ref_range_max double precision,
  type VARCHAR(200),
  CONSTRAINT pk_lab_test_range PRIMARY KEY (rowid )
);

CREATE TABLE ehr_lookups.mhc_institutions
(
  technique VARCHAR(255) NOT NULL,
  CONSTRAINT pk_mhc_institutions PRIMARY KEY (technique )
);

CREATE TABLE ehr_lookups.microchip_comments
(
  comment VARCHAR(100) NOT NULL,
  CONSTRAINT pk_microchip_comments PRIMARY KEY (comment )
);

CREATE TABLE ehr_lookups.months
(
  rowid INT IDENTITY(1,1) NOT NULL,
  month VARCHAR(255) NOT NULL,
  CONSTRAINT pk_months PRIMARY KEY (rowid )
);

CREATE TABLE ehr_lookups.necropsy_condition
(
  score VARCHAR(255) NOT NULL,
  CONSTRAINT pk_necropsy_condition PRIMARY KEY (score )
);

CREATE TABLE ehr_lookups.necropsy_perfusion
(
  perfusion VARCHAR(255) NOT NULL,
  CONSTRAINT pk_perfusion PRIMARY KEY (perfusion )
);

CREATE TABLE ehr_lookups.necropsy_perfusion_area
(
  perfusion VARCHAR(255) NOT NULL,
  CONSTRAINT pk_perfusion_area PRIMARY KEY (perfusion )
);

CREATE TABLE ehr_lookups.normal_abnormal
(
  state VARCHAR(255) NOT NULL,
  CONSTRAINT pk_normal_abnormal PRIMARY KEY (state )
);

CREATE TABLE ehr_lookups.obs_behavior
(
  code varchar(100) NOT NULL,
  meaning VARCHAR(200),
  CONSTRAINT pk_obs_behavior PRIMARY KEY (code )
);

CREATE TABLE ehr_lookups.obs_breeding
(
  code varchar(100) NOT NULL,
  meaning VARCHAR(200),
  CONSTRAINT pk_osb_breeding PRIMARY KEY (code )
);

CREATE TABLE ehr_lookups.obs_feces
(
  code varchar(100) NOT NULL,
  meaning VARCHAR(200),
  CONSTRAINT pk_obs_feces PRIMARY KEY (code )
);

CREATE TABLE ehr_lookups.obs_mens
(
  code varchar(100) NOT NULL,
  meaning VARCHAR(200),
  CONSTRAINT pk_obs_mens PRIMARY KEY (code )
);

CREATE TABLE ehr_lookups.obs_other
(
  code varchar(100) NOT NULL,
  meaning VARCHAR(200),
  CONSTRAINT pk_obs_other PRIMARY KEY (code )
);

CREATE TABLE ehr_lookups.obs_remarks
(
  title varchar(200) NOT NULL,
  remark varchar(500),
  CONSTRAINT pk_obs_remarks PRIMARY KEY (title )
);

CREATE TABLE ehr_lookups.obs_tlocation
(
  location varchar(100) NOT NULL,
  sort_order integer,
  code VARCHAR(100),
  CONSTRAINT pk_obs_tlocation PRIMARY KEY (location )
);

CREATE TABLE ehr_lookups.observations_anesthesia_recovery
(
  value VARCHAR(255) NOT NULL,
  sort_order integer NOT NULL,
  CONSTRAINT pk_observations_anesthesia_recovery PRIMARY KEY (value )
);

CREATE TABLE ehr_lookups.oor_indicators
(
  indicator VARCHAR(255) NOT NULL,
  CONSTRAINT pk_oor_indicators PRIMARY KEY (indicator )
);

CREATE TABLE ehr_lookups.origin_codes
(
  code VARCHAR(255) NOT NULL,
  meaning VARCHAR(255) DEFAULT NULL,
  CONSTRAINT pk_origin_codes PRIMARY KEY (code )
);

CREATE TABLE ehr_lookups.pairtest_bhav
(
  value VARCHAR(255) NOT NULL,
  CONSTRAINT pk_pairtest_bhav PRIMARY KEY (value )
);

CREATE TABLE ehr_lookups.pairtest_conclusion
(
  value VARCHAR(255) NOT NULL,
  CONSTRAINT pk_pairtest_conclusion PRIMARY KEY (value )
);

CREATE TABLE ehr_lookups.parasitology_method
(
  method VARCHAR(255) NOT NULL,
  CONSTRAINT pk_parasitology_method PRIMARY KEY (method )
);

CREATE TABLE ehr_lookups.pe_region
(
  region VARCHAR(255) NOT NULL,
  CONSTRAINT pk_pe_region PRIMARY KEY (region )
);

CREATE TABLE ehr_lookups.pe_remarks
(
  remark VARCHAR(500) NOT NULL,
  CONSTRAINT pk_pe_remarks PRIMARY KEY (remark )
);

CREATE TABLE ehr_lookups.preservation_solutions
(
  solution VARCHAR(100) NOT NULL,
  CONSTRAINT pk_preservation_solutions PRIMARY KEY (solution )
);

CREATE TABLE ehr_lookups.problem_list_category
(
  category VARCHAR(200) NOT NULL,
  CONSTRAINT pk_problem_list_category PRIMARY KEY (category )
);

CREATE TABLE ehr_lookups.procedures
(
  rowid INT IDENTITY(1,1) NOT NULL,
  "procedure" VARCHAR(255),
  code VARCHAR(255),
  description VARCHAR(255),
  CONSTRAINT pk_procedures PRIMARY KEY (rowid )
);

CREATE TABLE ehr_lookups.qualitative_results
(
  result VARCHAR(255) NOT NULL,
  CONSTRAINT pk_qualitative_results PRIMARY KEY (result )
);

CREATE TABLE ehr_lookups.request_priority
(
  priority VARCHAR(255) NOT NULL,
  CONSTRAINT pk_request_priority PRIMARY KEY (priority )
);

CREATE TABLE ehr_lookups.restraint_duration
(
  duration VARCHAR(200) NOT NULL,
  sort_order integer,
  CONSTRAINT pk_restraint_duration PRIMARY KEY (duration )
);

CREATE TABLE ehr_lookups.restraint_type
(
  type VARCHAR(255) NOT NULL,
  code VARCHAR(255),
  include bit,
  CONSTRAINT pk_restraint_type PRIMARY KEY (type )
);

CREATE TABLE ehr_lookups.routes
(
  route VARCHAR(100) NOT NULL,
  meaning VARCHAR(200),
  CONSTRAINT pk_routes PRIMARY KEY (route )
);

CREATE TABLE ehr_lookups.sample_types
(
  type VARCHAR(20) NOT NULL,
  CONSTRAINT pk_sample_types PRIMARY KEY (type )
);

CREATE TABLE ehr_lookups.snomap
(
  rowid INT IDENTITY(1,1) NOT NULL,
  ocode VARCHAR(255) NOT NULL,
  ncode VARCHAR(255) NOT NULL,
  meaning VARCHAR(2000),
  date datetime,
  objectid entityid NOT NULL,
  createdby userid NOT NULL,
  created datetime NOT NULL,
  modifiedby userid NOT NULL,
  modified datetime NOT NULL,
  CONSTRAINT pk_snomap PRIMARY KEY (rowid )
);

CREATE TABLE ehr_lookups.snomed
(
  code VARCHAR(255) NOT NULL,
  meaning VARCHAR(2000),
  createdby userid NOT NULL,
  created datetime NOT NULL,
  modifiedby userid NOT NULL,
  modified datetime NOT NULL,
  CONSTRAINT pk_snomed PRIMARY KEY (code )
);

CREATE TABLE ehr_lookups.snomed_qualifiers
(
  qualifier VARCHAR(100) NOT NULL,
  CONSTRAINT pk_snomed_qualifiers PRIMARY KEY (qualifier )
);

CREATE TABLE ehr_lookups.snomed_subset_codes
(
  rowid INT IDENTITY(1,1) NOT NULL,
  primarycategory VARCHAR(255) NOT NULL,
  secondarycategory VARCHAR(255),
  code VARCHAR(255) NOT NULL,
  container entityid,
  createdby userid NOT NULL,
  created datetime NOT NULL,
  modifiedby userid NOT NULL,
  modified datetime NOT NULL,
  CONSTRAINT pk_snomed_subset_codes PRIMARY KEY (rowid )
);

CREATE TABLE ehr_lookups.snomed_subsets
(
  subset VARCHAR(255) NOT NULL,
  container entityid,
  createdby userid NOT NULL,
  created datetime NOT NULL,
  modifiedby userid NOT NULL,
  modified datetime NOT NULL,
  CONSTRAINT pk_snomed_subsets PRIMARY KEY (subset )
);

CREATE TABLE ehr_lookups.species
(
  common VARCHAR(255) NOT NULL,
  scientific_name VARCHAR(255) DEFAULT NULL,
  id_prefix VARCHAR(255) DEFAULT NULL,
  mhc_prefix VARCHAR(255) DEFAULT NULL,
  CONSTRAINT pk_species PRIMARY KEY (common )
);

CREATE TABLE ehr_lookups.species_codes
(
  code VARCHAR(255) NOT NULL,
  scientific_name VARCHAR(255) DEFAULT NULL,
  common_name VARCHAR(255) DEFAULT NULL,
  CONSTRAINT pk_species_codes PRIMARY KEY (code )
);

CREATE TABLE ehr_lookups.stain_types
(
  type VARCHAR(20) NOT NULL,
  CONSTRAINT pk_stain_types PRIMARY KEY (type )
);

CREATE TABLE ehr_lookups.status_codes
(
  code VARCHAR(20) NOT NULL,
  meaning VARCHAR(255) DEFAULT NULL,
  CONSTRAINT pk_status_codes PRIMARY KEY (code )
);

CREATE TABLE ehr_lookups.tattoo_status
(
  status VARCHAR(100) NOT NULL,
  CONSTRAINT pk_tattoo_status PRIMARY KEY (status )
);

CREATE TABLE ehr_lookups.tb_eye
(
  eye VARCHAR(255) NOT NULL,
  meaning VARCHAR(255),
  CONSTRAINT pk_tb_eye PRIMARY KEY (eye )
);

CREATE TABLE ehr_lookups.tb_result
(
  result VARCHAR(255) NOT NULL,
  CONSTRAINT pk_tb_result PRIMARY KEY (result )
);

CREATE TABLE ehr_lookups.tissue_distribution
(
  location VARCHAR(100) NOT NULL,
  CONSTRAINT pk_tissue_distribution PRIMARY KEY (location )
);

CREATE TABLE ehr_lookups.tissue_recipients
(
  recipient VARCHAR(255) NOT NULL,
  CONSTRAINT pk_tissue_recipients PRIMARY KEY (recipient )
);

CREATE TABLE ehr_lookups.treatment_codes
(
  meaning VARCHAR(250) NOT NULL,
  code VARCHAR(100),
  category VARCHAR(100),
  route VARCHAR(100),
  concentration numeric,
  conc_units VARCHAR(100),
  dosage numeric,
  dosage_units VARCHAR(100),
  volume numeric,
  vol_units VARCHAR(100),
  amount numeric,
  amount_units VARCHAR(100),
  qualifier VARCHAR(200),
  frequency integer,
  CONSTRAINT pk_treatment_codes PRIMARY KEY (meaning )
);

CREATE TABLE ehr_lookups.treatment_frequency
(
  rowid INT IDENTITY(1,1) NOT NULL,
  meaning VARCHAR(100) NOT NULL DEFAULT NULL,
  sort_order integer,
  CONSTRAINT pk_treatment_frequency PRIMARY KEY (rowid )
);

CREATE TABLE ehr_lookups.urinalysis_method
(
  method VARCHAR(255) NOT NULL,
  CONSTRAINT pk_urinalysis_method PRIMARY KEY (method )
);

CREATE TABLE ehr_lookups.urinalysis_qualitative_results
(
  result VARCHAR(255) NOT NULL,
  CONSTRAINT pk_urinalysis_qualitative_results PRIMARY KEY (result )
);

CREATE TABLE ehr_lookups.urinalysis_tests
(
  testid VARCHAR(100) NOT NULL,
  name VARCHAR(100),
  units VARCHAR(100),
  alertonabnormal bit DEFAULT 1,
  alertonany bit DEFAULT 0,
  includeinpanel bit DEFAULT 0,
  sort_order integer,
  CONSTRAINT pk_urinalysis_tests PRIMARY KEY (testid )
);

CREATE TABLE ehr_lookups.usda_codes
(
  rowid INT IDENTITY(1,1) NOT NULL,
  code VARCHAR(100),
  category VARCHAR(100),
  usda_letter VARCHAR(10),
  include_previous bit DEFAULT 0,
  keyword VARCHAR(255),
  CONSTRAINT pk_usda_codes PRIMARY KEY (rowid )
);

CREATE TABLE ehr_lookups.viral_status
(
  viral_status VARCHAR(255) NOT NULL,
  CONSTRAINT pk_viral_status PRIMARY KEY (viral_status )
);

CREATE TABLE ehr_lookups.virology_method
(
  method VARCHAR(255) NOT NULL,
  CONSTRAINT pk_virology_method PRIMARY KEY (method )
);

CREATE TABLE ehr_lookups.virology_source
(
  source VARCHAR(255) NOT NULL,
  code VARCHAR(255),
  CONSTRAINT pk_virology_source PRIMARY KEY (source )
);

CREATE TABLE ehr_lookups.virology_tests
(
  testid VARCHAR(255) NOT NULL,
  alertonabnormal bit DEFAULT 1,
  alertonany bit DEFAULT 0,
  includeinpanel bit DEFAULT 0,
  sort_order integer,
  CONSTRAINT pk_virology_tests PRIMARY KEY (testid )
);

CREATE TABLE ehr_lookups.volume_units
(
  unit VARCHAR(100) NOT NULL,
  CONSTRAINT pk_volume_units PRIMARY KEY (unit )
);

CREATE TABLE ehr_lookups.weight_ranges
(
  species VARCHAR(255) NOT NULL,
  min_weight double precision,
  max_weight double precision,
  CONSTRAINT pk_weight_ranges PRIMARY KEY (species )
);

CREATE TABLE ehr_lookups.yesno
(
  value VARCHAR(255) NOT NULL,
  CONSTRAINT pk_yesno PRIMARY KEY (value )
);







