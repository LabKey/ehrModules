
ALTER TABLE ehr_compliancedb.completiondates
  ADD CONSTRAINT fk_completiondates_employeeid FOREIGN KEY (employeeid)
      REFERENCES ehr_compliancedb.employees (employeeid)
      ON UPDATE CASCADE;

ALTER TABLE ehr_compliancedb.completiondates
  ADD CONSTRAINT fk_completiondates_requirementname FOREIGN KEY (requirementname)
      REFERENCES ehr_compliancedb.requirements (requirementname)
      ON UPDATE CASCADE;

ALTER TABLE ehr_compliancedb.employeerequirementexemptions
  ADD CONSTRAINT fk_employeerequirementexemptions_employeeid FOREIGN KEY (employeeid)
      REFERENCES ehr_compliancedb.employees (employeeid)
      ON UPDATE CASCADE;

ALTER TABLE ehr_compliancedb.employeerequirementexemptions
  ADD CONSTRAINT fk_employeerequirementexemptions_requirementname FOREIGN KEY (requirementname)
      REFERENCES ehr_compliancedb.requirements (requirementname)
      ON UPDATE CASCADE;

ALTER TABLE ehr_compliancedb.employees
  ADD CONSTRAINT fk_employees_type FOREIGN KEY (type)
      REFERENCES ehr_compliancedb.employeetypes (type)
      ON UPDATE CASCADE;

ALTER TABLE ehr_compliancedb.employees
  ADD CONSTRAINT fk_employees_category FOREIGN KEY (category)
      REFERENCES ehr_compliancedb.employeecategory (categoryname)
      ON UPDATE CASCADE;

ALTER TABLE ehr_compliancedb.employees
  ADD CONSTRAINT fk_employees_title FOREIGN KEY (title)
      REFERENCES ehr_compliancedb.employeetitles (title)
      ON UPDATE CASCADE;

ALTER TABLE ehr_compliancedb.employees
  ADD CONSTRAINT fk_employees_unit FOREIGN KEY (unit)
      REFERENCES ehr_compliancedb.unit_names (unit)
      ON UPDATE CASCADE;

ALTER TABLE ehr_compliancedb.employees
  ADD CONSTRAINT fk_employees_location FOREIGN KEY (location)
      REFERENCES ehr_compliancedb.employeelocations (location)
      ON UPDATE CASCADE;

ALTER TABLE ehr_compliancedb.requirements
  ADD CONSTRAINT fk_requirements_type FOREIGN KEY (type)
      REFERENCES ehr_compliancedb.requirementtype (type)
      ON UPDATE CASCADE;

ALTER TABLE ehr_compliancedb.requirementspercategory
  ADD CONSTRAINT fk_requirementspercategory_requirementname FOREIGN KEY (requirementname)
      REFERENCES ehr_compliancedb.requirements (requirementname)
      ON UPDATE CASCADE;

ALTER TABLE ehr_compliancedb.requirementspercategory
  ADD CONSTRAINT fk_requirementspercategory_category FOREIGN KEY (category)
      REFERENCES ehr_compliancedb.employeecategory (categoryname)
      ON UPDATE CASCADE;

ALTER TABLE ehr_compliancedb.requirementspercategory
  ADD CONSTRAINT fk_requirementspercategory_unit FOREIGN KEY (unit)
      REFERENCES ehr_compliancedb.unit_names (unit)
      ON UPDATE CASCADE;

ALTER TABLE ehr_compliancedb.requirementsperemployee
  ADD CONSTRAINT fk_requirementsperemployee_employeeid FOREIGN KEY (employeeid)
      REFERENCES ehr_compliancedb.employees (employeeid)
      ON UPDATE CASCADE;

ALTER TABLE ehr_compliancedb.requirementsperemployee
  ADD CONSTRAINT fk_requirementsperemployee_requirementname FOREIGN KEY (requirementname)
      REFERENCES ehr_compliancedb.requirements (requirementname)
      ON UPDATE CASCADE;

ALTER TABLE ehr_compliancedb.sopbycategory
  ADD CONSTRAINT fk_sopbycategory_category FOREIGN KEY (category)
      REFERENCES ehr_compliancedb.employeecategory (categoryname)
      ON UPDATE CASCADE;

ALTER TABLE ehr_compliancedb.sopdates
  ADD CONSTRAINT fk_sopdates_employeeid FOREIGN KEY (employeeid)
      REFERENCES ehr_compliancedb.employees (employeeid)
      ON UPDATE CASCADE;
