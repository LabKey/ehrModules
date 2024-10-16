CREATE TABLE ehr_billing.procedureQueryChargeIdAssoc (

   rowId INT IDENTITY(1,1) NOT NULL,
   schemaName nvarchar(200) NOT NULL,
   queryName nvarchar(500) NOT NULL,
   description nvarchar(2000) NOT NULL,
   chargeId int NOT NULL,

   container ENTITYID NOT NULL,
   createdBy USERID,
   created DATETIME,
   modifiedBy USERID,
   modified DATETIME,

   CONSTRAINT PK_procedureQueryChargeIdAssociations PRIMARY KEY (rowId),
   CONSTRAINT FK_EHR_BILLING_PROCEDURE_QUERY_CHARGEID_ASSOC_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE INDEX IDX_EHR_BILLING_PROCEDURE_QUERY_CHARGEID_ASSOC_CONTAINER ON ehr_billing.procedureQueryChargeIdAssoc (container);