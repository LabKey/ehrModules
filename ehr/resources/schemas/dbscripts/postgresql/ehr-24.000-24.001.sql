CREATE FUNCTION ehr.handleUpgrade() RETURNS VOID AS $$
DECLARE
BEGIN
      IF NOT EXISTS (
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name='notificationrecipients' and table_schema='ehr' and column_name='LSID'
      )
      THEN

ALTER TABLE ehr.notificationrecipients ADD COLUMN LSID LSIDtype;
END IF;
END;
$$ LANGUAGE plpgsql;

SELECT ehr.handleUpgrade();

DROP FUNCTION ehr.handleUpgrade();