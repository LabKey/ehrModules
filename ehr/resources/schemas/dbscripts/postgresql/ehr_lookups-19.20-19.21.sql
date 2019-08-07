-- Handle upgrade for ONPRC which had a 17.20-17.21 script to do this change

DO $$
BEGIN

  IF (SELECT NOT EXISTS (select * from pg_attribute a inner join pg_class c on (a.attrelid = c.oid) inner join pg_namespace n on (n.oid = c.relnamespace) where lower(a.attname)='datedisabled' and lower(c.relname)='flag_categories' and lower(n.nspname) = 'ehr_lookups')) THEN
    ALTER TABLE ehr_lookups.flag_categories ADD COLUMN datedisabled TIMESTAMP;
  END IF;

END $$;
