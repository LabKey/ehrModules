CREATE TABLE ehr_billing.procedureQueryChargeIdAssoc (

   rowId SERIAL NOT NULL,
   schemaName varchar(200) NOT NULL,
   queryName varchar(500) NOT NULL,
   description varchar(2000) NOT NULL,
   chargeId int NOT NULL,

   container ENTITYID NOT NULL,
   createdBy USERID,
   created timestamp,
   modifiedBy USERID,
   modified timestamp,

   CONSTRAINT PK_procedureQueryChargeIdAssociations PRIMARY KEY (rowId),
   CONSTRAINT FK_EHR_BILLING_PROCEDURE_QUERY_CHARGEID_ASSOC_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE INDEX IDX_EHR_BILLING_PROCEDURE_QUERY_CHARGEID_ASSOC_CONTAINER ON ehr_billing.procedureQueryChargeIdAssoc (container);