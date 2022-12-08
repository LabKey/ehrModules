--Create a new table to store the procedure pain categories.
CREATE TABLE ehr_lookups.Procedure_PainCategories
(
    rowid INT IDENTITY(1,1) NOT NULL,
    value VARCHAR(50) NOT NULL,
    description VARCHAR(250),
    createdby userid NOT NULL,
    created datetime NOT NULL,
    dateDisabled datetime
);