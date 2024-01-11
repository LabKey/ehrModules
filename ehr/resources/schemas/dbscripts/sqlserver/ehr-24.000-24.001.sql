CREATE PROCEDURE ehr.handleUpgrade AS
BEGIN
    IF NOT EXISTS(SELECT column_name
            FROM information_schema.columns
            WHERE table_name='notificationrecipients' and table_schema='ehr' and column_name='Lsid')
BEGIN

ALTER TABLE ehr.notificationrecipients ADD Lsid LsidType null;
END
END;
GO

EXEC ehr.handleUpgrade
GO

DROP PROCEDURE ehr.handleUpgrade
    GO