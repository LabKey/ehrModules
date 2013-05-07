--NOTE: this is only created on SQLServer since PG doesnt support INCLUDE
CREATE INDEX snomed_code_include_meaning ON ehr_lookups.snomed (code) INCLUDE (meaning);


