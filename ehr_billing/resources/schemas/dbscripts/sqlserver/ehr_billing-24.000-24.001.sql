IF OBJECT_ID(N'ehr_billing.procedureQueryChargeIdAssoc', N'U') IS NULL
    BEGIN
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
END;
GO

IF NOT EXISTS(SELECT * FROM sys.indexes WHERE name = 'IDX_EHR_BILLING_PROCEDURE_QUERY_CHARGEID_ASSOC_CONTAINER' AND object_id = OBJECT_ID('ehr_billing.procedureQueryChargeIdAssoc'))
BEGIN
   CREATE INDEX IDX_EHR_BILLING_PROCEDURE_QUERY_CHARGEID_ASSOC_CONTAINER ON ehr_billing.procedureQueryChargeIdAssoc (container);
END;
GO